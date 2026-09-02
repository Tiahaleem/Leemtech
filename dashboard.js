// ---------- Auth guard ----------
if (!localStorage.getItem("leemtech_admin_token")) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dashboardUserEmail").textContent =
    localStorage.getItem("leemtech_admin_email") || "";

  document.getElementById("logoutBtn").addEventListener("click", logout);

  setupProductForm();
  setupGalleryForm();
  loadProducts();
  loadGallery();
});

function logout() {
  localStorage.removeItem("leemtech_admin_token");
  localStorage.removeItem("leemtech_admin_email");
  window.location.href = "login.html";
}

// Wraps fetch with the auth header, and logs out automatically if the
// session has expired or is invalid.
async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  headers["Authorization"] = `Bearer ${localStorage.getItem("leemtech_admin_token")}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  return res;
}

// Safely inserts user-provided text into HTML without risking injection.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// Shows a small on-brand notification instead of a native alert().
function showToast(message, type = "success") {
  const toast = document.getElementById("dashboardToast");
  toast.textContent = message;
  toast.className = `toast toast--${type} is-visible`;

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3500);
}

// Shows an on-brand confirmation dialog instead of a native confirm().
// Returns a Promise<boolean> — true if the user confirmed.
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const cancelBtn = document.getElementById("confirmModalCancel");
    const confirmBtn = document.getElementById("confirmModalConfirm");

    document.getElementById("confirmModalMessage").textContent = message;
    modal.classList.add("is-open");

    function cleanup(result) {
      modal.classList.remove("is-open");
      cancelBtn.removeEventListener("click", onCancel);
      confirmBtn.removeEventListener("click", onConfirm);
      resolve(result);
    }
    function onCancel() {
      cleanup(false);
    }
    function onConfirm() {
      cleanup(true);
    }

    cancelBtn.addEventListener("click", onCancel);
    confirmBtn.addEventListener("click", onConfirm);
  });
}

// ========== Products ==========

async function loadProducts() {
  const listEl = document.getElementById("productList");
  listEl.innerHTML = `<p class="dashboard-empty">Loading...</p>`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const products = await res.json();

    if (!res.ok) throw new Error(products.error || "Failed to load products.");

    if (!products.length) {
      listEl.innerHTML = `<p class="dashboard-empty">No products yet.</p>`;
      return;
    }

    listEl.innerHTML = products.map(renderProductRow).join("");

    listEl.querySelectorAll("[data-edit-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = products.find((p) => String(p.id) === btn.dataset.editId);
        if (product) fillProductForm(product);
      });
    });

    listEl.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", () => deleteProduct(btn.dataset.deleteId));
    });
  } catch (err) {
    listEl.innerHTML = `<p class="dashboard-empty">Could not load products: ${escapeHtml(err.message)}</p>`;
  }
}

function renderProductRow(product) {
  const image = product.image_url
    ? `<img src="${product.image_url}" alt="${escapeHtml(product.name)}" class="dashboard-row-img">`
    : `<div class="dashboard-row-img dashboard-row-img--empty"></div>`;

  return `
    <div class="dashboard-row">
      ${image}
      <div class="dashboard-row-info">
        <p class="dashboard-row-name">${escapeHtml(product.name)}</p>
        <p class="dashboard-row-meta">Sort order: ${escapeHtml(product.sort_order ?? 0)}</p>
      </div>
      <div class="dashboard-row-actions">
        <button type="button" class="dashboard-row-bth" data-edit-id="${product.id}">Edit</button>
        <button type="button" class="dashboard-row-bth dashboard-row-bth--danger" data-delete-id="${product.id}">Delete</button>
      </div>
    </div>
  `;
}

function fillProductForm(product) {
  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name || "";
  document.getElementById("productDescription").value = product.description || "";
  document.getElementById("productFeatures").value = (product.features || []).join("\n");
  document.getElementById("productSortOrder").value = product.sort_order ?? 0;

  document.getElementById("productSubmitBtn").textContent = "Update Product";
  document.getElementById("productCancelBtn").hidden = false;

  document.getElementById("productForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetProductForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("productSubmitBtn").textContent = "Add Product";
  document.getElementById("productCancelBtn").hidden = true;
}

async function deleteProduct(id) {
  const confirmed = await showConfirm("Delete this product? This cannot be undone.");
  if (!confirmed) return;

  try {
    const res = await apiFetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete product.");
    }
    showToast("Product deleted.");
    loadProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function setupProductForm() {
  const form = document.getElementById("productForm");
  const errorEl = document.getElementById("productError");

  document.getElementById("productCancelBtn").addEventListener("click", resetProductForm);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const id = document.getElementById("productId").value;
    const formData = new FormData();
    formData.append("name", document.getElementById("productName").value.trim());
    formData.append("description", document.getElementById("productDescription").value.trim());
    formData.append("features", document.getElementById("productFeatures").value);
    formData.append("sort_order", document.getElementById("productSortOrder").value || "0");

    const imageFile = document.getElementById("productImage").files[0];
    if (imageFile) formData.append("image", imageFile);

    const submitBtn = document.getElementById("productSubmitBtn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      const res = await apiFetch(id ? `/api/products/${id}` : "/api/products", {
        method: id ? "PUT" : "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      showToast(id ? "Product updated." : "Product added.");
      resetProductForm();
      loadProducts();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// ========== Gallery ==========

async function loadGallery() {
  const listEl = document.getElementById("galleryList");
  listEl.innerHTML = `<p class="dashboard-empty">Loading...</p>`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/gallery`);
    const images = await res.json();

    if (!res.ok) throw new Error(images.error || "Failed to load gallery.");

    if (!images.length) {
      listEl.innerHTML = `<p class="dashboard-empty">No gallery images yet.</p>`;
      return;
    }

    listEl.innerHTML = images.map(renderGalleryItem).join("");

    listEl.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", () => deleteGalleryImage(btn.dataset.deleteId));
    });
  } catch (err) {
    listEl.innerHTML = `<p class="dashboard-empty">Could not load gallery: ${escapeHtml(err.message)}</p>`;
  }
}

function renderGalleryItem(item) {
  return `
    <div class="dashboard-gallery-item">
      <img src="${item.image_url}" alt="${escapeHtml(item.caption || "")}" class="dashboard-gallery-img">
      <button type="button" class="dashboard-gallery-delete" data-delete-id="${item.id}" aria-label="Delete image">&times;</button>
      ${item.caption ? `<p class="dashboard-gallery-caption">${escapeHtml(item.caption)}</p>` : ""}
    </div>
  `;
}

async function deleteGalleryImage(id) {
  const confirmed = await showConfirm("Delete this image? This cannot be undone.");
  if (!confirmed) return;

  try {
    const res = await apiFetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete image.");
    }
    showToast("Image deleted.");
    loadGallery();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function setupGalleryForm() {
  const form = document.getElementById("galleryForm");
  const errorEl = document.getElementById("galleryError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const imageFile = document.getElementById("galleryImage").files[0];
    if (!imageFile) {
      errorEl.textContent = "Please choose an image.";
      errorEl.hidden = false;
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("caption", document.getElementById("galleryCaption").value.trim());
    formData.append("sort_order", document.getElementById("gallerySortOrder").value || "0");

    const submitBtn = document.getElementById("gallerySubmitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    try {
      const res = await apiFetch("/api/gallery", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image.");

      showToast("Image added.");
      form.reset();
      loadGallery();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Image";
    }
  });
}