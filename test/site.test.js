const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../site.js');
const checkout = require('../api/checkout.js');

const root = path.join(__dirname, '..');
const pages = ['index.html', 'shop.html', 'checkout.html', 'contact.html', 'shipping.html', 'privacy.html', 'success.html', 'reviews.html'];

test('catalog keeps gloves purchasable and placeholders closed', () => {
  const gloves = catalog.products.find(product => product.id === 5);
  assert.equal(gloves.active, true);
  assert.equal(gloves.paymentLink, 'https://buy.stripe.com/bJe8wP9hT2qXgxGenMgEg00');
  assert.equal(gloves.price, 12.99);
  assert.equal(catalog.supportEmail, 'frost-co@outlook.com');
  const placeholders = catalog.products.filter(product => product.id !== 5);
  assert.ok(placeholders.length >= 11);
  assert.ok(placeholders.every(product => product.active === false && !product.paymentLink));
});

test('active cart lines ignore placeholders and cap quantity', () => {
  const lines = catalog.activeCartLines({5: 2, 101: 4, 999: 1, 108: '3'});
  assert.deepEqual(lines.map(line => [line.product.id, line.quantity]), [[5, 2]]);
  assert.equal(catalog.activeCartLines({5: 150})[0].quantity, 99);
});

test('gloves-only checkout falls back to the Payment Link when the function is missing', async () => {
  const lines = catalog.activeCartLines({5: 1});
  const result = await catalog.startStripeCheckout(lines, {
    endpoint: '/api/checkout',
    fetchImpl: async () => ({ok: false, status: 404, headers: {get: () => 'text/html'}, json: async () => ({})})
  });
  assert.equal(result.action, 'payment-link');
  assert.equal(result.url, catalog.glovePaymentLink);
});

test('a configured session is preferred over the Payment Link', async () => {
  const lines = catalog.activeCartLines({5: 3});
  const result = await catalog.startStripeCheckout(lines, {
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: {get: () => 'application/json'},
      json: async () => ({url: 'https://checkout.stripe.com/c/pay/cs_test_multi'})
    })
  });
  assert.equal(result.action, 'redirect');
  assert.equal(result.url, 'https://checkout.stripe.com/c/pay/cs_test_multi');
});

test('mixed carts do not invent a Payment Link', async () => {
  const hoodie = {...catalog.products.find(product => product.id === 106), active: true};
  const lines = [
    catalog.activeCartLines({5: 1})[0],
    {product: hoodie, quantity: 1}
  ];
  const result = await catalog.startStripeCheckout(lines, {
    fetchImpl: async () => ({ok: false, status: 503, headers: {get: () => 'application/json'}, json: async () => ({code: 'not_configured', error: 'Checkout is not configured.'})})
  });
  assert.equal(result.action, 'blocked');
  assert.match(result.message, /not connected yet/);
});

test('checkout function rejects placeholders and prices from the client', () => {
  const rejected = checkout.resolveLines({items: [{id: 101, quantity: 1, price: 0.01}]});
  assert.equal(rejected.status, 400);
  const gloves = checkout.resolveLines({items: [{id: 5, quantity: 2, price: 0.01}]});
  assert.equal(gloves.lines[0].product.price, 12.99);
  assert.equal(gloves.lines[0].quantity, 2);
});

function decodeForm(body) {
  return decodeURIComponent(body.replace(/\+/g, ' '));
}

test('session body charges catalog cents and keeps the session id placeholder', () => {
  const {lines} = checkout.resolveLines({items: [{id: 5, quantity: 2}]});
  const {body} = checkout.buildSessionBody(lines, {APP_URL: 'https://frost-co.org'});
  const decoded = decodeForm(body);
  assert.match(decoded, /line_items\[0\]\[quantity\]=2/);
  assert.match(decoded, /\[unit_amount\]=1299/);
  assert.match(decoded, /success_url=\S*\{CHECKOUT_SESSION_ID\}/);
  assert.doesNotMatch(decoded, /\[unit_amount\]=1(?:&|$)/);
});

