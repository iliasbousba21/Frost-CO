# Adding a product

Each product that is for sale has its own Stripe Payment Link. Checkout opens that link so the customer can pay for that product. The ArcticHeat™ Thermal Gloves already use:

https://buy.stripe.com/bJe8wP9hT2qXgxGenMgEg00

## Add a product

1. In the Stripe Dashboard, create a Payment Link for the product in euros. Turn on adjustable quantity if customers should be able to buy more than one. Copy the link (`https://buy.stripe.com/...`).
2. In `site.js`, update that product, or add a new row:
   - `active`: `true`
   - `paymentLink`: the link you copied
   - `price`: the same euro amount as the Payment Link
   - `name`, `category`, `img`, and `rail` (`electronics`, `clothing`, or `home`)
3. Leave every placeholder at `active: false` and without a `paymentLink`. Those rows stay “Coming soon” and cannot be added to the cart.

On the checkout page, each item in the cart has its own **Pay for this item** button. The button opens that product’s Payment Link. When the quantity is more than one, the page asks the customer to set that quantity on the Stripe page before paying.

Shipping and card details are collected by Stripe.
