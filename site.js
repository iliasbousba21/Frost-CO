// Frost & Co. product catalog and shop behaviour.
// Edit products here. Placeholder rows stay active:false so they cannot be bought.
// Checkout setup (Stripe key, price IDs, deploying the function): see CHECKOUT.md.

const SUPPORT_EMAIL = 'frost-co@outlook.com';
const STRIPE_GLOVE_LINK = 'https://buy.stripe.com/bJe8wP9hT2qXgxGenMgEg00';
const STRIPE_JACKET_LINK = 'https://buy.stripe.com/5kQ4gz8dP1mT2GQ4NcgEg02';
const STRIPE_POWER_LINK = 'https://buy.stripe.com/14A4gzbq1e9Fdlu4NcgEg03';
const STRIPE_HOODIE_LINK = 'https://buy.stripe.com/eVq3cvfGhc1x0yI2F4gEg04';
const STRIPE_MAGNET_LINK = 'https://buy.stripe.com/fZueVd8dP5D9ftCdjIgEg05';
const STRIPE_HOLDER_LINK = 'https://buy.stripe.com/3cIbJ1fGh9Tp1CM2F4gEg0d';
const STRIPE_SKY_LINK = 'https://buy.stripe.com/28E7sL1Pr3v1a9i7ZogEg07';
const STRIPE_GLOW_LINK = 'https://buy.stripe.com/bJecN5cu5fdJ0yI2F4gEg08';
const STRIPE_BAG_LINK = 'https://buy.stripe.com/bJe8wPbq16Hdbdm6VkgEg09';
// "Buy 2, get 1 free" bundles: one Stripe link per bundle, priced at 2x the single price.
const STRIPE_GLOW_3FOR2_LINK = 'https://buy.stripe.com/14A5kD65He9F1CMgvUgEg0a';
const STRIPE_HOLDER_3FOR2_LINK = 'https://buy.stripe.com/3cI8wP9hT7Lh5T2a7wgEg0e';
const STRIPE_MAGNET_3FOR2_LINK = 'https://buy.stripe.com/28EcN51Pre9F81a93sgEg0c';
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const CHECKOUT_ENDPOINT = '';

