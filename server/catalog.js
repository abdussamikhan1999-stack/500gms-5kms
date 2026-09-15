// Pure catalog rules — no I/O. The core business constraint lives here:
// every sellable item must weigh under 500g, full stop.

const MAX_ITEM_WEIGHT_GRAMS = 500;

function isSellable(item) {
  return item.weightGrams > 0 && item.weightGrams < MAX_ITEM_WEIGHT_GRAMS;
}

function marginPct(item) {
  if (item.priceRupees <= 0) return 0;
  return ((item.priceRupees - item.costRupees) / item.priceRupees) * 100;
}

function cartWeightGrams(cartItems, catalogById) {
  return cartItems.reduce((total, ci) => {
    const item = catalogById.get(ci.productId);
    return total + (item ? item.weightGrams * ci.qty : 0);
  }, 0);
}

function cartTotalRupees(cartItems, catalogById) {
  return cartItems.reduce((total, ci) => {
    const item = catalogById.get(ci.productId);
    return total + (item ? item.priceRupees * ci.qty : 0);
  }, 0);
}

module.exports = {
  MAX_ITEM_WEIGHT_GRAMS,
  isSellable,
  marginPct,
  cartWeightGrams,
  cartTotalRupees,
};
