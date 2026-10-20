const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const PRODUCTS = Object.freeze({ creation: {amount:149000,name:'Hong Kong company formation'}, renewal:{amount:99000,name:'Hong Kong annual renewal'} });
function services() {
 const url=process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!url || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.STRIPE_SECRET_KEY) throw new Error('Payment service not configured');
 return {db:createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}}),stripe:new Stripe(process.env.STRIPE_SECRET_KEY)};
}
async function authenticatedUser(req,db) {
 const token=/^Bearer (.+)$/i.exec(req.headers.authorization || '')?.[1];
 if(!token)return null;
 const {data,error}=await db.auth.getUser(token);
 return error ? null : data?.user;
}
function paidProduct(session) {
 const type=session.metadata?.product_type;
 if(session.metadata?.integration!=='luminos_checkout_v1' || !Object.hasOwn(PRODUCTS,type || ''))return null;
 if(session.mode!=='payment' || session.payment_status!=='paid' || session.currency!=='usd' || session.amount_total!==PRODUCTS[type].amount)return null;
 const userId=session.metadata?.user_id;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || '') || session.client_reference_id!==userId)return null;
 return {type,userId};
}
async function fulfill(session,db) {
 const paid=paidProduct(session);
 if(!paid)return false;
 const {error}=await db.rpc('record_verified_payment',{p_session_id:session.id,p_user_id:paid.userId,p_product_type:paid.type,p_amount:session.amount_total});
 if(error)throw new Error('Payment persistence failed');
 return true;
}
module.exports={PRODUCTS,services,authenticatedUser,paidProduct,fulfill};
