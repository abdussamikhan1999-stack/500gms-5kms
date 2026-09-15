# 500gms/5kms

A Blinkit-style quick-commerce storefront with two hard constraints baked into
the business model itself:

- **Every item weighs under 500g.** One rider, one small bag, no heavy
  lifting, no vehicle upgrades. This keeps the cost-per-delivery low enough
  that even a ₹20-60 order can be profitable.
- **Delivery radius is capped at 5km.** Short enough for a bicycle or
  scooter round trip in minutes, which is what makes fast delivery on cheap
  items economical in the first place.

Within those constraints, the catalog is deliberately built around
**high-margin, low-grade, extremely cheap items** — things like agarbatti,
matchboxes, chewing gum, hair clips, cheap earphones/cables, batteries,
lighters, condoms, sanitary pads, band-aids, tea sachets, budget sunglasses,
keychains, pens. Low absolute cost of goods (₹1-40) but 50-70%+ margin, sold
at a price point (₹3-150) where customers don't think twice.

## Why this shape

Standard quick-commerce (Blinkit/Zepto/Instamart) carries groceries and
household staples at thin margins, subsidized by scale and VC capital. This
project instead targets the *opposite* corner: minimum logistics cost (light,
small radius) paired with maximum margin (cheap-to-source items sold at an
impulse-buy price). It's a much smaller, simpler business to actually run —
one dark store, one delivery zone, a catalog you could stock from a single
wholesale trip.

## Architecture

Static frontend + Node/Express backend, same shape as this account's other
storefront projects (`mool`).

- `server/geo.js`, `server/catalog.js` — **pure logic, no I/O**: haversine
  distance/radius check, the 500g sellability rule, margin/cart math. No
  `express` or `fs` imports here, so it's tested with plain objects, no
  mocking, no server needed to run the tests.
- `server/index.js` — the only file that wires pure logic to Express routes
  and reads `data/products.json`.
- `data/products.json` — seed catalog. Every entry is validated against the
  500g cap at load time (`isSellable` filters the catalog on startup).
- `public/` — plain HTML/CSS/JS storefront: browse catalog, add to cart,
  check delivery eligibility via the browser's Geolocation API.

## Setup / run

```
npm install
npm test        # pure-logic unit tests, no server needed
npm start        # serves the app on :3000
```

Open `http://localhost:3000`.

## API

- `GET /api/products` — sellable catalog (pre-filtered by the 500g rule)
- `POST /api/delivery/check` — `{lat, lng}` → whether the address is within
  the 5km delivery radius of the single dark-store location
- `POST /api/cart/summary` — `{items: [{productId, qty}]}` → total price and
  total weight
- `GET /api/admin/margins` — per-item margin %, for catalog/sourcing decisions

## Known gaps / next steps

- `STORE_LOCATION` in `server/index.js` is a placeholder (central Delhi) —
  needs a real dark-store address before this means anything.
- No persistence layer (orders aren't saved anywhere yet), no payment
  integration, no rider/dispatch flow, no auth. This is a catalog + delivery-
  eligibility MVP, not a complete order pipeline.
- No real sourcing/inventory data yet — `data/products.json` costs/margins
  are illustrative, not sourced from actual supplier quotes.
- Single dark-store only; multi-store routing would need real logic once
  there's more than one location.
