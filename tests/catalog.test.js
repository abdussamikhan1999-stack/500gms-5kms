const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isSellable,
  marginPct,
  cartWeightGrams,
  cartTotalRupees,
  MAX_ITEM_WEIGHT_GRAMS,
} = require("../server/catalog");

test("isSellable rejects items at or above the 500g cap", () => {
  assert.equal(isSellable({ weightGrams: 499 }), true);
  assert.equal(isSellable({ weightGrams: 500 }), false);
  assert.equal(isSellable({ weightGrams: 501 }), false);
});

test("isSellable rejects zero/negative weight", () => {
  assert.equal(isSellable({ weightGrams: 0 }), false);
  assert.equal(isSellable({ weightGrams: -5 }), false);
});

test("marginPct computes percentage margin on sale price", () => {
  assert.equal(marginPct({ costRupees: 8, priceRupees: 20 }), 60);
});

test("marginPct is 0 for a non-positive price rather than dividing by zero", () => {
  assert.equal(marginPct({ costRupees: 5, priceRupees: 0 }), 0);
});

test("cartWeightGrams and cartTotalRupees sum across quantities", () => {
  const catalogById = new Map([
    ["a", { weightGrams: 50, priceRupees: 20 }],
    ["b", { weightGrams: 15, priceRupees: 3 }],
  ]);
  const cart = [
    { productId: "a", qty: 2 },
    { productId: "b", qty: 3 },
  ];
  assert.equal(cartWeightGrams(cart, catalogById), 50 * 2 + 15 * 3);
  assert.equal(cartTotalRupees(cart, catalogById), 20 * 2 + 3 * 3);
});

test("cart helpers ignore unknown product ids rather than throwing", () => {
  const catalogById = new Map([["a", { weightGrams: 50, priceRupees: 20 }]]);
  const cart = [{ productId: "unknown", qty: 5 }];
  assert.equal(cartWeightGrams(cart, catalogById), 0);
  assert.equal(cartTotalRupees(cart, catalogById), 0);
});

test("MAX_ITEM_WEIGHT_GRAMS is the documented 500g cap", () => {
  assert.equal(MAX_ITEM_WEIGHT_GRAMS, 500);
});