const products = [
  {id:301,name:'ArcticMagnet™ 25W Wireless Charger',category:'Electronics',price:24.99,priceId:'',label:'NEW',img:'assets/arcticmagnet.jpg',icon:'🔌',paymentLink:STRIPE_MAGNET_LINK,deal:{link:STRIPE_MAGNET_3FOR2_LINK,price:49.98},active:true,rail:'electronics',description:'Fast 25W wireless charger with magnetic alignment. Charges compatible phones and devices quickly and cleanly. Compact and efficient for desk or bedside use.'},
  {id:300,name:'ArcticPower™ 150W Fast Charger',category:'Electronics',price:24.99,priceId:'',label:'NEW',img:'assets/ArcticPower.jpg',icon:'⚡',paymentLink:STRIPE_POWER_LINK,active:true,rail:'electronics',description:'High-speed 150W GaN charger block. Charges laptops, phones and tablets at full speed. Compact, cool-running and supports multiple devices. USB-C PD 3.0.'},
  {id:201,name:'ArcticForge™ Heated Hoodie',category:'Clothing & Wearables',price:29.99,priceId:'',label:'NEW',img:'assets/heated-hoodie.jpg',paymentLink:STRIPE_HOODIE_LINK,sizes:CLOTHING_SIZES,active:true,rail:'clothing',description:'Soft fleece heated hoodie with 9 heating zones and 3 temperature levels. USB-powered, machine washable and lightweight. Perfect for cold days.'},
  {id:5,name:'ArcticHeat™ Thermal Gloves',category:'Clothing & Wearables',price:12.99,priceId:'',label:'AVAILABLE',img:'assets/arcticheat-gloves-v3.jpg',paymentLink:STRIPE_GLOVE_LINK,sizes:CLOTHING_SIZES,active:true,rail:'clothing',description:'Warm thermal gloves with heating elements. Keep your hands comfortable in cold weather. Lightweight and practical for everyday use.'},
  {id:200,name:'ArcticJacket™ Heated Winter Jacket',category:'Clothing & Wearables',price:39.99,priceId:'',label:'NEW',img:'assets/arcticjacket.png',paymentLink:STRIPE_JACKET_LINK,sizes:CLOTHING_SIZES,active:true,rail:'clothing',description:'Premium heated winter jacket with multiple heating zones. Designed for real cold. Stylish, functional and built to last the season.'},
  {id:104,name:'Arcticholder Magnetic Phone Holder',category:'Electronics',price:14.99,priceId:'price_1USY0XGX85ubMgt4upPiAgTd',label:'NEW',img:'assets/arcticholder.png',icon:'▣',paymentLink:STRIPE_HOLDER_LINK,deal:{link:STRIPE_HOLDER_3FOR2_LINK,price:29.98},active:true,rail:'electronics',description:'Magnetic phone holder with 720° rotating base. Perfect for car dashboard, air vents, or desk use. Free expansion and any comfortable angle adjustment.'},
  {id:103,name:'Compact Bluetooth Speaker',category:'Electronics',price:24.99,priceId:'',label:'PRODUCT PLACEHOLDER',icon:'♫',img:'',active:false,rail:'electronics',description:'Placeholder product.'},
  {id:107,name:'ArcticCharm™ Snowflake Crossbody Bag',category:'Clothing & Wearables',price:25.99,priceId:'price_1USXQ8GX85ubMgt4Vo24M9FD',label:'NEW',icon:'▭',img:'assets/arcticcharm-bag.jpg',paymentLink:STRIPE_BAG_LINK,active:true,rail:'clothing',description:'Quilted black-and-white crossbody bag with a gold snowflake clasp. Carry it by the top handle or wear it crossbody on the detachable patterned strap. Compact enough for every day, roomy enough for your phone, wallet and keys.'},
  {id:108,name:'Winter Beanie',category:'Clothing & Wearables',price:14.99,priceId:'',label:'PRODUCT PLACEHOLDER',icon:'♧',img:'',active:false,rail:'clothing',description:'Placeholder product.'},
  {id:302,name:'ArcticSky™ Galaxy Projector',category:'Home & Lifestyle',price:39.99,priceId:'price_1USHBJGX85ubMgt41fdhxYXE',label:'NEW',icon:'✦',img:'assets/arcticsky.jpg',paymentLink:STRIPE_SKY_LINK,active:true,rail:'home',description:'Turn your ceiling into a starry night sky. Projects twinkling stars and a soft, drifting nebula glow in multiple colour modes. Adjustable brightness and a sleep timer make it perfect for bedrooms, movie nights and relaxing evenings.'},
  {id:303,name:'ArcticGlow™ RGB LED Strip Lights (20m)',category:'Home & Lifestyle',price:15.99,priceId:'price_1USWgEGX85ubMgt4Qr4dEdge',label:'NEW',icon:'✺',img:'assets/arcticglow-led.jpg',paymentLink:STRIPE_GLOW_LINK,deal:{link:STRIPE_GLOW_3FOR2_LINK,price:31.98},active:true,rail:'home',description:'Light up any room in millions of colours. 20 metres of flexible, cuttable RGB LED strip with a handy remote: pick a colour, dim it down or switch to fading and flashing modes. Self-adhesive backing makes it easy to run behind a TV, along a bed frame, under shelves or around a gaming setup. USB-powered; the remote runs on AAA batteries.'},
  {id:110,name:'Reusable Travel Bottle',category:'Home & Lifestyle',price:16.99,priceId:'',label:'PRODUCT PLACEHOLDER',icon:'♧',img:'',active:false,rail:'home',description:'Placeholder product.'},
  {id:111,name:'Desk Organiser',category:'Home & Lifestyle',price:13.99,priceId:'',label:'PRODUCT PLACEHOLDER',icon:'▤',img:'',active:false,rail:'home',description:'Placeholder product.'},
];

const euro = n => new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(n);

