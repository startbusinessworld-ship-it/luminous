// /api/stripe-payout.js
// Triggers an automatic Stripe transfer to an affiliate's connected account
// POST { user_id, affiliate_id, amount }
// Called by admin when clicking "Pay now" OR automatically

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, affiliate_id, amount } = req.body;
  if (!user_id || !amount) return res.status(400).json({ error: 'Missing required fields' });

  try {
    // Get affiliate's Stripe account
    const { data: payoutInfo } = await SB
      .from('payout_info')
      .select('stripe_account_id, stripe_onboarded')
      .eq('user_id', user_id)
      .maybeSingle();

    if (!payoutInfo?.stripe_account_id) {
      return res.status(400).json({ error: 'No Stripe account connected for this affiliate' });
    }

    if (!payoutInfo.stripe_onboarded) {
      return res.status(400).json({ error: 'Stripe account not fully onboarded yet' });
    }

    const amountCents = Math.round(amount * 100); // Convert to cents

    // Create Stripe Transfer to affiliate's account
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: payoutInfo.stripe_account_id,
      description: `Luminous affiliate commission — $${amount}`,
    });

    const now = new Date().toISOString();

    // Update payout_requests status
    await SB.from('payout_requests')
      .update({ status: 'paid', processed_at: now, stripe_transfer_id: transfer.id })
      .eq('user_id', user_id)
      .eq('status', 'pending');

    // Update affiliate balance
    const { data: aff } = await SB
      .from('affiliates')
      .select('*')
      .eq('id', affiliate_id)
      .single();

    if (aff) {
      await SB.from('affiliates').update({
        pending_payout: Math.max(0, (aff.pending_payout || 0) - amount),
        paid_out: (aff.paid_out || 0) + amount,
      }).eq('id', affiliate_id);
    }

    // Notify affiliate
    await SB.from('notifications').insert({
      type: 'payout_sent',
      title: 'Payment sent! 🎉',
      message: `Your commission of $${amount} has been transferred to your Stripe account.`,
      user_id,
      read: false,
      created_at: now,
    });

    return res.status(200).json({ success: true, transfer_id: transfer.id });

  } catch (err) {
    console.error('Stripe payout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
