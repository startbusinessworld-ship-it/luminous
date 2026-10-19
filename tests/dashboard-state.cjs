const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../dashboard.html'), 'utf8');
for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
const stateCode = html.slice(html.indexOf('const STATUS_ORDER'), html.indexOf('// ── INIT'));
const context = vm.createContext({});
vm.runInContext(stateCode + '\nthis.progress = getProgressState;', context);
const paid = context.progress('payment_confirmed');
assert.equal(paid.hasPaid, true);
assert.equal(paid.hasSubmittedDocs, false);
const submitted = context.progress('docs_submitted');
assert.equal(submitted.stepClass('pending'), 'done');
assert.equal(submitted.stepClass('payment_confirmed'), 'done');
assert.equal(submitted.stepClass('docs_verified'), 'prog');
assert.equal(submitted.stepClass('filing'), 'wait');
for (const status of ['docs_submitted','docs_verified','filing','certificate_issued','bank_opened','completed']) {
 assert.equal(context.progress(status).hasSubmittedDocs, true, status);
}
for (const status of ['pending', 'unknown']) assert.equal(context.progress(status).hasPaid, false);
for (const key of ['pending','payment_confirmed','docs_verified','filing','certificate_issued','bank_opened','completed']) {
 assert.equal(context.progress('completed').stepClass(key), 'done');
}
assert.equal(context.progress('bank_opened').stepClass('bank_opened'), 'prog');
assert.equal(context.progress('bank_opened').stepClass('completed'), 'wait');
// A bad URL tab must leave the current panel visible, and valid navigation syncs mobile state.
const classes = new Set(['panel', 'act']);
const panel = {classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k)}};
let mobile;
context.document = {getElementById:id=>id==='panel-process'?panel:null,querySelectorAll:q=>q==='.panel'?[panel]:[]};
context.window = {scrollTo(){}};
context.setMobileNav = name=>{mobile=name;};
vm.runInContext(html.slice(html.indexOf('function show(name)'), html.indexOf('//  STRIPE CONNECT PAYOUT')), context);
context.show('invalid');assert.ok(classes.has('act'));
context.show('process');assert.equal(mobile,'progress');assert.ok(classes.has('act'));
// A successful submission must refresh the in-memory dossier before rendering.
const nodes = Object.fromEntries(['name1','name2','name3','activity','submit-msg','submit-error','button'].map(id=>[id,{value:id,style:{},textContent:''}]));
let rendered;
Object.assign(context,{currentUser:{id:'test-user'},dossier:{id:'test-dossier',status:'payment_confirmed'},profile:{full_name:'Test'},T:{en:{}},getLang:()=> 'en',alert:()=>assert.fail('Unexpected alert'),renderProcess:()=>{rendered=context.dossier.status;},SB:{from:()=>({upsert:async()=>({error:null}),insert:async()=>({error:null})})}});
context.document={getElementById:id=>nodes[id],querySelector:()=>nodes.button};
vm.runInContext(html.slice(html.indexOf('async function submitDossier()'),html.indexOf('// ── OFFICIAL DOCS')),context);
(async()=>{await context.submitDossier();assert.equal(rendered,'docs_submitted');assert.equal(context.dossier.id,'test-dossier');assert.equal(context.dossier.company_name,'name1');console.log('PASS: dashboard script syntax, status progression, bank/completion states, invalid navigation and post-submission refresh.');})().catch(e=>{console.error(e);process.exitCode=1;});
