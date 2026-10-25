// Dry-run by default. Needs server-side credentials; never put them in frontend files.
const {services,PRODUCTS}=require('../lib/payment.cjs');
async function main(){
 const {db,stripe}=services();const apply=process.argv.includes('--apply');
 let offset=0,verified=0,review=0;
 while(true){
  const {data:rows,error}=await db.from('dossiers').select('id,user_id,stripe_session_id').order('id').range(offset,offset+199);
  if(error)throw Error('Cannot read dossier/payment references');
  if(!rows.length)break;
  for(const row of rows){
   if(!row.stripe_session_id){review++;continue;}
   try{
    const session=await stripe.checkout.sessions.retrieve(row.stripe_session_id);
    const {data,error:userError}=await db.auth.admin.getUserById(row.user_id);
    if(userError||!data.user)throw Error('Account unavailable');
    const type=session.metadata?.product_type;
    const email=(session.customer_details?.email || session.customer_email || '').trim().toLowerCase();
    const expectedLink=type==='creation'?process.env.LEGACY_CREATION_PAYMENT_LINK_ID:process.env.LEGACY_RENEWAL_PAYMENT_LINK_ID;
    const legacySource=expectedLink && session.payment_link===expectedLink;
    const newSource=session.metadata?.integration==='luminos_checkout_v1' && session.metadata?.user_id===row.user_id && session.client_reference_id===row.user_id;
    if(!Object.hasOwn(PRODUCTS,type||'') || session.mode!=='payment' || session.payment_status!=='paid' || session.currency!=='usd' || session.amount_total!==PRODUCTS[type].amount || session.livemode!==true || !(newSource || legacySource) || (!newSource && (!email || email!==data.user.email?.trim().toLowerCase())))throw Error('Manual review required');
    const intent=await stripe.paymentIntents.retrieve(session.payment_intent,{expand:['latest_charge']});
    if(intent.status!=='succeeded' || !intent.latest_charge || intent.latest_charge.amount_refunded>0 || intent.latest_charge.disputed)throw Error('Refund/dispute review required');
    if(apply){const result=await db.rpc('record_verified_payment',{p_session_id:session.id,p_user_id:row.user_id,p_product_type:type,p_amount:session.amount_total});if(result.error)throw Error('Database write failed');}
    verified++;
   }catch{review++;}
  }
  offset+=rows.length;if(rows.length<200)break;
 }
 console.log(JSON.stringify({mode:apply?'apply':'dry-run',verified,needsManualReview:review}));
 if(review)process.exitCode=2;
}
main().catch(()=>{console.error('Reconciliation failed. Inspect configuration and database migration.');process.exitCode=1});
