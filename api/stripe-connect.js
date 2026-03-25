// /api/stripe-connect.js
// Creates a Stripe Connect Account Link for affiliate onboarding
// POST { user_id, email, return_url }

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, email } = req.body;
  if (!user_id || !email) return res.status(400).json({ error: 'Missing user_id or email' });

  try {
    // Check if affiliate already has a Stripe account
    const { data: payoutInfo } = await SB
      .from('payout_info')
      .select('stripe_account_id')
      .eq('user_id', user_id)
      .maybeSingle();

    let accountId = payoutInfo?.stripe_account_id;

    // Create a new Stripe Express account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: { interval: 'manual' }, // We control when payouts happen
          },
        },
      });
      accountId = account.id;

      // Save to Supabase
      await SB.from('payout_info').upsert({
        user_id,
        stripe_account_id: accountId,
        stripe_onboarded: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    // Create onboarding link
    const origin = req.headers.origin || 'https://luminoscorp.com';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard.html?stripe=refresh`,
      return_url: `${origin}/dashboard.html?stripe=success`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });

  } catch (err) {
    console.error('Stripe Connect error:', err);
    return res.status(500).json({ error: err.message });
  }
}
