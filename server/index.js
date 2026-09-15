const express = require("express");
const path = require("path");
const fs = require("fs");
const { isWithinRadiusKm } = require("./geo");
const {
  isSellable,
  marginPct,
  cartWeightGrams,
  cartTotalRupees,
  MAX_ITEM_WEIGHT_GRAMS,
} = require("./catalog");

const DELIVERY_RADIUS_KM = 5;

// Single dark-store location for this MVP — real multi-store routing is a
// later problem, not needed to validate the core weight/radius model.
const STORE_LOCATION = { lat: 28.6139, lng: 77.209 }; // placeholder: central Delhi

const PRODUCTS = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "products.json"), "utf8")
).filter(isSellable);

const productsById = new Map(PRODUCTS.map((p) => [p.id, p]));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/products", (req, res) => {
  res.json(
    PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      priceRupees: p.priceRupees,
      weightGrams: p.weightGrams,
      category: p.category,
    }))
  );
});

app.post("/api/delivery/check", (req, res) => {
  const { lat, lng } = req.body || {};
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat and lng (numbers) required" });
  }
  const deliverable = isWithinRadiusKm(STORE_LOCATION, { lat, lng }, DELIVERY_RADIUS_KM);
  res.json({ deliverable, radiusKm: DELIVERY_RADIUS_KM });
});

app.post("/api/cart/summary", (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  for (const ci of items) {
    if (!productsById.has(ci.productId)) {
      return res.status(400).json({ error: `unknown productId: ${ci.productId}` });
    }
  }
  res.json({
    totalRupees: cartTotalRupees(items, productsById),
    totalWeightGrams: cartWeightGrams(items, productsById),
    maxItemWeightGrams: MAX_ITEM_WEIGHT_GRAMS,
  });
});

app.get("/api/admin/margins", (req, res) => {
  res.json(
    PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      marginPct: Number(marginPct(p).toFixed(1)),
    }))
  );
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`500gms/5kms listening on :${PORT}`));
}

module.exports = app;
