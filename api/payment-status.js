const {services,authenticatedUser,fulfill,paidProduct}=require('../lib/payment.cjs');
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 try{
  const {db,stripe}=services();const user=await authenticatedUser(req,db);
  if(!user)return res.status(401).json({error:'Please sign in again.'});
  const id=req.body?.session_id;
  if(id){
   if(typeof id!=='string'||!/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(id))return res.status(400).json({error:'Invalid session'});
   const session=await stripe.checkout.sessions.retrieve(id);
   if(session.metadata?.user_id!==user.id || session.client_reference_id!==user.id)return res.status(403).json({error:'Payment does not belong to this account'});
   if(paidProduct(session))await fulfill(session,db);
  }
  const {data,error}=await db.from('payment_receipts').select('stripe_session_id').eq('user_id',user.id).eq('product_type','creation').limit(1);
  if(error)throw error;
  return res.status(200).json({can_upload:!!data?.length});
 }catch{return res.status(503).json({error:'Payment verification unavailable. Please retry.'});}
};
