const {services,fulfill}=require('../lib/payment.cjs');
async function handler(req,res){
 if(req.method!=='POST')return res.status(405).end();
 let db,stripe;
 try{({db,stripe}=services());}catch{return res.status(503).end();}
 let event;
 try{
  const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));
  event=stripe.webhooks.constructEvent(Buffer.concat(chunks),req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);
 }catch{return res.status(400).json({error:'Invalid webhook signature'});}
 if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){
  try{await fulfill(event.data.object,db);}catch{
   // A non-2xx response lets Stripe retry after a database outage.
   console.error('Payment fulfillment failed',event.id);
   return res.status(500).json({error:'Payment processing failed'});
  }
 }
 return res.status(200).json({received:true});
}
module.exports=handler;
module.exports.config={api:{bodyParser:false}};
