const {services,authenticatedUser}=require('../lib/payment.cjs');
const {startFormation}=require('../lib/formation-order.cjs');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const {db,stripe}=services();
    const user=await authenticatedUser(req,db);
    if(!user)return res.status(401).json({error:'Please sign in again.'});
    if(req.body?.type!=='creation')return res.status(400).json({error:'For an annual renewal, contact our team to confirm your renewal period.'});
    if(process.env.LUMINOS_CHECKOUT_ENABLED!=='true')return res.status(503).json({error:'Checkout is being verified. Please contact our team; do not pay again.'});
    return res.status(200).json(await startFormation({db,stripe,user,details:req.body?.details}));
  }catch(error){
    console.error('Checkout unavailable',error.status || 'service_error');
    return res.status(error.status || 503).json({error:error.status===400?error.message:'We could not verify your payment. Please retry verification or contact our team; do not pay again.'});
  }
};
