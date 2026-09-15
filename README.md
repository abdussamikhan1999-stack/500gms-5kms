# 500gms/5kms

A Blinkit-style quick-commerce storefront with two hard constraints baked into
the business model itself:

- **Every item weighs under 500g.** One rider, one small bag, no heavy
  lifting, no vehicle upgrades. This keeps the cost-per-delivery low enough
  that even a ₹20-60 order can be profitable.
- **Delivery radius is capped at 5km.** Short enough for a bicycle or
  scooter round trip in minutes, which is what makes fast delivery on cheap
  items economical in the first place.

Within those constraints, the catalog is built around what a real kirana
(neighborhood corner store) actually sells: daily-necessity staples people
buy on repeat — eggs, milk, curd, onion/tomato/potato, atta, rice, dal,
sugar, salt, cooking oil, bread — sold in small, single/family-serving
packs (200-450g, always under the cap), plus the small convenience/impulse
items every kirana also stocks (agarbatti, matchboxes, batteries, cheap
electronics accessories, personal-care basics).

## Why this shape, and an honest note on margin

The staples are **not** high-margin — matching real kirana economics, not
an idealized one. `GET /api/admin/margins` shows the actual split:

- **Milk (15.4%), eggs (21.4%)**: thin-margin, price-sensitive commodities.
  Kirana stores don't make money on these; they stock them because a
  customer who comes in daily for milk also picks up two or three other
  things while they're there. They're a footfall/repeat-visit driver, not
  a profit center.
- **Vegetables (onion/tomato/potato, ~30-33%)**: moderate margin — real
  wholesale-to-retail markup on perishables with some handling/wastage
  built in.
- **Salt (50%), turmeric/red chilli powder (55-56%), coriander (60%)**:
  genuinely high margin. These are the "small stuff" that actually pays —
  tiny absolute cost, priced at a level where the customer never questions
  it. This is where the "high margin" part of the business model actually
  lives, not on the staples that get people in the door.
- **The original convenience-item tail** (agarbatti, matchboxes, cheap
  electronics accessories, personal care) still carries 50-70%+ margin and
  stays in the catalog for the same reason a real kirana keeps a shelf of
  it: cheap to stock, high margin, bought on impulse alongside groceries.

So the actual model is: **staples for repeat traffic, margin captured on
spices/salt/herbs and the convenience-item tail sold in the same basket** —
which is exactly how a real kirana store's economics work, not a "sell
everything at high margin" fantasy. Standard quick-commerce (Blinkit/Zepto/
Instamart) runs this same staples-plus-margin-tail model at large scale
subsidized by VC capital; this project runs the same logic at a
single-dark-store, single-neighborhood scale.

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
  are illustrative estimates of real Indian retail/wholesale price gaps, not
  sourced from actual supplier quotes. Perishables (vegetables, dairy, eggs)
  especially need real supplier pricing and spoilage/wastage accounting
  before trusting the margin numbers — a backtest-style caveat, in the same
  spirit as `~/repos/money-making`'s "don't trust a number until it's
  checked against reality."
- No cold-chain/freshness handling modeled at all — milk, curd, and eggs
  need refrigeration and have shelf life, which a pure catalog+cart model
  doesn't represent. This matters operationally (dark-store fridge capacity,
  spoilage cost) even though it doesn't change the weight/radius logic.
- Single dark-store only; multi-store routing would need real logic once
  there's more than one location.
