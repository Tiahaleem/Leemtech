let galleryImages = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadGalleryGrid();
  setupLightbox();
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

async function loadGalleryGrid() {
  const gridEl = document.getElementById("galleryGrid");

  try {
    const res = await fetch(`${API_BASE_URL}/api/gallery`);
    const images = await res.json();

    if (!res.ok) throw new Error(images.error || "Failed to load gallery.");

    if (!images.length) {
      gridEl.innerHTML = `<p class="gallery-empty">No gallery images yet — check back soon.</p>`;
      return;
    }

    galleryImages = images;
    gridEl.innerHTML = images.map(renderGalleryItem).join("");

    gridEl.querySelectorAll("[data-index]").forEach((el) => {
      el.addEventListener("click", () => openLightbox(Number(el.dataset.index)));
    });

    // Fade the grid in once populated (the elements didn't exist at page
    // load, so the scroll-reveal observer in index.js never saw them).
    requestAnimationFrame(() => {
      gridEl.classList.add("is-loaded");
    });
  } catch (err) {
    gridEl.innerHTML = `<p class="gallery-empty">Couldn't load the gallery right now. Please try again shortly.</p>`;
  }
}

function renderGalleryItem(item, index) {
  return `
    <figure class="gallery-item" data-index="${index}" role="button" tabindex="0" aria-label="View full size image">
      <img src="${item.image_url}" alt="${escapeHtml(item.caption || "Leemtech project photo")}" class="gallery-item__img" loading="lazy">
      ${item.caption ? `<figcaption class="gallery-item__caption">${escapeHtml(item.caption)}</figcaption>` : ""}
    </figure>
  `;
}

// ========== Lightbox ==========

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => showLightboxImage(currentIndex - 1));
  nextBtn.addEventListener("click", () => showLightboxImage(currentIndex + 1));

  // Click on the dark backdrop (not the image itself) closes it
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightboxImage(currentIndex - 1);
    if (e.key === "ArrowRight") showLightboxImage(currentIndex + 1);
  });

  // Also allow opening a gallery item with Enter/Space (keyboard access,
  // since the cards use role="button")
  document.getElementById("galleryGrid").addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset.index !== undefined) {
      e.preventDefault();
      openLightbox(Number(e.target.dataset.index));
    }
  });
}

function openLightbox(index) {
  document.getElementById("lightbox").classList.add("is-open");
  document.body.style.overflow = "hidden";
  showLightboxImage(index);
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("is-open");
  document.body.style.overflow = "";
}

function showLightboxImage(index) {
  const total = galleryImages.length;
  currentIndex = ((index % total) + total) % total; // wrap around both directions

  const item = galleryImages[currentIndex];
  document.getElementById("lightboxImg").src = item.image_url;
  document.getElementById("lightboxImg").alt = item.caption || "Leemtech project photo";
  document.getElementById("lightboxCaption").textContent = item.caption || "";
}