# CLAUDE.md

Guidance for Claude Code sessions working in this repo.

## What this is

A quick-commerce (Blinkit-style) storefront MVP with two constraints baked
into the core business logic, not just marketing copy:

1. Every catalog item must weigh under 500g (`server/catalog.js`,
   `isSellable` / `MAX_ITEM_WEIGHT_GRAMS`).
2. Delivery only happens within 5km of the single dark-store location
   (`server/geo.js`, `isWithinRadiusKm`, wired in `server/index.js`).

The catalog is deliberately stocked with cheap, high-margin, "low-grade"
items (agarbatti, matchboxes, chewing gum, cheap electronics accessories,
personal-care basics) rather than groceries — see README.md's "Why this
shape" for the business reasoning. Changing the catalog mix is fine; removing
the weight/radius constraints from the actual logic (not just the seed data)
would defeat the point of the project.

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
  points, not sourced from real supplier quotes.
- No persistence (orders vanish on server restart), no payments, no auth,
  no rider dispatch. This is a catalog + delivery-eligibility + cart-math
  MVP only — see README's "Known gaps / next steps" for the honest list.
- Single dark-store only. `isWithinRadiusKm` takes a store location as a
  parameter already, so multi-store support is a routing/selection problem
  on top of existing logic, not a rewrite of it.
