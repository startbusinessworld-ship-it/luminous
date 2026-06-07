// /api/airwallex-webhook.js
// Handles Airwallex payment webhooks (replaces the Stripe encaissement webhook).
// On payment_intent.succeeded: create/find user, create/update dossier,
// handle affiliate commission, notify admin.

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Verify Airwallex webhook signature: HMAC-SHA256( timestamp + rawBody )
function verifySignature(rawBody, timestamp, signature) {
  const secret = process.env.AIRWALLEX_WEBHOOK_SECRET;
  if (!secret || !signature || !timestamp) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(timestamp + rawBody.toString('utf8'))
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// Tiered commission calculation (unchanged from Stripe webhook)
async function calculateCommission(affiliateId, productType) {
  if (productType === 'renewal') return 80;

  const startOfMonth = new Date();
  startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('referrals')
    .select('id', { count: 'exact' })
    .eq('affiliate_id', affiliateId)
    .eq('status', 'converted')
    .gte('created_at', startOfMonth.toISOString());

  const monthly = count || 0;
  if (monthly >= 10) return 250;
  if (monthly >= 4) return 200;
  return 150;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const timestamp = req.headers['x-timestamp'];
  const signature = req.headers['x-signature'];

  if (!verifySignature(rawBody, timestamp, signature)) {
    console.error('Airwallex webhook signature verification failed');
    return res.status(400).send('Invalid signature');
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    return res.status(400).send('Invalid payload');
  }

  if (event.name === 'payment_intent.succeeded') {
    const intent = event.data?.object || {};
    const metadata = intent.metadata || {};

    const billing =
      intent.latest_payment_attempt?.payment_method?.card?.billing ||
      intent.latest_payment_attempt?.billing ||
      {};

    const email = metadata.email || billing.email || '';
    const name = [billing.first_name, billing.last_name].filter(Boolean).join(' ') || '';
    const phone = billing.phone_number || '';
    const productType = metadata.product_type;
    const amountCents = Math.round((intent.amount || 0) * 100); // store in cents like before
    const companyName = '';

    console.log('✅ Airwallex payment received:', { email, productType, amount: intent.amount });

    if (!email) {
      console.error('No email on payment intent; cannot fulfil', intent.id);
      return res.status(200).json({ received: true });
    }

    try {
      // 1. Find or create user profile
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, referred_by')
        .eq('email', email)
        .single();

      let userId = existing?.id || metadata.user_id || null;
      const referredBy = existing?.referred_by;

      if (!existing?.id) {
        const { data: authUser } = await supabase.auth.admin.createUser({
          email, email_confirm: true,
          user_metadata: { full_name: name, phone },
        });
        userId = authUser?.user?.id || userId;
        if (userId) {
          await supabase.from('profiles').insert({
            id: userId, email, full_name: name, phone, type: 'client',
            created_at: new Date().toISOString(),
          });
        }
      }

      // 2. Create or update dossier
      if (userId) {
        const { data: existingDossier } = await supabase
          .from('dossiers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingDossier) {
          await supabase.from('dossiers').update({
            status: 'payment_confirmed',
            product_type: productType,
            amount_paid: amountCents,
            stripe_session_id: intent.id, // reuse existing column to store the Airwallex intent id
            updated_at: new Date().toISOString(),
          }).eq('id', existingDossier.id);
        } else {
          await supabase.from('dossiers').insert({
            user_id: userId,
            company_name: companyName || '',
            status: 'payment_confirmed',
            product_type: productType,
            amount_paid: amountCents,
            stripe_session_id: intent.id, // reuse existing column to store the Airwallex intent id
            created_at: new Date().toISOString(),
          });
        }

        // 3. Handle affiliate commission
        if (referredBy) {
          const { data: referral } = await supabase
            .from('referrals')
            .select('id, affiliate_id, status')
            .eq('referred_user_id', userId)
            .eq('status', 'registered')
            .single();

          if (referral) {
            const commission = await calculateCommission(referral.affiliate_id, productType);

            await supabase.from('referrals').update({
              status: 'converted',
              commission,
              converted_at: new Date().toISOString(),
            }).eq('id', referral.id);

            const { data: aff } = await supabase
              .from('affiliates')
              .select('*')
              .eq('id', referral.affiliate_id)
              .single();

            if (aff) {
              await supabase.from('affiliates').update({
                total_earned: (aff.total_earned || 0) + commission,
                pending_payout: (aff.pending_payout || 0) + commission,
                conversions: (aff.conversions || 0) + 1,
              }).eq('id', aff.id);

              await supabase.from('notifications').insert({
                type: 'new_referral',
                message: `💰 Commission $${commission} — ${email} converted via affiliate ${aff.user_id}`,
                read: false,
                created_at: new Date().toISOString(),
              });
            }
          }
        }

        // 4. Notify admin of payment
        await supabase.from('notifications').insert({
          type: 'new_client',
          message: `💳 Payment received — ${email} — ${productType} — $${(amountCents / 100).toFixed(0)}`,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.error('Supabase error:', dbErr.message);
    }
  }

  res.status(200).json({ received: true });
}
