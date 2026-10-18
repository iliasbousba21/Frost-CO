/**
 * Combined cart checkout for the static Frost & Co. shop.
 *
 * GitHub Pages cannot run this file. Host it as a Vercel Node function
 * (this repo already has vercel.json) or any host that serves /api/checkout.
 *
 * Required environment variable:
 *   STRIPE_SECRET_KEY   sk_test_... or sk_live_...  (Vercel project settings, never in git)
 *
 * Optional:
 *   APP_URL                    Public site origin, no trailing slash. Default https://frost-co.org
 *   ALLOWED_ORIGINS            Comma-separated browser origins allowed to call this function
 *   STRIPE_SHIPPING_RATE_ID    shr_... shipping rate created in the Stripe Dashboard
 *   STRIPE_SHIPPING_COUNTRIES  Comma-separated ISO country codes. Default: EU + GB, NO, CH
 *
 * Prices are read from api/catalog.json, not from the browser.
 * Leave stripePriceId empty to charge price_data from that file, or paste a Stripe Price id (price_...).
 * To sell another product, set "active": true here and active:true on the same id in site.js.
 */

const catalog = require('./catalog.json');

const DEFAULT_COUNTRIES = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU',
  'MT','NL','PL','PT','RO','SK','SI','ES','SE','GB','NO','CH'
];

function siteUrl() {
  return String(process.env.APP_URL || 'https://frost-co.org').replace(/\/$/, '');
}

function originAllowed(origin) {
  if (!origin) return false;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  const allowed = new Set([siteUrl(), 'https://frost-co.org', 'https://www.frost-co.org']);
  String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
    .forEach(item => allowed.add(item));
  return allowed.has(origin);
}

function applyCors(req, res) {
  const origin = req.headers.origin || '';
  if (originAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

function stripeReady() {
  const key = String(process.env.STRIPE_SECRET_KEY || '');
  return /^sk_(test|live)_[A-Za-z0-9]+$/.test(key) && !key.includes('REPLACE');
}

function normalizeItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 20) {
    return {error: 'Add between 1 and 20 items.', status: 400};
  }
  const merged = new Map();
  for (const item of items) {
    if (!item || typeof item !== 'object') return {error: 'One or more items cannot be purchased.', status: 400};
    const id = Number(item.id);
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(id) || !Number.isFinite(quantity)) {
      return {error: 'One or more items cannot be purchased.', status: 400};
    }
    merged.set(id, (merged.get(id) || 0) + quantity);
  }
  if (merged.size > 20) return {error: 'Add between 1 and 20 items.', status: 400};
  const lines = [];
  for (const [id, quantity] of merged) {
    if (quantity < 1 || quantity > 99) return {error: 'Quantity must be between 1 and 99.', status: 400};
    const product = catalog.find(entry => entry.id === id);
    if (!product || !product.active) return {error: 'One or more items cannot be purchased.', status: 400};
    const priceId = String(product.stripePriceId || '').trim();
    if (priceId && !/^price_[A-Za-z0-9]+$/.test(priceId)) {
      return {error: 'A product price is not ready for checkout.', status: 400};
    }
    const unitAmount = Math.round(Number(product.price) * 100);
    if (!priceId && (!Number.isFinite(unitAmount) || unitAmount < 50)) {
      return {error: 'A product price is not ready for checkout.', status: 400};
    }
    lines.push({
      id,
      name: String(product.name),
      quantity,
      unitAmount,
      priceId
    });
  }
  return {lines};
}

function toFormBody(lines) {
  const params = new URLSearchParams();
  const site = siteUrl();
  params.set('mode', 'payment');
  params.set('success_url', site + '/success.html?session_id={CHECKOUT_SESSION_ID}');
  params.set('cancel_url', site + '/checkout.html');
  params.set('billing_address_collection', 'auto');

  const countries = String(process.env.STRIPE_SHIPPING_COUNTRIES || '')
    .split(',')
    .map(code => code.trim().toUpperCase())
    .filter(code => /^[A-Z]{2}$/.test(code));
  (countries.length ? countries : DEFAULT_COUNTRIES).forEach((code, index) => {
    params.append(`shipping_address_collection[allowed_countries][${index}]`, code);
  });

  const shippingRate = String(process.env.STRIPE_SHIPPING_RATE_ID || '');
  if (/^shr_[A-Za-z0-9]+$/.test(shippingRate) && !shippingRate.includes('REPLACE')) {
    params.set('shipping_options[0][shipping_rate]', shippingRate);
  }

  const summary = lines.map(line => line.quantity + ' × ' + line.name).join(', ').slice(0, 500);
  params.set('payment_intent_data[description]', summary);

  lines.forEach((line, index) => {
    params.set(`line_items[${index}][quantity]`, String(line.quantity));
    if (line.priceId) {
      params.set(`line_items[${index}][price]`, line.priceId);
      return;
    }
    params.set(`line_items[${index}][price_data][currency]`, 'eur');
    params.set(`line_items[${index}][price_data][unit_amount]`, String(line.unitAmount));
    params.set(`line_items[${index}][price_data][product_data][name]`, line.name);
  });
  return params;
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method === 'GET') {
    res.status(200).json({configured: stripeReady()});
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({error: 'Method not allowed'});
    return;
  }
  if (!stripeReady()) {
    res.status(503).json({configured: false, error: 'Checkout is not configured'});
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch (err) {
    res.status(400).json({error: 'Add between 1 and 20 items.'});
    return;
  }

  const normalized = normalizeItems(body && body.items);
  if (normalized.error) {
    res.status(normalized.status).json({error: normalized.error});
    return;
  }

  let stripeResponse;
  try {
    stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: toFormBody(normalized.lines),
      signal: AbortSignal.timeout(15000)
    });
  } catch (err) {
    console.error('Stripe checkout request failed');
    res.status(502).json({error: 'Stripe could not start checkout.'});
    return;
  }

  const session = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok || !session.url) {
    console.error('Stripe checkout failed', session.error && session.error.message);
    res.status(502).json({error: 'Stripe could not start checkout.'});
    return;
  }
  res.status(200).json({url: session.url});
}

module.exports = handler;
module.exports.normalizeItems = normalizeItems;
module.exports.toFormBody = toFormBody;
module.exports.stripeReady = stripeReady;
module.exports.catalog = catalog;
