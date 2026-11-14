const {PRODUCTS, fulfill} = require('./payment.cjs');
const ORIGIN = 'https://luminoscorp.com';
function projectDetails(input) {
  const fields = {company_name:120, business_activity:2000, country:100};
  const result = {};
  for (const [key, max] of Object.entries(fields)) {
    const value = typeof input?.[key] === 'string' ? input[key].trim() : '';
    if (!value || value.length > max) throw Object.assign(new Error('Complete your company name, activity and country.'), {status:400});
    result[key] = value;
  }
  return result;
}
async function rpc(db, name, args) {
  const {data,error} = await db.rpc(name,args);
  if (error) throw new Error('Payment persistence unavailable');
  return data;
}
async function orderFor(db,userId) {
  const {data,error} = await db.from('formation_orders').select('*').eq('user_id',userId).maybeSingle();
  if (error) throw new Error('Payment lookup unavailable');
  return data;
}
function ownsSession(session, order) {
  return session.metadata?.integration === 'luminos_checkout_v2' &&
    session.client_reference_id === order.user_id && session.metadata?.user_id === order.user_id &&
    session.metadata?.order_id === order.id && session.metadata?.attempt_key === order.attempt_key;
}
async function settle(session,db) {
  if (session.metadata?.integration !== 'luminos_checkout_v2') return fulfill(session,db);
  const order = await orderFor(db,session.metadata?.user_id);
  if (!order || !ownsSession(session,order) || session.mode !== 'payment' ||
      session.metadata?.product_type !== 'creation' || session.currency !== 'usd' ||
      session.amount_total !== PRODUCTS.creation.amount) throw new Error('Payment identity mismatch');
  if (session.payment_status !== 'paid') return false;
  await rpc(db,'complete_formation_order',{
    p_user_id:order.user_id, p_attempt_key:order.attempt_key, p_session_id:session.id,
    p_amount:session.amount_total
  });
  return true;
}
async function refreshOrder(order,db,stripe) {
  if (!order?.stripe_session_id || order.state === 'paid') return {order,session:null};
  const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
  if (!ownsSession(session,order)) throw new Error('Payment identity mismatch');
  if (session.payment_status === 'paid') {
    await settle(session,db);
    order = await orderFor(db,order.user_id);
  }
  return {order,session};
}
async function startFormation({db,stripe,user,details,now=Date.now()}) {
  if (!user.email) throw Object.assign(new Error('Confirm your account email first.'),{status:400});
  let order = await rpc(db,'reserve_formation_checkout',{p_user_id:user.id,p_email:user.email,p_details:projectDetails(details)});
  if (order.state === 'paid') return {status:'paid',can_upload:true};
  if (order.state === 'review_required') return {status:'review_required',can_upload:false};
  let refreshed = await refreshOrder(order,db,stripe);
  order = refreshed.order;
  const session = refreshed.session;
  if (order.state === 'paid') return {status:'paid',can_upload:true};
  if (session?.status === 'complete') return {status:'processing',can_upload:false};
  if (session?.status === 'open') return {status:'checkout_open',url:session.url};
  if (session) {
    if (session.status !== 'expired' || session.payment_status !== 'unpaid') throw new Error('Uncertain payment state');
    order = await rpc(db,'reset_expired_formation_checkout',{
      p_user_id:user.id,p_session_id:session.id,p_attempt_key:order.attempt_key
    });
    if (order.state === 'paid') return {status:'paid',can_upload:true};
    if (order.stripe_session_id) return {status:'processing',can_upload:false};
  }
  // Stripe can discard idempotency keys after 24h. Never reuse an uncertain old request.
  if (now - Date.parse(order.attempt_started_at) >= 23*60*60*1000) return {status:'review_required',can_upload:false};
  const product=PRODUCTS.creation;
  const created = await stripe.checkout.sessions.create({
    mode:'payment',payment_method_types:['card'],customer_email:order.email,
    client_reference_id:user.id,
    line_items:[{price_data:{currency:'usd',unit_amount:product.amount,product_data:{name:product.name}},quantity:1}],
    metadata:{integration:'luminos_checkout_v2',product_type:'creation',user_id:user.id,order_id:order.id,attempt_key:order.attempt_key},
    payment_intent_data:{receipt_email:order.email,description:'Luminos — Hong Kong company formation'},
    success_url:ORIGIN+'/dashboard?payment=return&session_id={CHECKOUT_SESSION_ID}',
    cancel_url:ORIGIN+'/dashboard?payment=cancelled'
  },{idempotencyKey:'formation-'+order.attempt_key});
  await rpc(db,'attach_formation_checkout',{p_user_id:user.id,p_attempt_key:order.attempt_key,p_session_id:created.id});
  if(created.payment_status==='paid') {await settle(created,db);return {status:'paid',can_upload:true};}
  if(created.status==='complete') return {status:'processing',can_upload:false};
  if(created.status!=='open' || !created.url) throw new Error('Checkout unavailable');
  return {status:'checkout_open',url:created.url};
}
async function paymentStatus({db,stripe,user,sessionId}) {
  const receipts = await db.from('payment_receipts').select('stripe_session_id').eq('user_id',user.id).eq('product_type','creation').limit(1);
  if(receipts.error)throw new Error('Payment lookup unavailable');
  if(receipts.data?.length) return {status:'paid',can_upload:true};
  let order=await orderFor(db,user.id);
  if(sessionId) {
    if(typeof sessionId!=='string' || !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId))throw Object.assign(new Error('Invalid checkout reference'),{status:400});
    const session=await stripe.checkout.sessions.retrieve(sessionId);
    if(!order || !ownsSession(session,order))throw Object.assign(new Error('This payment belongs to another order.'),{status:403});
    if(session.payment_status==='paid') {await settle(session,db);order=await orderFor(db,user.id);}
    else if(session.status==='complete')return {status:'processing',can_upload:false};
  }
  const refreshed=await refreshOrder(order,db,stripe);order=refreshed.order;
  if(order) return {status:order.state==='paid'?'paid':order.state==='review_required'?'review_required':refreshed.session?.status==='complete'?'processing':'checkout_open',can_upload:order.state==='paid',details:order.details};
  const legacy=await db.from('dossiers').select('id').eq('user_id',user.id).limit(1);
  if(legacy.error)throw new Error('Dossier lookup unavailable');
  return {status:legacy.data?.length?'review_required':'draft',can_upload:false};
}
module.exports={projectDetails,ownsSession,settle,startFormation,paymentStatus};