test('two different products become two Stripe line items', () => {
  const gloves = catalog.products.find(product => product.id === 5);
  const lamp = {...catalog.products.find(product => product.id === 109), active: true};
  const {body} = checkout.buildSessionBody([
    {product: gloves, quantity: 2},
    {product: lamp, quantity: 1}
  ], {APP_URL: 'https://frost-co.org'});
  const decoded = decodeForm(body);
  assert.match(decoded, /line_items\[0\]\[quantity\]=2/);
  assert.match(decoded, /ArcticHeat™ Thermal Gloves/);
  assert.match(decoded, /\[unit_amount\]=1299/);
  assert.match(decoded, /line_items\[1\]\[quantity\]=1/);
  assert.match(decoded, /LED Ambient Light/);
  assert.match(decoded, /\[unit_amount\]=1899/);
});

test('a price id is sent instead of a made-up amount', () => {
  const product = {...catalog.products.find(item => item.id === 5), priceId: 'price_gloves123'};
  const decoded = decodeForm(checkout.buildSessionBody([{product, quantity: 1}], {APP_URL: 'https://frost-co.org', STRIPE_SHIPPING_RATE_ID: 'shr_rate123'}).body);
  assert.match(decoded, /line_items\[0\]\[price\]=price_gloves123/);
  assert.match(decoded, /shipping_options\[0\]\[shipping_rate\]=shr_rate123/);
  assert.doesNotMatch(decoded, /unit_amount/);
});

test('missing secret key reports that checkout is not configured', async () => {
  const {lines} = checkout.resolveLines({items: [{id: 5, quantity: 1}]});
  const result = await checkout.createCheckoutSession(lines, {STRIPE_SECRET_KEY: 'sk_test_REPLACE_ME', APP_URL: 'https://frost-co.org'}, async () => {
    throw new Error('Stripe should not be called');
  });
  assert.equal(result.status, 503);
  assert.equal(result.payload.code, 'not_configured');
});

test('handler creates a session without trusting the request price', async () => {
  const previous = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  process.env.APP_URL = 'https://frost-co.org';
  let sent = '';
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    sent = options.body;
    assert.equal(url, 'https://api.stripe.com/v1/checkout/sessions');
    assert.match(options.headers.Authorization, /^Bearer sk_test_123$/);
    return {ok: true, json: async () => ({url: 'https://checkout.stripe.com/c/pay/cs_test_abc'})};
  };
  const res = mockRes();
  try {
    await checkout({method: 'POST', body: {items: [{id: 5, quantity: 2, price: 1}]}}, res);
  } finally {
    global.fetch = originalFetch;
    process.env.STRIPE_SECRET_KEY = previous;
  }
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).url, 'https://checkout.stripe.com/c/pay/cs_test_abc');
  const decoded = decodeURIComponent(sent.replace(/\+/g, ' '));
  assert.match(decoded, /\[unit_amount\]=1299/);
  assert.match(decoded, /line_items\[0\]\[quantity\]=2/);
  assert.doesNotMatch(decoded, /\[unit_amount\]=100(?:&|$)/);
});

test('every page links a real favicon and no old shop anchors remain', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /favicon\.svg/);
    assert.match(html, /favicon\.ico/);
    assert.match(html, /favicon-32\.png/);
    assert.doesNotMatch(html, /#producten|#collectie|our support email/);
  }
  for (const page of ['contact.html', 'shipping.html', 'privacy.html']) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /mailto:frost-co@outlook\.com/);
    assert.match(html, /frost-co@outlook\.com/);
    assert.match(html, /href="shop\.html"/);
  }
  const contact = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
  assert.match(contact, /mailto:frost-co@outlook\.com\?subject=/);
  assert.equal(fs.existsSync(path.join(root, 'favicon.svg')), true);
  assert.equal(fs.existsSync(path.join(root, 'favicon.ico')), true);
  assert.equal(fs.existsSync(path.join(root, 'favicon-32.png')), true);
  assert.equal(fs.existsSync(path.join(root, 'favicon-180.png')), true);
});

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = JSON.stringify(payload); return this; },
    end() { return this; }
  };
}
