const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../site.js');

const root = path.join(__dirname, '..');
const pages = ['index.html', 'shop.html', 'checkout.html', 'contact.html', 'shipping.html', 'privacy.html', 'success.html'];

test('catalog keeps gloves purchasable and placeholders closed', () => {
  const gloves = catalog.products.find(product => product.id === 5);
  assert.equal(gloves.active, true);
  assert.equal(gloves.paymentLink, 'https://buy.stripe.com/bJe8wP9hT2qXgxGenMgEg00');
  assert.equal(gloves.price, 12.99);
  assert.equal(catalog.supportEmail, 'frost-co@outlook.com');
  assert.equal(catalog.forSale(gloves), true);
  const placeholders = catalog.products.filter(product => product.id !== 5);
  assert.ok(placeholders.length >= 11);
  assert.ok(placeholders.every(product => product.active === false && !product.paymentLink && !catalog.forSale(product)));
});

test('active cart lines ignore placeholders and cap quantity', () => {
  const lines = catalog.activeCartLines({5: 2, 101: 4, 999: 1, 108: '3'});
  assert.deepEqual(lines.map(line => [line.product.id, line.quantity]), [[5, 2]]);
  assert.equal(catalog.activeCartLines({5: 150})[0].quantity, 99);
});

test('each cart line gets its own Payment Link', () => {
  const gloves = catalog.activeCartLines({5: 2})[0];
  const hoodie = {...catalog.products.find(product => product.id === 106), active: true, paymentLink: 'https://buy.stripe.com/test_hoodie'};
  const html = catalog.payItemsMarkup([gloves, {product: hoodie, quantity: 1}]);
  assert.equal((html.match(/Pay for this item/g) || []).length, 2);
  assert.match(html, /https:\/\/buy\.stripe\.com\/bJe8wP9hT2qXgxGenMgEg00/);
  assert.match(html, /https:\/\/buy\.stripe\.com\/test_hoodie/);
  assert.match(html, /set the quantity to 2/);
  assert.doesNotMatch(catalog.payItemsMarkup([catalog.activeCartLines({5: 1})[0]]), /set the quantity/);
});

test('payment-link checkout files replaced the serverless setup', () => {
  assert.equal(fs.existsSync(path.join(root, 'api', 'checkout.js')), false);
  assert.equal(fs.existsSync(path.join(root, 'vercel.json')), false);
  assert.equal(fs.existsSync(path.join(root, '.env.example')), false);
  const note = fs.readFileSync(path.join(root, 'CHECKOUT.md'), 'utf8');
  assert.match(note, /Payment Link/);
  assert.match(note, /https:\/\/buy\.stripe\.com\/bJe8wP9hT2qXgxGenMgEg00/);
  assert.match(note, /active: false/);
  const sources = ['site.js', 'checkout.html', 'CHECKOUT.md', 'index.html', 'shop.html'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  assert.doesNotMatch(sources, /vercel|CHECKOUT_ENDPOINT|api\/checkout|STRIPE_SECRET_KEY|not connected yet|priceId/i);
});

test('every page links a real favicon and no old shop anchors remain', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /favicon\.svg/);
    assert.match(html, /favicon\.ico/);
    assert.match(html, /favicon-32\.png/);
    assert.doesNotMatch(html, /#producten|#collectie|our support email|vercel|api\/checkout/i);
  }
  for (const page of ['contact.html', 'shipping.html', 'privacy.html']) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /mailto:frost-co@outlook\.com/);
    assert.match(html, /frost-co@outlook\.com/);
    assert.match(html, /href="shop\.html"/);
  }
  const contact = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
  assert.match(contact, /mailto:frost-co@outlook\.com\?subject=/);
  const checkout = fs.readFileSync(path.join(root, 'checkout.html'), 'utf8');
  assert.match(checkout, /payItemsMarkup/);
  assert.match(checkout, /own Stripe page/);
});
