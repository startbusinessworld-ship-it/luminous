const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const test=require('node:test');
const source=fs.readFileSync('lib/formation-order.cjs','utf8');
function setup(options={}){
 const m={exports:{}};vm.runInNewContext(source,{module:m,require:()=>({PRODUCTS:{creation:{amount:149000,name:'Hong Kong company formation'}},fulfill:async()=>false}),Date,Error,Object});
 const orders=new Map(),sessions=new Map(),receipts=new Set(options.paid?['user-1']:[]),creation=new Map();let calls=0,failAttach=!!options.failAttach;
 const db={from(table){let user;return{select(){return this},eq(key,value){if(key==='user_id')user=value;return this},async maybeSingle(){return {data:orders.get(user)||null,error:options.readError?{}:null}},async limit(){return {data:table==='payment_receipts'&&receipts.has(user)?[{stripe_session_id:'cs_paid'}]:table==='dossiers'&&options.legacy?[{id:'legacy'}]:[],error:options.readError?{}:null}}}},async rpc(name,a){
  let o=orders.get(a.p_user_id);
  if(name==='reserve_formation_checkout'){
   if(receipts.has(a.p_user_id))return{data:{state:'paid'}};
   if(options.legacy)return{data:{state:'review_required'}};
   if(!o){o={id:'order-'+a.p_user_id,user_id:a.p_user_id,email:a.p_email,details:a.p_details,state:'checkout_open',attempt_key:'key-'+a.p_user_id,attempt_started_at:new Date().toISOString(),stripe_session_id:null};orders.set(a.p_user_id,o);}
  }else if(name==='attach_formation_checkout'){
   if(failAttach){failAttach=false;return {error:{}};}
   if(o.attempt_key!==a.p_attempt_key || o.stripe_session_id&&o.stripe_session_id!==a.p_session_id)return{error:{}};
   o.stripe_session_id=a.p_session_id;
  }else if(name==='reset_expired_formation_checkout'){
   if(o.attempt_key===a.p_attempt_key&&o.stripe_session_id===a.p_session_id){o.attempt_key+='-next';o.stripe_session_id=null;o.attempt_started_at=new Date().toISOString();}
  }else if(name==='complete_formation_order'){
   if(o.attempt_key!==a.p_attempt_key || a.p_amount!==149000)return{error:{}};
   o.state='paid';o.stripe_session_id=a.p_session_id;receipts.add(o.user_id);
  }else throw Error('Unexpected RPC '+name);
  return{data:o?structuredClone(o):null};
 }};
 const stripe={checkout:{sessions:{async create(params,opts){calls++;
  if(!creation.has(opts.idempotencyKey)){
   const s={id:'cs_test_'+(creation.size+1),status:'open',payment_status:'unpaid',mode:'payment',currency:'usd',amount_total:149000,client_reference_id:params.client_reference_id,metadata:params.metadata,url:'https://checkout.stripe.com/c/pay/test'+(creation.size+1)};
   creation.set(opts.idempotencyKey,{params,s});sessions.set(s.id,s);
  }
  return creation.get(opts.idempotencyKey).s;
 },async retrieve(id){if(options.stripeError)throw Error('network');if(!sessions.has(id))throw Error('unknown session');return sessions.get(id);}}}};
 const args={db,stripe,user:{id:'user-1',email:'owner@example.invalid'},details:{company_name:'Example Limited',business_activity:'International trade',country:'France'}};
 return {...m.exports,args,orders,sessions,receipts,creation,get calls(){return calls}};
}
test('concurrent clicks and two tabs share one session and immutable snapshot',async()=>{
 const x=setup();const results=await Promise.all(Array.from({length:8},()=>x.startFormation(x.args)));
 assert.equal(new Set(results.map(r=>r.url)).size,1);assert.equal(x.creation.size,1);
 const data=[...x.creation.values()][0].params;
 assert.equal(data.payment_intent_data.receipt_email,'owner@example.invalid');assert.equal(data.line_items[0].price_data.unit_amount,149000);
 assert.ok(data.success_url.startsWith('https://luminoscorp.com/'));
 await x.startFormation({...x.args,user:{...x.args.user,email:'changed@example.invalid'}});assert.equal(x.creation.size,1);
});
test('already paid and legacy unresolved clients are never offered a second payment',async()=>{
 for(const opts of [{paid:true},{legacy:true}]){const x=setup(opts);const r=await x.startFormation(x.args);assert.ok(['paid','review_required'].includes(r.status));assert.equal(x.calls,0);}
});
test('lost response or failed persistence reuses the same Stripe idempotency key',async()=>{
 const x=setup({failAttach:true});await assert.rejects(x.startFormation(x.args));const r=await x.startFormation(x.args);assert.equal(r.status,'checkout_open');assert.equal(x.creation.size,1);
});
test('paid return settles before offering another checkout; retries do not reset payment',async()=>{
 const x=setup();await x.startFormation(x.args);const s=[...x.sessions.values()][0];s.status='complete';s.payment_status='paid';
 assert.equal((await x.startFormation(x.args)).status,'paid');await x.settle(s,x.args.db);assert.equal(x.orders.get('user-1').state,'paid');assert.equal(x.creation.size,1);
});
test('delayed payment stays processing and cannot open another session',async()=>{
 const x=setup();await x.startFormation(x.args);const s=[...x.sessions.values()][0];s.status='complete';
 const r=await x.startFormation(x.args);assert.equal(r.status,'processing');assert.equal(x.creation.size,1);assert.equal(await x.settle(s,x.args.db),false);
});
test('only a confirmed expired unpaid session can rotate its key',async()=>{
 const x=setup();await x.startFormation(x.args);[...x.sessions.values()][0].status='expired';
 const results=await Promise.all([x.startFormation(x.args),x.startFormation(x.args)]);assert.equal(x.creation.size,2);assert.equal(new Set(results.map(r=>r.url)).size,1);
});
test('old uncertain idempotency requests stop for review, not a new charge',async()=>{
 const x=setup({failAttach:true});await assert.rejects(x.startFormation(x.args));x.orders.get('user-1').attempt_started_at=new Date(Date.now()-24*3600*1000).toISOString();
 assert.equal((await x.startFormation(x.args)).status,'review_required');assert.equal(x.creation.size,1);
});
test('wrong account, mismatched amount and forged attempt cannot fulfill',async()=>{
 const x=setup();await x.startFormation(x.args);const s=[...x.sessions.values()][0];s.payment_status='paid';
 for(const bad of [{...s,amount_total:1},{...s,client_reference_id:'attacker'},{...s,metadata:{...s.metadata,attempt_key:'forged'}}])await assert.rejects(x.settle(bad,x.args.db));
 await assert.rejects(x.paymentStatus({...x.args,user:{id:'attacker'},sessionId:s.id}));assert.equal(x.receipts.size,0);
});
test('malformed project and unavailable database do not create a checkout',async()=>{
 const x=setup();await assert.rejects(x.startFormation({...x.args,details:{company_name:'test'}}));assert.equal(x.creation.size,0);
 const y=setup({readError:true});await assert.rejects(y.paymentStatus(y.args));
});
