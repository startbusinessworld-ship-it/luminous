// /api/stripe-connect-webhook.js
// Handles Stripe Connect webhooks
// Detects when an affiliate completes their Stripe onboarding

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Account fully onboarded
  if (event.type === 'account.updated') {
    const account = event.data.object;
    const isOnboarded = account.details_submitted && account.charges_enabled;

    if (isOnboarded) {
      // Mark as onboarded in Supabase
      await SB.from('payout_info')
        .update({ stripe_onboarded: true, updated_at: new Date().toISOString() })
        .eq('stripe_account_id', account.id);

      // Notify the affiliate
      const { data: payoutInfo } = await SB
        .from('payout_info')
        .select('user_id')
        .eq('stripe_account_id', account.id)
        .maybeSingle();

      if (payoutInfo?.user_id) {
        await SB.from('notifications').insert({
          type: 'stripe_connected',
          title: 'Stripe account connected! ✅',
          message: 'Your Stripe account is now connected. You can request payouts anytime.',
          user_id: payoutInfo.user_id,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return res.status(200).json({ received: true });
}
