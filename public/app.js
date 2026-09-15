const cart = new Map(); // productId -> qty
let products = [];

async function loadProducts() {
  const res = await fetch("/api/products");
  products = await res.json();
  renderCatalog();
}

function renderCatalog() {
  const catalog = document.getElementById("catalog");
  catalog.innerHTML = "";

  const byCategory = new Map();
  for (const p of products) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category).push(p);
  }

  for (const [category, items] of [...byCategory.entries()].sort()) {
    const section = document.createElement("section");
    section.className = "category-section";
    section.innerHTML = `<h2 class="category-heading">${category}</h2>`;

    const grid = document.createElement("div");
    grid.className = "category-grid";
    for (const p of items) {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <h3>${p.name}</h3>
        <div class="meta">₹${p.priceRupees} · ${p.weightGrams}g</div>
        <button data-id="${p.id}">Add</button>
      `;
      card.querySelector("button").addEventListener("click", () => addToCart(p.id));
      grid.appendChild(card);
    }

    section.appendChild(grid);
    catalog.appendChild(section);
  }
}

function addToCart(productId) {
  cart.set(productId, (cart.get(productId) || 0) + 1);
  syncCart();
}

async function syncCart() {
  const items = [...cart.entries()].map(([productId, qty]) => ({ productId, qty }));
  const res = await fetch("/api/cart/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const summary = await res.json();

  const list = document.getElementById("cart-items");
  list.innerHTML = "";
  for (const [productId, qty] of cart.entries()) {
    const product = products.find((p) => p.id === productId);
    const li = document.createElement("li");
    li.textContent = `${product?.name ?? productId} x${qty}`;
    list.appendChild(li);
  }

  document.getElementById("cart-weight").textContent = summary.totalWeightGrams;
  document.getElementById("cart-total").textContent = summary.totalRupees;
}

document.getElementById("check-location").addEventListener("click", () => {
  const status = document.getElementById("delivery-status");
  if (!navigator.geolocation) {
    status.textContent = "Geolocation not supported by this browser.";
    return;
  }
  status.textContent = "Checking...";
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const res = await fetch("/api/delivery/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      });
      const data = await res.json();
      status.textContent = data.deliverable
        ? `✅ Deliverable (within ${data.radiusKm}km)`
        : `❌ Outside ${data.radiusKm}km delivery radius`;
    },
    () => {
      status.textContent = "Location permission denied.";
    }
  );
});

loadProducts();
