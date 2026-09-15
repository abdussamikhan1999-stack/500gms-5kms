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

## What's real research vs. still estimated

The margin split above was originally an *invented-but-plausible* estimate.
It has since been checked against real Indian retail/FMCG/quick-commerce
sources. Here's what's actually backed by a citation and what still isn't:

**Backed by real sources:**
- **Branded staples are genuinely thin-margin** (2-8%) — confirmed by
  [Setuverse's kirana margin breakdown](https://www.setuverse.com/blog/kirana-store-profit-margins),
  which explicitly calls branded atta/oil/sugar/rice "traffic drivers;
  price-sensitive; near-zero pricing power." `cooking-oil-200ml` was
  re-priced from an invented 28% down to **8.3%** to match this — branded
  packaged oil belongs in this bucket, not the loose-goods one.
- **Loose, weighed staples are a real higher-margin category** (15-30%,
  same source: "loose goods by weight (dals, spices, dry fruits) — your
  best margins"). `atta-450g`, `rice-450g`, `toor-dal-250g`, `sugar-450g`,
  and the three spice items were relabeled "loose/weighed" to make explicit
  that their 25-30%/55-60% margins assume counter-weighed sale from bulk
  stock, not a sealed branded packet — that distinction is what makes the
  margin real. A separate, lower-confidence but widely-repeated claim
  (aggregated Quora/industry answers) puts *packed* spices even higher —
  "cost price is about 25% of MRP," i.e. ~75% margin — noted here as
  corroborating direction, not used to reprice, since it's not a
  citable primary source.
- **Personal-care sachets are a real, enormous-volume Indian retail
  format**: [Simplanations' Chik Shampoo case study](https://www.simplanations.in/p/snap6-chic-shampoo-the-sachet-revolution)
  and coverage of HUL's rural strategy cite **95% of rural Indian shampoo
  sales happen via sachets** (ORG Marg data) and **~27 billion sachet units
  sold by Unilever alone annually**. Added `shampoo-sachet` and
  `detergent-sachet` at real ₹1-3 sachet price points to reflect this —
  genuinely the highest-volume format in this entire catalog, priced at
  retailer-level personal-care margin (10-20%, same Setuverse breakdown)
  rather than distributor-level (which the sources note is thin once
  rural logistics cost is factored in).
- **Snacks/packaged food and personal care are the categories quick-commerce
  itself confirms**: [RedSeer's 2026 quick-commerce category report](https://redseer.com/articles/quick-commerce-finds-its-new-normal-with-scale-mix-and-momentum/)
  and a [Shiprocket breakdown of top-selling quick-commerce categories](https://www.shiprocket.in/blog/most-selling-products-on-quick-commerce/)
  both confirm grocery/staples (~40-45% of orders) for volume, snacks &
  beverages (~32% share) for impulse-driven frequency, and personal care
  & beauty specifically flagged by RedSeer as a higher-margin category.
  Added `instant-noodles-pack`, `chocolate-bar-small` (real-world Maggi/
  Cadbury-style price points), and `toothpaste-small`, the last priced to a
  more specific claim in the same aggregated-sources search — "10% on
  other regular FMCG items (like creams/toothpaste etc)" — hence its 10%
  margin, tighter than the general 10-20% personal-care band.
- **Toothbrush as the extreme high-margin/low-volume outlier**: the same
  aggregated-sources search that flagged spice margins also claims
  "margins on some very slow-moving items like toothbrush are about
  300-500%" — folklore-level sourcing (not an official report), but
  directionally consistent with "personal care and cosmetics benefit from
  strong margins despite small basket share." Added `toothbrush` at an
  80% margin specifically to illustrate the opposite corner from
  milk/eggs: real margin, but nobody buys one daily.

**Still honestly estimated, not sourced:**
- Vegetables (onion/tomato/potato/herbs), eggs, milk, curd, and bread —
  no retailer published a hard margin number for fresh perishables at
  kirana scale in anything found so far. The 15-33% range used for these
  is a reasonable estimate of wholesale-to-retail spread, not a citation.
- Actual purchase *frequency/velocity* per SKU (as opposed to category-
  level claims like "snacks are ~32% of orders") — nothing found breaks
  this down to the individual-item level, and this app still has no real
  order history of its own to measure it directly (see "Known gaps" below).

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
