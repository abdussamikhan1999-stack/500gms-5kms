# CLAUDE.md

Guidance for Claude Code sessions working in this repo.

## What this is

A quick-commerce (Blinkit-style) storefront MVP with two constraints baked
into the core business logic, not just marketing copy:

1. Every catalog item must weigh under 500g (`server/catalog.js`,
   `isSellable` / `MAX_ITEM_WEIGHT_GRAMS`).
2. Delivery only happens within 5km of the single dark-store location
   (`server/geo.js`, `isWithinRadiusKm`, wired in `server/index.js`).

The catalog models a real kirana store's actual mix, not an idealized
"everything is high margin" one — see README.md's "Why this shape, and an
honest note on margin" AND "What's real research vs. still estimated" for
the full reasoning and citations. In short: daily-necessity staples (milk,
eggs, vegetables, atta, rice, dal, sugar, oil, bread) are priced at
realistic thin-to-moderate margins (milk ~15%, eggs ~21%, vegetables
~30-33%, branded oil ~8%) because that's what drives repeat daily visits,
not profit. Actual margin is captured on loose/weighed staples and
spices (25-60%, backed by a real "loose goods by weight = best margins"
citation), personal-care sachets (huge real volume — 95% of rural shampoo
sales, ~27B units/yr for Unilever alone — at 10-20% retailer margin), and
the original convenience-item tail (agarbatti, batteries, cheap electronics
accessories, toothbrush — 50-80%+).

**When adding catalog items, price them to this same realistic split, and
prefer a real citation over inventing a number** — README's "What's real
research vs. still estimated" section is the running ledger of which
prices are backed by a source (Setuverse's kirana margin breakdown,
RedSeer/Shiprocket quick-commerce category reports, the HUL sachet-revolution
citations) versus which are still honest guesses (currently: vegetables,
eggs, milk, curd, bread — no hard perishables-margin source found yet).
Update that ledger when you add or reprice anything; don't just add a new
line to `data/products.json` without saying which bucket it's in. Changing
the catalog mix is fine; removing the weight/radius constraints from the
actual logic (not just the seed data) would defeat the point of the project.

## Architecture: pure logic separated from I/O

This mirrors the pattern already established in this account's other
projects (`~/repos/money-making`, `~/repos/scraping-practice`): keep "decide
whether this is valid" separable from "the framework/network/filesystem that
feeds it."

- `server/geo.js` and `server/catalog.js` are **pure** — no `express`, no
  `fs`, no `Date.now()`. Tested directly with plain objects in `tests/`,
  no server spin-up, no mocking.
- `server/index.js` is the only file that imports `express` or reads
  `data/products.json` from disk. It filters the loaded catalog through
  `isSellable` at startup, so an accidentally-oversized item in
  `products.json` never becomes orderable even if someone forgets to check
  it by hand.
- `public/` is framework-free HTML/CSS/JS. `app.js` calls the same three
  API routes `index.js` exposes; there's no separate frontend build step.

## Testing

`npm test` runs `node --test`, which auto-discovers `tests/*.test.js` — no
test framework dependency added, consistent with this account's general
preference for stdlib over frameworks where the built-in tool is sufficient.
Tests run against plain objects/Maps, matching the pure-logic split above.

## Known placeholder / not-yet-real

- `STORE_LOCATION` in `server/index.js` is a hardcoded central-Delhi
  lat/lng placeholder, not a real dark-store address.
- `data/products.json` costs/prices/margins are illustrative starting
  points, not sourced from real supplier quotes — perishables (vegetables,
  dairy, eggs) especially need real numbers before trusting margin claims.
- No cold-chain/freshness/spoilage modeling — milk, curd, and eggs need
  refrigeration and have shelf life; the catalog+cart logic doesn't
  represent this at all yet.
- No persistence (orders vanish on server restart), no payments, no auth,
  no rider dispatch. This is a catalog + delivery-eligibility + cart-math
  MVP only — see README's "Known gaps / next steps" for the honest list.
- Single dark-store only. `isWithinRadiusKm` takes a store location as a
  parameter already, so multi-store support is a routing/selection problem
  on top of existing logic, not a rewrite of it.
