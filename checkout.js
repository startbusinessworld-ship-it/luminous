const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.body; // 'creation' or 'renewal'

  const products = {
    creation: {
      name: 'Création de société à Hong Kong',
      description: 'Enregistrement officiel, statuts, adresse légale 1 an, ouverture compte bancaire, dashboard client',
      amount: 149000, // $1,490.00 in cents
    },
    renewal: {
      name: 'Renouvellement annuel — Hong Kong Ltd.',
      description: 'Déclaration annuelle, renouvellement licence commerciale, adresse légale, conformité',
      amount: 99000, // $990.00 in cents
    },
  };

  const product = products[type];
  if (!product) {
    return res.status(400).json({ error: 'Invalid product type' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: ['https://luminous.hk/logo.png'], // update with your real domain
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&type=${type}`,
      cancel_url: `${req.headers.origin}/#pricing`,
      billing_address_collection: 'required',
      custom_fields: [
        {
          key: 'company_name',
          label: { type: 'custom', custom: 'Nom souhaité pour la société' },
          type: 'text',
          optional: false,
        },
      ],
      metadata: {
        product_type: type,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
