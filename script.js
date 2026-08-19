(function () {
  const body = document.body;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuOverlay = document.querySelector("[data-menu-overlay]");

  function openMenu() {
    if (!menuOverlay || !menuToggle) return;
    menuOverlay.hidden = false;
    requestAnimationFrame(() => {
      menuOverlay.classList.add("is-open");
      body.classList.add("menu-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close navigation menu");
    });
  }

  function closeMenu() {
    if (!menuOverlay || !menuToggle) return;
    menuOverlay.classList.remove("is-open");
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    window.setTimeout(() => {
      if (!menuOverlay.classList.contains("is-open")) {
        menuOverlay.hidden = true;
      }
    }, 280);
  }

  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      if (menuOverlay.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuOverlay.addEventListener("click", (event) => {
      if (event.target === menuOverlay || event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        closeLightbox();
      }
    });
  }

  document.querySelectorAll("[data-overlay-card]").forEach((card) => {
    const media = card.querySelector(".work-media");
    if (!media) return;

    media.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      document.querySelectorAll("[data-overlay-card].is-open").forEach((openCard) => {
        if (openCard !== card) openCard.classList.remove("is-open");
      });
      card.classList.toggle("is-open");
    });

    media.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("is-open");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-overlay-card]")) {
      document.querySelectorAll("[data-overlay-card].is-open").forEach((card) => {
        card.classList.remove("is-open");
      });
    }
  });

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxStage = document.querySelector("[data-lightbox-stage]");
  const closeButton = document.querySelector("[data-lightbox-close]");
  const zoomInButton = document.querySelector("[data-zoom-in]");
  const zoomOutButton = document.querySelector("[data-zoom-out]");
  const zoomResetButton = document.querySelector("[data-zoom-reset]");

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;
  let lastPinchDistance = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateLightboxTransform() {
    if (!lightboxImage) return;
    if (scale <= 1) {
      offsetX = 0;
      offsetY = 0;
    }
    lightboxImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  function setScale(nextScale) {
    scale = clamp(nextScale, 1, 4);
    updateLightboxTransform();
  }

  function resetLightbox() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    updateLightboxTransform();
  }

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Artwork detail";
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    resetLightbox();
    closeButton && closeButton.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
    if (lightboxImage) {
      lightboxImage.removeAttribute("src");
      lightboxImage.removeAttribute("alt");
    }
    resetLightbox();
  }

  document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const image = trigger.querySelector("img");
      openLightbox(trigger.dataset.fullSrc || image.src, image ? image.alt : "");
    });
  });

  if (closeButton) closeButton.addEventListener("click", closeLightbox);
  if (zoomInButton) zoomInButton.addEventListener("click", () => setScale(scale + 0.35));
  if (zoomOutButton) zoomOutButton.addEventListener("click", () => setScale(scale - 0.35));
  if (zoomResetButton) zoomResetButton.addEventListener("click", resetLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  if (lightboxStage) {
    lightboxStage.addEventListener("wheel", (event) => {
      event.preventDefault();
      setScale(scale + (event.deltaY < 0 ? 0.18 : -0.18));
    }, { passive: false });

    lightboxStage.addEventListener("pointerdown", (event) => {
      if (scale <= 1) return;
      isDragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      startOffsetX = offsetX;
      startOffsetY = offsetY;
      lightboxStage.classList.add("is-dragging");
      lightboxStage.setPointerCapture(event.pointerId);
    });

    lightboxStage.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      offsetX = startOffsetX + event.clientX - dragStartX;
      offsetY = startOffsetY + event.clientY - dragStartY;
      updateLightboxTransform();
    });

    lightboxStage.addEventListener("pointerup", (event) => {
      isDragging = false;
      lightboxStage.classList.remove("is-dragging");
      if (lightboxStage.hasPointerCapture(event.pointerId)) {
        lightboxStage.releasePointerCapture(event.pointerId);
      }
    });

    lightboxStage.addEventListener("touchstart", (event) => {
      if (event.touches.length === 2) {
        lastPinchDistance = getPinchDistance(event.touches);
      }
    }, { passive: true });

    lightboxStage.addEventListener("touchmove", (event) => {
      if (event.touches.length !== 2 || !lastPinchDistance) return;
      event.preventDefault();
      const nextDistance = getPinchDistance(event.touches);
      setScale(scale * (nextDistance / lastPinchDistance));
      lastPinchDistance = nextDistance;
    }, { passive: false });

    lightboxStage.addEventListener("touchend", () => {
      lastPinchDistance = 0;
    });
  }

  function getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }
})();
