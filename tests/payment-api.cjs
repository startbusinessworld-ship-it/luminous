const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(path,lib){const m={exports:{}};vm.runInNewContext(fs.readFileSync(path,'utf8'),{module:m,require:()=>lib,console:{error(){}},Buffer,process:{env:{STRIPE_WEBHOOK_SECRET:'test-only'}}});return m.exports;}
function response(){return{code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(v){this.body=v;return this},end(){return this}};}
(async()=>{
 let user=null,created=0,args,ready=true;
 const lib={PRODUCTS:{creation:{name:'Creation',amount:149000},renewal:{name:'Renewal',amount:99000}},authenticatedUser:async()=>user,services:()=>({db:{from:()=>({select:()=>({limit:async()=>({error:ready?null:{}})})})},stripe:{checkout:{sessions:{create:async x=>{created++;args=x;return{url:'https://checkout.stripe.com/test'}}}}}})};
 const checkout=load('api/checkout.js',lib);
 let r=response();await checkout({method:'POST',headers:{},body:{type:'creation'}},r);assert.equal(r.code,401);assert.equal(created,0);
 user={id:'user-1',email:'test@example.invalid'};
 r=response();await checkout({method:'POST',headers:{origin:'https://attacker.invalid'},body:{type:'creation',amount:1,user_id:'attacker'}},r);assert.equal(r.code,200);assert.equal(args.line_items[0].price_data.unit_amount,149000);assert.equal(args.metadata.user_id,'user-1');assert.ok(args.success_url.startsWith('https://www.luminoscorp.com/'));
 r=response();await checkout({method:'POST',headers:{},body:{type:'toString'}},r);assert.equal(r.code,400);
 ready=false;r=response();await checkout({method:'POST',headers:{},body:{type:'creation'}},r);assert.equal(r.code,503);assert.equal(created,1);
 let event={id:'evt_test',type:'checkout.session.completed',data:{object:{}}},badSignature=false,fail=false,fulfilled=0;
 const webhook=load('api/webhook.js',{services:()=>({db:{},stripe:{webhooks:{constructEvent(){if(badSignature)throw Error();return event;}}}}),fulfill:async()=>{fulfilled++;if(fail)throw Error();}});
 const request=()=>({method:'POST',headers:{'stripe-signature':'test'},async *[Symbol.asyncIterator](){yield Buffer.from('{}')}});
 badSignature=true;r=response();await webhook(request(),r);assert.equal(r.code,400);assert.equal(fulfilled,0);
 badSignature=false;fail=true;r=response();await webhook(request(),r);assert.equal(r.code,500);
 fail=false;r=response();await webhook(request(),r);assert.equal(r.code,200);
 event.type='checkout.session.async_payment_succeeded';r=response();await webhook(request(),r);assert.equal(r.code,200);assert.equal(fulfilled,3);
 console.log('PASS: authentication, fixed price and account metadata, fixed return origin, missing-migration fail-closed, signature rejection, retryable database error, async success.');
})().catch(e=>{console.error(e);process.exitCode=1});
