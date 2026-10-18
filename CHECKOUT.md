# Checkout setup

Frost & Co. is a static site. GitHub Pages can serve the pages, but it cannot create a Stripe Checkout Session, because that call needs a secret key. A Stripe Payment Link is one product only, so it cannot charge a cart of several different items.

The shop therefore does two things:

- **Gloves on their own.** ArcticHeat™ Thermal Gloves keep using the existing Payment Link (`https://buy.stripe.com/bJe8wP9hT2qXgxGenMgEg00`) until the function below is configured. If the quantity is more than 1, the checkout page asks the customer to set that quantity on the Stripe page.
- **Any cart once Stripe is connected.** `api/checkout.js` is a Vercel serverless function. The browser sends product ids and quantities. The function looks up names and prices in `site.js` and creates one Stripe Checkout Session. The secret key stays in Vercel's environment.

Placeholder products in `site.js` have `active: false`. They stay on the shop as "Coming soon" and the function rejects them.

The repo already had `vercel.json` pointed at `api/*.js`, so the function is written for Vercel rather than a second host. Netlify or Cloudflare Workers could do the same job, but they would be an extra platform for no benefit here.

## 1. Stripe

1. Open the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) and stay in **Test mode** until a test order succeeds.
2. Copy the secret key (`sk_test_...`). Do not put it in the repo, in `site.js`, or in GitHub Pages settings.
3. Optional, recommended: for each product you actually sell, create a Product and a Price in euros. Copy the Price ID (`price_...`) into that product's `priceId` in `site.js`. The Price amount should match `price` in `site.js`, because the cart shows `price` and Stripe charges the Price ID when one is set. Leave `priceId` empty to charge `price` directly (euros, converted to cents by the function).
4. Optional, recommended: create a Shipping rate and copy its ID (`shr_...`). Without it, Checkout collects an address and does not add a shipping fee. The gloves Payment Link still shows whatever shipping that link already has.

## 2. Deploy the function on Vercel

1. Import this repository as a Vercel project. Use the free Hobby plan if you like.
2. If `frost-co.org` already points at GitHub Pages, do **not** attach that domain to Vercel. Use the `*.vercel.app` address Vercel gives the project.
3. In Vercel → Project Settings → Environment Variables, set:

   | Name | Value |
   | --- | --- |
   | `STRIPE_SECRET_KEY` | `sk_test_...` (later `sk_live_...`) |
   | `APP_URL` | `https://frost-co.org` |
   | `STRIPE_SHIPPING_RATE_ID` | `shr_...` or leave unset |
   | `STRIPE_SHIPPING_COUNTRIES` | optional, for example `IE,NL,DE,FR,BE,GB` |

4. Deploy. The function URL looks like `https://YOUR-PROJECT.vercel.app/api/checkout`.

You can move the whole site to Vercel later. Then leave `CHECKOUT_ENDPOINT` in `site.js` as an empty string so the pages call `/api/checkout` on the same host, and point `frost-co.org` at Vercel instead of GitHub Pages.

## 3. Point the static site at the function

In `site.js`, set:

```js
const CHECKOUT_ENDPOINT = 'https://YOUR-PROJECT.vercel.app/api/checkout';
```

Commit and push so GitHub Pages republishes `site.js`. Until that URL is set, a cart that is only the gloves still opens the Payment Link. A cart with more than one product shows a short message on the checkout page instead of taking payment.

## 4. Sell another product

In `site.js`, on that product:

- set `active` to `true`
- set `price` in euros
- set `priceId` to a Stripe Price ID, or leave it empty to use `price`
- add an `img` path
- set `paymentLink` only if that single product should also have its own Payment Link fallback

Placeholders must stay `active: false` until they are real products.

## 5. Test

1. Use card `4242 4242 4242 4242`, any future expiry, and any CVC.
2. Add the gloves and check out. With the function connected, Stripe should show the right quantity. Without it, quantity 1 opens the Payment Link.
3. After you activate a second product, add both and check out. You should land on one Stripe page with both lines.
4. When test mode looks right, switch `STRIPE_SECRET_KEY` to the live key and redeploy the Vercel project.
