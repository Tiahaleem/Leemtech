document.addEventListener("DOMContentLoaded", () => {
  loadProductsGrid();
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

async function loadProductsGrid() {
  const gridEl = document.getElementById("productsGrid");

  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const products = await res.json();

    if (!res.ok) throw new Error(products.error || "Failed to load products.");

    if (!products.length) {
      gridEl.innerHTML = `<p class="gallery-empty">No products listed yet — check back soon.</p>`;
      return;
    }

    gridEl.innerHTML = products.map(renderProductCard).join("");

    requestAnimationFrame(() => {
      gridEl.classList.add("is-loaded");
    });
  } catch (err) {
    gridEl.innerHTML = `<p class="gallery-empty">Couldn't load the catalog right now. Please try again shortly.</p>`;
  }
}

function renderProductCard(product) {
  const image = product.image_url
    ? `<img class="grid-product-img" src="${product.image_url}" alt="${escapeHtml(product.name)}">`
    : "";

  const description = product.description
    ? `<p class="products-page-desc">${escapeHtml(product.description)}</p>`
    : "";

  const features = (product.features || [])
    .map((line) => {
      const [label, ...rest] = String(line).split(":");
      const value = rest.join(":").trim();
      return value
        ? `<li><span class="spec-label">${escapeHtml(label.trim())}</span>: ${escapeHtml(value)}</li>`
        : `<li>${escapeHtml(line)}</li>`;
    })
    .join("");

  return `
    <div class="grid-product-container_panel">
      ${image}
      <div class="grid-product-txt">
        <h3 class="panels">${escapeHtml(product.name)}</h3>
        ${description}
        ${features ? `<ul class="spec-list">${features}</ul>` : ""}
      </div>
    </div>
  `;
}