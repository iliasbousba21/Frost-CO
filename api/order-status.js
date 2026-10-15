const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!sessionId.startsWith('cs_')) return res.status(400).json({ error: 'Invalid checkout reference' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session.metadata || session.metadata.product_id !== '5') {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(200).json({
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency
    });
  } catch (err) {
    console.error('Order status lookup failed:', err.message);
    return res.status(404).json({ error: 'Could not find this checkout session' });
  }
};
