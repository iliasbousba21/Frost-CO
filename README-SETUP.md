# FROST & CO. — Stripe checkout (no database)

This package updates your existing static HTML/CSS/JS shop to use Stripe-hosted Checkout with server-side payment creation and verification. **It does not use Supabase or any other database.** Stripe's Dashboard is where you review payment records.

## Hosting

This package uses Vercel serverless API routes (`/api/...`), so it must be deployed to Vercel or another host that supports compatible server-side functions. GitHub Pages alone cannot run these API routes and GitHub says Pages is not intended for running an online business/e-commerce site primarily facilitating commercial transactions. You can keep GitHub as the code repository.

If `frost-co.org` is already connected to the Vercel deployment that contains these files, set `APP_URL=https://frost-co.org`. If the domain is hosted elsewhere or this new integration is not deployed to the domain yet, use the exact public origin of the Vercel deployment until DNS/domain setup is complete.

## What's included

- `checkout.html`: reads the existing `frost-cart` localStorage cart and sends quantity to the server.
- `api/create-checkout-session.js`: creates Stripe Checkout Sessions server-side. The product price is fixed at EUR 12.99 on the server, so the browser cannot change it.
- `api/stripe-webhook.js`: verifies Stripe webhook signatures and logs verified paid sessions. It does not store orders in a separate database.
- `api/order-status.js` + `success.html`: retrieves the Checkout Session directly from Stripe and shows success only when Stripe reports it as paid.
- `.env.example`: required Vercel environment variables.

Without a database, there is no custom order database or fulfilment dashboard. Use Stripe Dashboard to view payments. Make sure you have a reliable way to use Stripe payment records and Checkout customer/shipping details to fulfil orders.

## 1. Stripe setup

1. Create/sign in to your Stripe account and start in **test mode**.
2. Create a shipping rate in Stripe Dashboard (menu wording can vary). Set a real delivery charge and delivery estimate you can honour. Copy its `shr_...` ID. The checkout code requires a configured shipping rate.
3. In Stripe Dashboard → Developers → Webhooks, add an endpoint:
   `https://frost-co.org/api/stripe-webhook`
   Use this URL only if `frost-co.org` is actually routed to this Vercel deployment. Otherwise use the deployment URL first, e.g. `https://YOUR-PROJECT.vercel.app/api/stripe-webhook`.
4. Subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy the endpoint's signing secret (`whsec_...`). Use the test-mode endpoint/secret while testing.

## 2. Vercel environment variables

In Vercel → Project → Settings → Environment Variables, add:

- `APP_URL` = exact deployed website origin, no trailing slash. Use `https://frost-co.org` only if the domain is connected to this deployment.
- `STRIPE_SECRET_KEY` = Stripe **test** secret key (`sk_test_...`) while testing.
- `STRIPE_WEBHOOK_SECRET` = signing secret for the matching test-mode webhook (`whsec_...`).
- `STRIPE_SHIPPING_RATE_ID` = test-mode shipping rate ID (`shr_...`) created in the same Stripe mode.

Select Production (and Preview/Development only if you need those environments), save, and redeploy after changing variables. Do not put secret keys in frontend code or commit them to GitHub.

## 3. Deploy and test

1. Put the contents of this folder at the root of the repository; keep `api/` at the repository root.
2. Import the repository into Vercel or redeploy the existing Vercel project with these files.
3. Ensure the actual website domain is connected to this Vercel project. A live domain does not by itself mean it is hosted on Vercel.
4. Set the four environment variables and redeploy.
5. In Stripe test mode, add ArcticHeat™ Thermal Gloves to the cart and go through checkout using a Stripe test card from Stripe's official testing docs.
6. Confirm the success page only reports success after Stripe confirms payment, and confirm the test payment appears in Stripe Dashboard. Also test cancellation and a declined payment.

## 4. Go live only after testing

1. Finish Stripe account verification and confirm the account can accept payments and pay out.
2. Create a **live-mode** shipping rate and a live-mode webhook endpoint (its signing secret differs from test mode).
3. Replace the Stripe secret key, webhook signing secret and shipping rate ID with their matching live-mode values in Vercel. Keep test and live values separate.
4. Confirm `APP_URL` is the real production origin and test the full flow again carefully before accepting real orders.
5. Confirm VAT/tax treatment, shipping costs and delivery promises, returns/consumer terms, privacy notice, product compliance, and customer support details. VAT is not automatically calculated by this starter.

## Product and shipping configuration

The server currently sells product ID `5`, “ArcticHeat™ Thermal Gloves”, for EUR 12.99, quantity 1–10. It allows shipping to Belgium, Netherlands, France, Germany and Luxembourg. Change these only in `api/create-checkout-session.js` after confirming your actual product, price and shipping policy.

## Important age/account note

Stripe says that if the account user is under 18, a legal guardian must become the account owner before the account can accept payments and pay out funds. Arrange this with your guardian and use truthful business and payout details.

## Troubleshooting

- “Checkout is not configured yet”: check that all four environment variables exist in Vercel and redeploy.
- Stripe rejects the shipping rate: create/copy a rate from the same Stripe mode as the API key.
- Webhook returns 400: use the signing secret for that exact webhook endpoint and mode.
- Checkout is paid but success page does not confirm: check Vercel function logs and confirm `STRIPE_SECRET_KEY` matches the mode used for checkout.
- Cart is empty on checkout: add the product from `index.html` first; cart storage key is `frost-cart`, product ID `5`.

## Official references

- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Stripe Checkout: https://docs.stripe.com/payments/checkout
- Stripe webhooks: https://docs.stripe.com/webhooks
- Stripe age requirement: https://support.stripe.com/questions/age-requirement-to-create-a-stripe-account
