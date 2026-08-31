(function () {
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealOnIntersection() {
    const targets = document.querySelectorAll(
      ".home-intro h1, .home-subheading, .artist-statement p, .work-card, .artwork-detail, .artwork-copy, .artwork-meta, .explore-other-works, .site-footer .footer-inner, .top-nav-link"
    );

    if (!targets.length) return;

    targets.forEach((target, index) => {
      target.classList.add("reveal");
      target.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index * 80, 300)}ms`;
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((target) => observer.observe(target));
  }

  revealOnIntersection();

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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });

  const sortTrigger = document.querySelector("[data-sort-trigger]");
  const sortDropdown = document.querySelector("[data-sort-dropdown]");
  const sortControls = document.querySelector("[data-sort-controls]");
  const worksGrid = document.querySelector("[data-works-grid]");

  const SORT_KEY = "gilaKanaSort";
  const COLLECTION_KEY = "gilaKanaCollection";

  const defaultSort = "newest";
  const defaultCollection = "all";

  function getSort() {
    return sessionStorage.getItem(SORT_KEY) || defaultSort;
  }

  function getCollection() {
    return sessionStorage.getItem(COLLECTION_KEY) || defaultCollection;
  }

  function applySortFilter() {
    if (!worksGrid) return;
    const sort = getSort();
    const collection = getCollection();
    const cards = Array.from(worksGrid.querySelectorAll("[data-overlay-card]"));

    cards.forEach((card) => {
      const inCollection =
        collection === "all" || (card.dataset.collections || "").split(",").includes(collection);
      card.hidden = !inCollection;
    });

    const visible = cards.filter((c) => !c.hidden);
    visible.sort((a, b) => {
      const diff = Number(a.dataset.order) - Number(b.dataset.order);
      return sort === "newest" ? diff : -diff;
    });
    visible.forEach((c) => worksGrid.appendChild(c));
  }

  if (sortTrigger && sortDropdown) {
    sortTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = sortTrigger.getAttribute("aria-expanded") === "true";
      if (open) {
        closeSort();
      } else {
        openSort();
      }
    });

    sortDropdown.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-sort], [data-collection]");
      if (!btn) return;
      if (btn.hasAttribute("data-sort")) {
        sessionStorage.setItem(SORT_KEY, btn.dataset.sort);
        sortDropdown.querySelectorAll("[data-sort]").forEach((o) => o.classList.remove("is-active"));
        btn.classList.add("is-active");
      } else {
        sessionStorage.setItem(COLLECTION_KEY, btn.dataset.collection);
        sortDropdown.querySelectorAll("[data-collection]").forEach((o) => o.classList.remove("is-active"));
        btn.classList.add("is-active");
      }
      applySortFilter();
      closeSort();
    });

    document.addEventListener("click", (event) => {
      if (sortControls && !sortControls.contains(event.target)) {
        closeSort();
      }
    });
  }

  function openSort() {
    sortDropdown.hidden = false;
    sortTrigger.setAttribute("aria-expanded", "true");
  }

  function closeSort() {
    sortDropdown.hidden = true;
    sortTrigger.setAttribute("aria-expanded", "false");
  }

  function initSortUI() {
    if (!sortTrigger) return;
    const sort = getSort();
    const collection = getCollection();
    sortDropdown.querySelectorAll("[data-sort]").forEach((o) => {
      o.classList.toggle("is-active", o.dataset.sort === sort);
    });
    sortDropdown.querySelectorAll("[data-collection]").forEach((o) => {
      o.classList.toggle("is-active", o.dataset.collection === collection);
    });
  }

  initSortUI();
  applySortFilter();

  const signatureBanner = document.getElementById("signature-banner");
  if (signatureBanner && signatureBanner.classList.contains("signature-banner--home")) {
    const sigInner = signatureBanner.querySelector(".sig-inner");
    const sigImg = signatureBanner.querySelector("img");

    function updateHeader() {
      if (!sigInner || !sigImg) return;
      const offset = Math.min(1, window.scrollY / 160);
      sigInner.style.transform = `translateY(${offset * 6}px)`;
      sigImg.style.maxHeight = `${Math.max(42, 78 - offset * 26)}px`;
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
  }

  const carouselTrack = document.querySelector("[data-carousel-track]");
  if (carouselTrack) {
    const artworks = [
      { id: "divine-couple-conception", order: 1, title: "Divine Couple: Conception - A Place Where Dreams Are Born", img: "assets/images/divine-couple-conception-thumb.jpg", url: "divine-couple-conception.html", blurb: "The woman holds a lily in her hands while the man declares his love for her. The first in a series inspired by Greek signet rings" },
      { id: "divine-couple-crossing", order: 2, title: "Divine Couple: Crossing - The Path Unfolds", img: "assets/images/divine-couple-crossing-thumb.jpg", url: "divine-couple-crossing.html", blurb: "The Divine Couple are shown at the point of crossing the river in a boat, surrounded by petals, flowers and gold paint" },
      { id: "107-butterfly-effect", order: 3, title: "107 Butterfly Effect", img: "assets/images/107-butterfly-effect-thumb.jpg", url: "107-butterfly-effect.html", blurb: "This piece explores moments of manifestation, from the repeated appearance of the number 107 to butterflies and painted clouds" },
      { id: "el-encuentro", order: 4, title: "El Encuentro", img: "assets/images/el-encuentro-thumb.jpg", url: "el-encuentro.html", blurb: "El Encuentro is a mind game: chaotic at first glance, then ordered through closer inspection" }
    ];

    const currentId = carouselTrack.dataset.current;
    const sort = getSort();
    let others = artworks
      .filter((a) => a.id !== currentId)
      .sort((a, b) => (sort === "newest" ? a.order - b.order : b.order - a.order));

    others.forEach((art) => {
      const card = document.createElement("article");
      card.className = "carousel-card";
      card.setAttribute("data-overlay-card", "");
      card.innerHTML =
        '<a class="work-media" tabindex="0" href="' + art.url + '" aria-label="View ' + art.title + '">' +
        '<img src="' + art.img + '" alt="' + art.title + '" loading="lazy">' +
        '<div class="work-overlay"><div class="work-overlay-text"><p><strong>About the work:</strong><br>' + art.blurb + ' &#8230;</p></div></div>' +
        '</a>' +
        '<h3>' + art.title + '</h3>';
      carouselTrack.appendChild(card);
    });

    const prevBtn = document.querySelector("[data-carousel-prev]");
    const nextBtn = document.querySelector("[data-carousel-next]");
    const card = carouselTrack.querySelector(".carousel-card");
    const step = () => {
      const gap = parseFloat(getComputedStyle(carouselTrack).gap) || 32;
      const cardWidth = card ? card.getBoundingClientRect().width + gap : 300;
      return cardWidth;
    };

    function scrollByCards(dir) {
      const amount = step();
      const targetLeft = carouselTrack.scrollLeft + dir * amount;
      carouselTrack.scrollTo({ left: targetLeft, behavior: "smooth" });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => scrollByCards(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => scrollByCards(1));

    function loopCheck() {
      if (!carouselTrack) return;
      const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
      if (carouselTrack.scrollLeft <= 0) {
        carouselTrack.scrollTo({ left: maxScroll, behavior: "auto" });
      } else if (carouselTrack.scrollLeft >= maxScroll - 1) {
        carouselTrack.scrollTo({ left: 0, behavior: "auto" });
      }
    }

    carouselTrack.addEventListener("scroll", () => {
      const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
      if (carouselTrack.scrollLeft <= 4 || carouselTrack.scrollLeft >= maxScroll - 4) {
        loopCheck();
      }
    }, { passive: true });
  }

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
