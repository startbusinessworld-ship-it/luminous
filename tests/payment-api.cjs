const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
function load(path,deps,env={}){const m={exports:{}};vm.runInNewContext(fs.readFileSync(path,'utf8'),{module:m,require:name=>deps[name],console:{error(){}},Buffer,process:{env}});return m.exports;}
function response(){return {code:200,setHeader(){},status(n){this.code=n;return this},json(v){this.body=v;return this},end(){return this}};}
test('checkout authenticates before charging; activation gate and invalid service stop Stripe',async()=>{
 let user=null,called=0;
 const deps={'../lib/payment.cjs':{services:()=>({db:{},stripe:{}}),authenticatedUser:async()=>user},'../lib/formation-order.cjs':{startFormation:async a=>{called++;assert.equal(a.user.id,'verified-user');return{status:'paid'}}}};
 const env={LUMINOS_CHECKOUT_ENABLED:'true'};const fn=load('api/checkout.js',deps,env);
 const req={method:'POST',body:{type:'creation',user_id:'forged',amount:1},headers:{origin:'https://invalid.example'}};
 let r=response();await fn(req,r);assert.equal(r.code,401);assert.equal(called,0);
 user={id:'verified-user'};env.LUMINOS_CHECKOUT_ENABLED='false';r=response();await fn(req,r);assert.equal(r.code,503);assert.equal(called,0);
 env.LUMINOS_CHECKOUT_ENABLED='true';r=response();await fn({...req,body:{type:'renewal'}},r);assert.equal(r.code,400);assert.equal(called,0);
 r=response();await fn(req,r);assert.equal(r.body.status,'paid');assert.equal(called,1);
});
test('webhook rejects bad signatures/wrong mode and returns retryable database errors',async()=>{
 let signatureBad=true,fail=false,calls=0,event={id:'evt_test',livemode:false,type:'checkout.session.completed',data:{object:{}}};
 const fn=load('api/webhook.js',{'../lib/payment.cjs':{services:()=>({db:{},stripe:{webhooks:{constructEvent(){if(signatureBad)throw Error();return event}}}})},'../lib/formation-order.cjs':{settle:async()=>{calls++;if(fail)throw Error('db unavailable')}}},{LUMINOS_PAYMENT_MODE:'test'});
 const req=()=>({method:'POST',headers:{'stripe-signature':'test'},async *[Symbol.asyncIterator](){yield Buffer.from('{}')}});
 let r=response();await fn(req(),r);assert.equal(r.code,400);assert.equal(calls,0);
 signatureBad=false;event.livemode=true;r=response();await fn(req(),r);assert.equal(r.code,400);assert.equal(calls,0);
 event.livemode=false;fail=true;r=response();await fn(req(),r);assert.equal(r.code,500);
 fail=false;event.type='checkout.session.async_payment_succeeded';r=response();await fn(req(),r);assert.equal(r.code,200);assert.equal(calls,2);
});
test('payment status is authenticated and fails closed on unavailable verification',async()=>{
 let user=null,fail=false;
 const fn=load('api/payment-status.js',{'../lib/payment.cjs':{services:()=>({db:{},stripe:{}}),authenticatedUser:async()=>user},'../lib/formation-order.cjs':{paymentStatus:async()=>{if(fail)throw Error();return{status:'processing',can_upload:false}}}});
 const req={method:'POST',body:{},headers:{}};let r=response();await fn(req,r);assert.equal(r.code,401);
 user={id:'user'};r=response();await fn(req,r);assert.equal(r.body.can_upload,false);
 fail=true;r=response();await fn(req,r);assert.equal(r.code,503);assert.ok(!r.body.can_upload);
});
