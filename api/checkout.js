// Creates a Stripe Checkout Session for the cart stored in the browser.
// The secret key is read from the environment and is never sent to the browser.
// Setup steps: CHECKOUT.md

const {products} = require('../site.js');

const DEFAULT_COUNTRIES = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','GB','NO','CH','US','CA'];

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

function send(res, status, payload) {
  applyCors(res);
  res.status(status).json(payload);
}

function siteUrl(env) {
  return String(env.APP_URL || 'https://frost-co.org').replace(/\/$/, '');
}

function shippingCountries(env) {
  const raw = String(env.STRIPE_SHIPPING_COUNTRIES || '').trim();
  const list = (raw ? raw.split(',') : DEFAULT_COUNTRIES).map(code => code.trim().toUpperCase()).filter(Boolean);
  return list.filter(code => /^[A-Z]{2}$/.test(code));
}

function resolveLines(body) {
  const items = body && Array.isArray(body.items) ? body.items : null;
  if (!items || !items.length) return {error: 'Your cart is empty.', status: 400};
  if (items.length > 20) return {error: 'Too many different products in one order.', status: 400};
  const lines = [];
  for (const item of items) {
    const product = products.find(entry => entry.id === Number(item && item.id));
    const quantity = Math.floor(Number(item && item.quantity));
    if (!product || !product.active) return {error: 'That product is not available to buy.', status: 400};
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return {error: 'Choose a quantity between 1 and 99.', status: 400};
    lines.push({product, quantity});
  }
  return {lines};
}

function appendLineItem(params, index, line) {
  const {product, quantity} = line;
  params.append(`line_items[${index}][quantity]`, String(quantity));
  if (product.priceId) {
    if (!/^price_[A-Za-z0-9]+$/.test(product.priceId)) {
      return 'A product has a price ID that does not look like a Stripe Price.';
    }
    params.append(`line_items[${index}][price]`, product.priceId);
    return '';
  }
  const cents = Math.round(Number(product.price) * 100);
  if (!Number.isInteger(cents) || cents < 50) return 'A product price is missing or too low to charge.';
  params.append(`line_items[${index}][price_data][currency]`, 'eur');
  params.append(`line_items[${index}][price_data][unit_amount]`, String(cents));
  params.append(`line_items[${index}][price_data][product_data][name]`, product.name);
  return '';
}

function buildSessionBody(lines, env) {
  const params = new URLSearchParams();
  const origin = siteUrl(env);
  params.append('mode', 'payment');
  params.append('success_url', origin + '/success.html?session_id={CHECKOUT_SESSION_ID}');
  params.append('cancel_url', origin + '/checkout.html');
  params.append('billing_address_collection', 'auto');
  params.append('metadata[cart]', lines.map(line => line.product.id + 'x' + line.quantity).join(','));
  shippingCountries(env).forEach((code, index) => {
    params.append(`shipping_address_collection[allowed_countries][${index}]`, code);
  });
  const shippingRate = String(env.STRIPE_SHIPPING_RATE_ID || '').trim();
  if (shippingRate && !shippingRate.includes('REPLACE') && /^shr_[A-Za-z0-9]+$/.test(shippingRate)) {
    params.append('shipping_options[0][shipping_rate]', shippingRate);
  }
  for (let index = 0; index < lines.length; index += 1) {
    const problem = appendLineItem(params, index, lines[index]);
    if (problem) return {error: problem};
  }
  const body = params.toString().replace(/%7BCHECKOUT_SESSION_ID%7D/g, '{CHECKOUT_SESSION_ID}');
  return {body};
}

async function createCheckoutSession(lines, env, fetchImpl) {
  const key = String(env.STRIPE_SECRET_KEY || '').trim();
  if (!key || key.includes('REPLACE') || !/^sk_(test|live)_/.test(key)) {
    return {ok:false, status:503, payload:{error:'Checkout is not configured.', code:'not_configured'}};
  }
  const built = buildSessionBody(lines, env);
  if (built.error) return {ok:false, status:400, payload:{error:built.error}};
  const response = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: built.body
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    const message = (payload.error && payload.error.message) || 'Stripe could not start the payment.';
    return {ok:false, status:502, payload:{error:message}};
  }
  return {ok:true, status:200, payload:{url:payload.url}};
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    applyCors(res);
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    send(res, 405, {error:'Method not allowed'});
    return;
  }
  let body = req.body;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); }
    catch (e) { send(res, 400, {error:'Send the cart as JSON.'}); return; }
  }
  const resolved = resolveLines(body);
  if (resolved.error) {
    send(res, resolved.status, {error:resolved.error});
    return;
  }
  try {
    const result = await createCheckoutSession(resolved.lines, process.env, global.fetch);
    send(res, result.status, result.payload);
  } catch (error) {
    send(res, 502, {error:'Payment could not be started. Please try again.'});
  }
}

module.exports = handler;
module.exports.resolveLines = resolveLines;
module.exports.buildSessionBody = buildSessionBody;
module.exports.createCheckoutSession = createCheckoutSession;
module.exports.DEFAULT_COUNTRIES = DEFAULT_COUNTRIES;
