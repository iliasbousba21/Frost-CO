const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
  if (!appUrl || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SHIPPING_RATE_ID) {
    return res.status(500).json({ error: 'Checkout is not configured yet. Please contact the store.' });
  }

  // Reject browser requests from other origins. This is not a substitute for the server-side price checks.
  const origin = req.headers.origin;
  if (origin && origin !== appUrl) {
    return res.status(403).json({ error: 'Request origin not allowed' });
  }

  const quantity = Number(req.body && req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Choose between 1 and 10 items.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: 1299,
          product_data: { name: 'ArcticHeat™ Thermal Gloves' }
        },
        quantity
      }],
      shipping_address_collection: { allowed_countries: ['BE', 'NL', 'FR', 'DE', 'LU'] },
      shipping_options: [{ shipping_rate: process.env.STRIPE_SHIPPING_RATE_ID }],
      billing_address_collection: 'auto',
      customer_creation: 'always',
      phone_number_collection: { enabled: false },
      success_url: `${appUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout.html?cancelled=1`,
      metadata: { product_id: '5', quantity: String(quantity) },
      payment_intent_data: { metadata: { product_id: '5', quantity: String(quantity) } }
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout creation failed:', err.message);
    return res.status(500).json({ error: 'Could not start secure checkout. Please try again later.' });
  }
};
