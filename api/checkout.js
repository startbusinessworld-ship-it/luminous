const {PRODUCTS,services,authenticatedUser}=require('../lib/payment.cjs');
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 try{
  const {db,stripe}=services();
  const user=await authenticatedUser(req,db);
  if(!user)return res.status(401).json({error:'Please sign in again.'});
  const type=req.body?.type;
  if(!Object.hasOwn(PRODUCTS,type || ''))return res.status(400).json({error:'Invalid product'});
  // Refuse to take payment until the database migration is available.
  const readiness=await db.from('payment_receipts').select('stripe_session_id').limit(0);
  if(readiness.error)return res.status(503).json({error:'Checkout is temporarily unavailable. Please contact our team.'});
  const product=PRODUCTS[type];
  const session=await stripe.checkout.sessions.create({
   mode:'payment',payment_method_types:['card'],customer_email:user.email,
   client_reference_id:user.id,
   line_items:[{price_data:{currency:'usd',unit_amount:product.amount,product_data:{name:product.name}},quantity:1}],
   metadata:{integration:'luminos_checkout_v1',user_id:user.id,product_type:type},
   success_url:'https://www.luminoscorp.com/dashboard?payment=return&session_id={CHECKOUT_SESSION_ID}',
   cancel_url:'https://www.luminoscorp.com/dashboard?payment=cancelled'
  });
  return res.status(200).json({url:session.url});
 }catch(error){console.error('Checkout failed',error.type || 'configuration_or_service_error');return res.status(503).json({error:'Checkout is temporarily unavailable. Please try again or contact our team.'});}
};
