const test = require("node:test");
const assert = require("node:assert/strict");
const { distanceKm, isWithinRadiusKm } = require("../server/geo");

test("distanceKm is zero for identical points", () => {
  const p = { lat: 28.6139, lng: 77.209 };
  assert.equal(distanceKm(p, p), 0);
});

test("distanceKm matches a known reference distance (Delhi to Gurugram, ~25km)", () => {
  const delhi = { lat: 28.6139, lng: 77.209 };
  const gurugram = { lat: 28.4595, lng: 77.0266 };
  const km = distanceKm(delhi, gurugram);
  assert.ok(km > 20 && km < 30, `expected ~25km, got ${km}`);
});

test("isWithinRadiusKm true for a point 1km away with a 5km radius", () => {
  const store = { lat: 28.6139, lng: 77.209 };
  // ~1km north
  const customer = { lat: 28.6229, lng: 77.209 };
  assert.equal(isWithinRadiusKm(store, customer, 5), true);
});

test("isWithinRadiusKm false for a point well outside a 5km radius", () => {
  const store = { lat: 28.6139, lng: 77.209 };
  const customer = { lat: 28.4595, lng: 77.0266 }; // Gurugram, ~25km away
  assert.equal(isWithinRadiusKm(store, customer, 5), false);
});
