(() => {
const STRIPE_GLOVE_LINK='https://buy.stripe.com/bJe8wP9hT2qXgxGenMgEg00';
const products=[
{id:5,name:'ArcticHeat™ Thermal Gloves',category:'Clothing & Wearables',price:12.99,label:'AVAILABLE',img:'assets/arcticheat-gloves-v3.jpg',paymentLink:STRIPE_GLOVE_LINK,active:true,rail:'clothing'},
{id:101,name:'Wireless Phone Charger',category:'Electronics',price:19.99,label:'PRODUCT PLACEHOLDER',icon:'⚡',img:'',active:false,rail:'electronics'},
{id:102,name:'USB-C Fast Charger',category:'Electronics',price:14.99,label:'PRODUCT PLACEHOLDER',icon:'🔌',img:'',active:false,rail:'electronics'},
{id:103,name:'Compact Bluetooth Speaker',category:'Electronics',price:24.99,label:'PRODUCT PLACEHOLDER',icon:'♫',img:'',active:false,rail:'electronics'},
{id:104,name:'Magnetic Phone Holder',category:'Electronics',price:12.99,label:'PRODUCT PLACEHOLDER',icon:'▣',img:'',active:false,rail:'electronics'},
{id:106,name:'Everyday Hoodie',category:'Clothing & Wearables',price:29.99,label:'PRODUCT PLACEHOLDER',icon:'◒',img:'',active:false,rail:'clothing'},
{id:107,name:'Everyday Crossbody Bag',category:'Clothing & Wearables',price:22.99,label:'PRODUCT PLACEHOLDER',icon:'▱',img:'',active:false,rail:'clothing'},
{id:108,name:'Winter Beanie',category:'Clothing & Wearables',price:14.99,label:'PRODUCT PLACEHOLDER',icon:'♧',img:'',active:false,rail:'clothing'},
{id:109,name:'LED Ambient Light',category:'Home & Lifestyle',price:18.99,label:'PRODUCT PLACEHOLDER',icon:'✦',img:'',active:false,rail:'home'},
{id:110,name:'Reusable Travel Bottle',category:'Home & Lifestyle',price:16.99,label:'PRODUCT PLACEHOLDER',icon:'♧',img:'',active:false,rail:'home'},
{id:111,name:'Desk Organiser',category:'Home & Lifestyle',price:13.99,label:'PRODUCT PLACEHOLDER',icon:'▤',img:'',active:false,rail:'home'},
{id:112,name:'Mini Night Light',category:'Home & Lifestyle',price:11.99,label:'PRODUCT PLACEHOLDER',icon:'☼',img:'',active:false,rail:'home'}
];
const euro=n=>new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(n);
let cart={};try{cart=JSON.parse(localStorage.getItem('frost-cart')||'{}')||{}}catch(e){cart={}}
const $=id=>document.getElementById(id);
function notify(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.frostToastTimeout);window.frostToastTimeout=setTimeout(()=>t.classList.remove('show'),2600)}
function save(){localStorage.setItem('frost-cart',JSON.stringify(cart));renderCart()}
function openCart(){ $('drawer')?.classList.add('active');$('overlay')?.classList.add('active');$('drawer')?.setAttribute('aria-hidden','false')}
function closeCart(){ $('drawer')?.classList.remove('active');$('overlay')?.classList.remove('active');$('drawer')?.setAttribute('aria-hidden','true')}
function card(p){const media=p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy">`:`<div class="placeholder-art" aria-hidden="true">${p.icon||'＋'}</div>`;
return `<article class="product-card"><div class="product-media">${media}<span class="pill">${p.label}</span></div><div class="product-info"><div class="category">${p.category}</div><h3>${p.name}</h3><div class="price">${euro(p.price)}</div><div class="product-actions">${p.active?`<button class="add" data-add="${p.id}">＋ ADD TO CART</button><a class="button" href="${p.paymentLink}">BUY NOW →</a>`:`<button class="add" disabled title="Add a real product and payment link to activate">COMING SOON</button>`}</div>${p.active?'':'<p class="coming-soon">Placeholder — replace with your product, image and payment link.</p>'}</div></article>`}
for(const rail of ['electronics','clothing','home']){const el=$('rail-'+rail);if(el)el.innerHTML=products.filter(p=>p.rail===rail).map(card).join('')}
document.querySelectorAll('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>{const rail=btn.closest('.shop-category')?.querySelector('.product-rail');if(rail)rail.scrollBy({left:Number(btn.dataset.scroll)*Math.max(240,rail.clientWidth*.8),behavior:'smooth'})}));
document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;const p=products.find(x=>x.id===Number(b.dataset.add));if(!p?.active)return;cart[p.id]=(Number(cart[p.id])||0)+1;save();notify(p.name+' added to cart')});
function renderCart(){const items=$('cartItems');if(!items)return;let total=0,count=0,markup='';for(const [idText,qtyRaw] of Object.entries(cart)){const p=products.find(x=>x.id===Number(idText));const qty=Math.max(0,Number(qtyRaw)||0);if(!p||!qty)continue;count+=qty;total+=p.price*qty;markup+=`<div class="cart-item"><div>${p.img?`<img src="${p.img}" alt="">`:`<div class="placeholder-art" style="width:70px;height:78px;font-size:24px">${p.icon||'＋'}</div>`}</div><div><strong>${p.name}</strong><p>${euro(p.price)}</p><div class="qty"><button data-action="minus" data-id="${p.id}" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-action="plus" data-id="${p.id}" aria-label="Increase quantity">+</button><button data-action="remove" data-id="${p.id}" style="margin-left:auto;background:none;text-decoration:underline;width:auto">Remove</button></div></div></div>`}
items.innerHTML=markup||'<p class="empty">Your cart is empty. Have a look around the shop.</p>';if($('cartCount'))$('cartCount').textContent=count;if($('subtotal'))$('subtotal').textContent=euro(total)}
$('openCart')?.addEventListener('click',openCart);$('closeCart')?.addEventListener('click',closeCart);$('overlay')?.addEventListener('click',closeCart);
$('cartItems')?.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id;const action=b.dataset.action;if(action==='remove'||action==='minus'&&(Number(cart[id])||0)<=1)delete cart[id];else if(action==='plus')cart[id]=(Number(cart[id])||0)+1;else if(action==='minus')cart[id]=(Number(cart[id])||0)-1;save()});
$('checkout')?.addEventListener('click',()=>{const entries=Object.entries(cart).filter(([id,q])=>Number(q)>0);if(!entries.length){notify('Your cart is empty.');return}const unsupported=entries.filter(([id])=>!products.find(p=>p.id===Number(id))?.paymentLink);if(unsupported.length){notify('Some items are placeholders. Remove them or add payment links first.');return}if(entries.length===1&&Number(entries[0][0])===5){window.location.href='checkout.html';return}notify('For now, checkout supports the thermal gloves only.')});
$('menuBtn')?.addEventListener('click',()=>$('nav')?.classList.toggle('show'));document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>$('nav')?.classList.remove('show')));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart()});
renderCart();
})();