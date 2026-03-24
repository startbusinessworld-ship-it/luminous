const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Tiered commission calculation
async function calculateCommission(affiliateId, productType) {
  if (productType === 'renewal') return 80;

  // Count conversions this month for this affiliate
  const startOfMonth = new Date();
  startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

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

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const email = session.customer_details?.email;
    const name = session.customer_details?.name || '';
    const phone = session.customer_details?.phone || '';
    const productType = session.metadata?.product_type;
    const amount = session.amount_total;
    const companyName = session.custom_fields?.find(f => f.key === 'company_name')?.text?.value || '';

    console.log('✅ Payment received:', { email, productType, amount, companyName });

    try {
      // 1. Find or create user profile
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, referred_by')
        .eq('email', email)
        .single();

      let userId = existing?.id;
      const referredBy = existing?.referred_by;

      if (!userId) {
        const { data: authUser } = await supabase.auth.admin.createUser({
          email, email_confirm: true,
          user_metadata: { full_name: name, phone }
        });
        userId = authUser?.user?.id;
        if (userId) {
          await supabase.from('profiles').insert({
            id: userId, email, full_name: name, phone, type: 'client',
            created_at: new Date().toISOString()
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
            amount_paid: amount,
            stripe_session_id: session.id,
            updated_at: new Date().toISOString()
          }).eq('id', existingDossier.id);
        } else {
          await supabase.from('dossiers').insert({
            user_id: userId,
            company_name: companyName || '',
            status: 'payment_confirmed',
            product_type: productType,
            amount_paid: amount,
            stripe_session_id: session.id,
            created_at: new Date().toISOString()
          });
        }

        // 3. Handle affiliate commission
        if (referredBy) {
          // Find the referral record
          const { data: referral } = await supabase
            .from('referrals')
            .select('id, affiliate_id, status')
            .eq('referred_user_id', userId)
            .eq('status', 'registered')
            .single();

          if (referral) {
            const commission = await calculateCommission(referral.affiliate_id, productType);

            // Update referral to converted
            await supabase.from('referrals').update({
              status: 'converted',
              commission,
              converted_at: new Date().toISOString()
            }).eq('id', referral.id);

            // Update affiliate totals
            const { data: aff } = await supabase
              .from('affiliates')
              .select('*')
              .eq('id', referral.affiliate_id)
              .single();

            if (aff) {
              await supabase.from('affiliates').update({
                total_earned: (aff.total_earned || 0) + commission,
                pending_payout: (aff.pending_payout || 0) + commission,
                conversions: (aff.conversions || 0) + 1
              }).eq('id', aff.id);

              // Notify admin
              await supabase.from('notifications').insert({
                type: 'new_referral',
                message: `💰 Commission $${commission} — ${email} converted via affiliate ${aff.user_id}`,
                read: false,
                created_at: new Date().toISOString()
              });
            }
          }
        }

        // 4. Notify admin of payment
        await supabase.from('notifications').insert({
          type: 'new_client',
          message: `💳 Payment received — ${email} — ${productType} — $${(amount/100).toFixed(0)}`,
          read: false,
          created_at: new Date().toISOString()
        });
      }

    } catch (dbErr) {
      console.error('Supabase error:', dbErr.message);
    }
  }

  res.status(200).json({ received: true });
}
