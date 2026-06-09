const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
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

    // ── Here you would:
    // 1. Save the client to your database (Supabase, PlanetScale, etc.)
    // 2. Send a confirmation email (via Resend / SendGrid)
    // 3. Create their dashboard account
    // 4. Notify your team on WhatsApp / Slack

    console.log('✅ Payment received:', {
      customer_email: session.customer_details?.email,
      product_type: session.metadata?.product_type,
      amount: session.amount_total,
      company_name: session.custom_fields?.[0]?.text?.value,
    });

    // Example: send WhatsApp notification via Twilio
    // await notifyTeamWhatsApp(session);
  }

  res.status(200).json({ received: true });
}
