const {services,authenticatedUser}=require('../lib/payment.cjs');
const {paymentStatus}=require('../lib/formation-order.cjs');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const {db,stripe}=services();const user=await authenticatedUser(req,db);
    if(!user)return res.status(401).json({error:'Please sign in again.'});
    return res.status(200).json(await paymentStatus({db,stripe,user,sessionId:req.body?.session_id}));
  }catch(error){return res.status(error.status || 503).json({error:'Payment verification unavailable. Do not pay again; refresh or contact our team.'});}
};
