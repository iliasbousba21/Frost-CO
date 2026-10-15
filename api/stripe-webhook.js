const Stripe = require('stripe');
const { buffer } = require('micro');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Webhook is not configured');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Invalid Stripe webhook signature:', err.message);
    return res.status(400).send('Invalid signature');
  }

  // No database is used. Stripe remains the source of truth for payment records.
  // The success page independently retrieves the Checkout Session from Stripe
  // and only displays success when Stripe reports payment_status === 'paid'.
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    if (session.metadata && session.metadata.product_id === '5' && session.payment_status === 'paid') {
      console.log('Verified paid FROST & CO checkout:', session.id);
    }
  }
  return res.status(200).json({ received: true });
};

// Vercel must pass the raw request body so Stripe's signature can be verified.
module.exports.config = { api: { bodyParser: false } };