function checkoutEndpointUrl() {
  return CHECKOUT_ENDPOINT || '/api/checkout';
}

function activeCartLines(cart) {
  return Object.entries(cart || {}).map(([id, qty]) => {
    const product = products.find(item => item.id === Number(id));
    const quantity = Math.min(99, Math.max(0, Math.floor(Number(qty) || 0)));
    return {product, quantity};
  }).filter(line => line.product && line.product.active && line.quantity > 0);
}

function paymentLinkNotice(lines) {
  if (lines.length !== 1 || !lines[0].product.paymentLink || lines[0].quantity <= 1) return '';
  return 'On the secure payment page, change the quantity to ' + lines[0].quantity + ' before you pay.';
}

function blockedCheckoutMessage(lines) {
  if (lines.length > 1) {
    return 'Paying for several products at once needs Stripe Checkout, which is not connected yet. You can still buy the ArcticHeat™ Thermal Gloves on their own from the shop.';
  }
  return 'This product cannot be paid for until Stripe Checkout is connected. Email ' + SUPPORT_EMAIL + ' if you need help.';
}

async function startStripeCheckout(lines, options = {}) {
  const list = Array.isArray(lines) ? lines : [];
  if (!list.length) return {ok:false, action:'empty', message:'Your cart is empty.'};
  const single = list.length === 1 && list[0].product.paymentLink ? list[0] : null;
  const fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  const endpoint = options.endpoint || checkoutEndpointUrl();
  if (fetchImpl) {
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({items: list.map(line => ({id: line.product.id, quantity: line.quantity}))}),
        signal: options.signal
      });
      const type = (response.headers && response.headers.get && response.headers.get('content-type')) || '';
      let data = {};
      if (type.includes('json') && typeof response.json === 'function') {
        data = await response.json() || {};
      }
      if (response.ok && data.url) return {ok:true, action:'redirect', url:data.url};
      if (!single && data.error && response.status && response.status !== 404 && data.code !== 'not_configured') {
        return {ok:false, action:'blocked', message:data.error};
      }
    } catch (error) {
      if (error && error.name === 'AbortError' && !options.treatAbortAsUnconfigured) throw error;
    }
  }
  if (single) {
    return {ok:true, action:'payment-link', url:single.product.paymentLink, notice:paymentLinkNotice(list)};
  }
  return {ok:false, action:'blocked', message:blockedCheckoutMessage(list)};
}

const catalog = {
  supportEmail: SUPPORT_EMAIL,
  glovePaymentLink: STRIPE_GLOVE_LINK,
  checkoutEndpoint: CHECKOUT_ENDPOINT,
  checkoutEndpointUrl,
  products,
  euro,
  activeCartLines,
  paymentLinkNotice,
  startStripeCheckout
};

if (typeof module !== 'undefined' && module.exports) module.exports = catalog;

