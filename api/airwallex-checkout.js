// /api/airwallex-checkout.js
// Creates an Airwallex Payment Intent and returns a Hosted Payment Page URL.
// POST { type: 'creation' | 'renewal', email?, user_id? }
// Replaces the old Stripe Checkout / Payment Links flow.

import { randomUUID } from 'crypto';

const API_BASE = process.env.AIRWALLEX_BASE_URL || 'https://api.airwallex.com';
const CHECKOUT_BASE = process.env.AIRWALLEX_CHECKOUT_URL || 'https://checkout.airwallex.com';

const PRODUCTS = {
  creation: {
    name: 'Création de société à Hong Kong',
    amount: 1490, // USD
  },
  renewal: {
    name: 'Renouvellement annuel — Hong Kong Ltd.',
    amount: 990, // USD
  },
};

async function getAirwallexToken() {
  const res = await fetch(`${API_BASE}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': process.env.AIRWALLEX_CLIENT_ID,
      'x-api-key': process.env.AIRWALLEX_API_KEY,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airwallex auth failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, email, user_id } = req.body || {};
  const product = PRODUCTS[type];
  if (!product) return res.status(400).json({ error: 'Invalid product type' });

  const origin = req.headers.origin || 'https://luminoscorp.com';

  try {
    const token = await getAirwallexToken();

    const requestId = randomUUID();
    const merchantOrderId = `${type}-${Date.now()}`;

    // Create the Payment Intent
    const intentRes = await fetch(`${API_BASE}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        request_id: requestId,
        amount: product.amount,
        currency: 'USD',
        merchant_order_id: merchantOrderId,
        descriptor: 'LUMINOUS HK',
        metadata: {
          product_type: type,
          email: email || '',
          user_id: user_id || '',
        },
        order: {
          products: [
            { name: product.name, quantity: 1, unit_price: product.amount, currency: 'USD' },
          ],
        },
      }),
    });

    if (!intentRes.ok) {
      const body = await intentRes.text();
      throw new Error(`Airwallex intent failed (${intentRes.status}): ${body}`);
    }

    const intent = await intentRes.json();

    // Build the Hosted Payment Page URL
    const params = new URLSearchParams({
      intent_id: intent.id,
      client_secret: intent.client_secret,
      mode: 'payment',
      currency: 'USD',
      amount: String(product.amount),
      successUrl: `${origin}/success?type=${type}`,
      failUrl: `${origin}/dashboard.html?payment=failed`,
      cancelUrl: `${origin}/dashboard.html`,
    });

    const url = `${CHECKOUT_BASE}/#/standalone/checkout?${params.toString()}`;

    return res.status(200).json({ url });
  } catch (err) {
    console.error('Airwallex checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