if (typeof document !== 'undefined') {
  catalog.readCart = function readCart() {
    try { return JSON.parse(localStorage.getItem('frost-cart') || '{}') || {}; }
    catch (e) { return {}; }
  };
  if (typeof window !== 'undefined') window.Frost = catalog;

  const escapeHtml = value => String(value).replace(/[&<>\"']/g, ch => ({'&':'&','<':'<','>':'>','\"':'"',"'":'&#39;'})[ch]);
  let cart = catalog.readCart();
  const $ = id => document.getElementById(id);

  document.querySelectorAll('[data-email]').forEach(el => {
    el.href = 'mailto:' + SUPPORT_EMAIL;
    const label = (el.textContent || '').trim().toLowerCase();
    if (!label || label === 'our support email' || label === '#') el.textContent = SUPPORT_EMAIL;
  });

  function notify(msg) {
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.frostToastTimeout);
    window.frostToastTimeout = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function save() {
    localStorage.setItem('frost-cart', JSON.stringify(cart));
    renderCart();
  }
  function openCart() {
    $('drawer')?.classList.add('active');
    $('overlay')?.classList.add('active');
    $('drawer')?.setAttribute('aria-hidden', 'false');
  }
  function closeCart() {
    $('drawer')?.classList.remove('active');
    $('overlay')?.classList.remove('active');
    $('drawer')?.setAttribute('aria-hidden', 'true');
  }
  const extrasStyle = document.createElement('style');
  extrasStyle.textContent = '.pill.deal-pill{left:auto;right:12px;background:#be2f3c;color:#fff}.sizes{display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:11px;color:#6d8491;margin:0 0 4px}.sizes span{border:1px solid #cbd9df;padding:3px 7px;font-weight:700;color:#12283b;font-size:10px}.size-note{font-size:10px;color:#81929b;margin:0 0 12px}.deal{background:#fbecee;color:#9c2430;font-size:12px;padding:8px 10px;margin:0 0 12px}.deal b{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase}.button.deal-btn{background:#be2f3c;border-color:#be2f3c}.button.deal-btn:hover{background:#9c2430}.product-card{display:flex;flex-direction:column}.product-info{display:flex;flex-direction:column;flex:1}.product-info h3{min-height:2.8em}.product-info .price{margin:0 0 12px}.sizes,.deal{min-height:0}.product-actions{margin-top:auto}.product-media img{object-fit:contain;background:#fff}.modal-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.modal-actions .button{flex:1 1 180px}';
  document.head.appendChild(extrasStyle);
  function extrasHtml(product) {
    let html = '';
    if (product.sizes) html += `<div class="sizes">Sizes: ${product.sizes.map(size => `<span>${escapeHtml(size)}</span>`).join('')}</div><p class="size-note">Choose your size on the payment page.</p>`;
    if (product.deal) html += `<div class="deal"><b>Buy 2, get 1 free</b>3 for ${euro(product.deal.price)}</div>`;
    return html;
  }
  function dealButton(product) {
    return product.deal ? `<a class="button deal-btn" href="${escapeHtml(product.deal.link)}" target="_blank" rel="noopener">GET 3, PAY 2 →</a>` : '';
  }
  function openProduct(product) {
    const modal = $('productModal');
    if (!modal) return;
    const imgHtml = product.img ? `<img src="${escapeHtml(product.img)}" alt="" style="width:100%;max-height:280px;object-fit:contain;background:#fff;border-radius:8px;margin-bottom:16px">` : `<div style="font-size:64px;text-align:center;padding:40px 0">${product.icon || '＋'}</div>`;
    const buyBtn = product.paymentLink ? `<a class="button" href="${escapeHtml(product.paymentLink)}" target="_blank" rel="noopener">BUY NOW →</a>` : '';
    $('productModalContent').innerHTML = `${imgHtml}<div class="eyebrow">${escapeHtml(product.category)}</div><h2 style="font:500 28px 'Playfair Display',serif;margin:8px 0">${escapeHtml(product.name)}</h2><div class="price" style="font-size:20px;font-weight:700;margin:8px 0 16px">${euro(product.price)}</div><p style="line-height:1.7;color:#586978;margin-bottom:16px">${escapeHtml(product.description || 'No description yet.')}</p>${extrasHtml(product)}<div class="modal-actions">${buyBtn}${dealButton(product)}</div>`;
    modal.classList.add('active');
    $('productOverlay').classList.add('active');
  }
  function closeProduct() {
    $('productModal')?.classList.remove('active');
    $('productOverlay')?.classList.remove('active');
  }
  function card(product) {
    const media = product.img
      ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="placeholder-art" aria-hidden="true">${product.icon || '＋'}</div>`;
    const actions = product.active
      ? (product.paymentLink
          ? `${dealButton(product)}<a class="button" href="${escapeHtml(product.paymentLink)}" target="_blank" rel="noopener">BUY NOW →</a>`
          : `<button class="add" data-add="${product.id}">＋ ADD TO CART</button>`)
      : `<button class="add" disabled title="Add a real product and payment link to activate">COMING SOON</button>`;
    return `<article class="product-card" data-product="${product.id}" style="cursor:pointer"><div class="product-media">${media}<span class="pill">${escapeHtml(product.label)}</span>${product.deal ? '<span class="pill deal-pill">2+1 FREE</span>' : ''}</div><div class="product-info"><div class="category">${escapeHtml(product.category)}</div><h3>${escapeHtml(product.name)}</h3><div class="price">${euro(product.price)}</div>${extrasHtml(product)}<div class="product-actions">${actions}</div>${product.active ? '' : '<p class="coming-soon">Placeholder — replace with your product, image and payment link.</p>'}</div></article>`;
  }
  for (const rail of ['electronics', 'clothing', 'home']) {
    const el = $('rail-' + rail);
    if (el) el.innerHTML = products.filter(product => product.rail === rail).map(card).join('');
  }
  document.querySelectorAll('[data-scroll]').forEach(btn => btn.addEventListener('click', () => {
    const rail = btn.closest('.shop-category')?.querySelector('.product-rail');
    if (rail) rail.scrollBy({left: Number(btn.dataset.scroll) * Math.max(240, rail.clientWidth * 0.8), behavior: 'smooth'});
  }));
  document.addEventListener('click', event => {
    const cardEl = event.target.closest('[data-product]');
    if (cardEl && !event.target.closest('a, button')) {
      const product = products.find(p => p.id === Number(cardEl.dataset.product));
      if (product) openProduct(product);
      return;
    }
    const button = event.target.closest('[data-add]');
    if (!button) return;
    const product = products.find(item => item.id === Number(button.dataset.add));
    if (!product?.active) return;
    cart[product.id] = Math.min(99, (Number(cart[product.id]) || 0) + 1);
    save();
    notify(product.name + ' added to cart');
  });
  function renderCart() {
    const items = $('cartItems');
    if (!items) return;
    let totalCents = 0;
    let count = 0;
    let markup = '';
    for (const line of activeCartLines(cart)) {
      const product = line.product;
      count += line.quantity;
      const cents = Math.round(product.price * 100) * line.quantity;
      totalCents += cents;
      const thumb = product.img
        ? `<img src="${escapeHtml(product.img)}" alt="">`
        : `<div class="placeholder-art" style="width:70px;height:78px;font-size:24px">${product.icon || '＋'}</div>`;
      markup += `<div class="cart-item"><div>${thumb}</div><div><strong>${escapeHtml(product.name)}</strong><p>${euro(product.price)}</p><div class="qty"><button data-action="minus" data-id="${product.id}" aria-label="Decrease quantity">−</button><span>${line.quantity}</span><button data-action="plus" data-id="${product.id}" aria-label="Increase quantity">+</button><button data-action="remove" data-id="${product.id}" style="margin-left:auto;background:none;text-decoration:underline;width:auto">Remove</button></div></div></div>`;
    }
    items.innerHTML = markup || '<p class="empty">Your cart is empty. Have a look around the shop.</p>';
    if ($('cartCount')) $('cartCount').textContent = count;
    if ($('subtotal')) $('subtotal').textContent = euro(totalCents / 100);
  }
  $('openCart')?.addEventListener('click', openCart);
  $('closeCart')?.addEventListener('click', closeCart);
  $('overlay')?.addEventListener('click', closeCart);
  $('productOverlay')?.addEventListener('click', closeProduct);
  $('closeProduct')?.addEventListener('click', closeProduct);
  $('cartItems')?.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    const current = Number(cart[id]) || 0;
    if (action === 'remove' || (action === 'minus' && current <= 1)) delete cart[id];
    else if (action === 'plus') cart[id] = Math.min(99, current + 1);
    else if (action === 'minus') cart[id] = current - 1;
    save();
  });
  $('checkout')?.addEventListener('click', () => {
    if (!activeCartLines(cart).length) {
      notify('Your cart is empty.');
      return;
    }
    window.location.href = 'checkout.html';
  });
  $('menuBtn')?.addEventListener('click', () => $('nav')?.classList.toggle('show'));
  document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => $('nav')?.classList.remove('show')));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeCart(); closeProduct(); } });
  renderCart();
}
