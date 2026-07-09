// ── Google Sheets endpoint (TODO: replace with new Ortiz sheet URL)
const SCRIPT_URL = "PLACEHOLDER_GOOGLE_SCRIPT_URL";

// ─────────────────────────────────────────────
// 1. NAV — scroll state
// ─────────────────────────────────────────────
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

// ─────────────────────────────────────────────
// 2. MOBILE DRAWER
// ─────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const drawer    = document.getElementById("drawer");

hamburger.addEventListener("click", () => {
  const open = drawer.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", open);
  drawer.setAttribute("aria-hidden", !open);
  document.body.style.overflow = open ? "hidden" : "";
});

drawer.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    drawer.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  });
});

// ─────────────────────────────────────────────
// 3. TYPEWRITER HERO
// ─────────────────────────────────────────────
const phrases = [
  "WE HANDLE WHAT NATURE THROWS AT YOU.",
  "TREES DOWN? WE'RE ON THE WAY.",
  "SAFE. CLEAN. DONE RIGHT.",
];
const typeEl = document.getElementById("typewriter-text");

if (typeEl) {
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      typeEl.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 68);
    } else {
      typeEl.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 320);
        return;
      }
      setTimeout(tick, 38);
    }
  }

  // start after hero animation finishes
  setTimeout(tick, 700);
}

// ─────────────────────────────────────────────
// 4. STATS COUNT-UP
// ─────────────────────────────────────────────
function easeOutQuad(t) { return t * (2 - t); }

function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || "";
  const duration = 1500;
  let   start    = null;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const val      = Math.floor(easeOutQuad(progress) * target);
    el.innerHTML   = val + `<span class="suffix">${suffix}</span>`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll(".stat-num[data-target]");
const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      statsObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statsObs.observe(el));

// ─────────────────────────────────────────────
// 5. TRUCK SCROLLER — moves left↔right on scroll
// ─────────────────────────────────────────────
const truckScroller = document.getElementById("truckScroller");
const truckerSection = truckScroller ? truckScroller.closest(".truck-scroller-section") : null;

if (truckScroller && truckerSection) {
  let rafId = null;
  let lastScrollY = window.scrollY;

  function updateTruck() {
    const rect     = truckerSection.getBoundingClientRect();
    const vpH      = window.innerHeight;
    // how far the section has travelled through viewport: 0 = just entered bottom, 1 = just left top
    const progress = 1 - (rect.bottom / (vpH + rect.height));
    const clamped  = Math.max(0, Math.min(1, progress));

    // truck starts off left (-10vw) and drives to right (110vw)
    const xPercent = clamped * 120 - 10;
    truckScroller.style.transform = `translateX(${xPercent}vw)`;

    // flip image based on direction
    if (window.scrollY > lastScrollY) {
      truckScroller.style.transform = `translateX(${xPercent}vw) scaleX(1)`;
    } else {
      truckScroller.style.transform = `translateX(${xPercent}vw) scaleX(-1)`;
    }
    lastScrollY = window.scrollY;
    rafId = null;
  }

  window.addEventListener("scroll", () => {
    if (!rafId) rafId = requestAnimationFrame(updateTruck);
  }, { passive: true });

  updateTruck(); // init position
}

// ─────────────────────────────────────────────
// 6. WHY US — stagger-in animations
// ─────────────────────────────────────────────
const whyPhoto    = document.getElementById("whyPhoto");
const whyFeatures = document.querySelectorAll(".why-feature");

const whyPhotoObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      whyPhotoObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
if (whyPhoto) whyPhotoObs.observe(whyPhoto);

const whyFeatObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const idx   = [...whyFeatures].indexOf(e.target);
      const delay = idx * 120;
      setTimeout(() => e.target.classList.add("visible"), delay);
      whyFeatObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
whyFeatures.forEach(el => whyFeatObs.observe(el));

// ─────────────────────────────────────────────
// 7. SERVICE SCROLL DOTS
// ─────────────────────────────────────────────
const track = document.getElementById("servicesTrack");
const dots  = document.querySelectorAll(".scroll-dot");

if (track && dots.length) {
  track.addEventListener("scroll", () => {
    const scrollLeft = track.scrollLeft;
    const cardWidth  = track.querySelector(".svc-card")?.offsetWidth + 18 || 318;
    const activeIdx  = Math.round(scrollLeft / cardWidth);
    dots.forEach((d, i) => d.classList.toggle("active", i === activeIdx));
  }, { passive: true });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const cardWidth = track.querySelector(".svc-card")?.offsetWidth + 18 || 318;
      track.scrollTo({ left: i * cardWidth, behavior: "smooth" });
    });
  });
}

// ─────────────────────────────────────────────
// 8. FORM SUBMISSION
// ─────────────────────────────────────────────
const form       = document.getElementById("quoteForm");
const submitBtn  = document.getElementById("submitBtn");
const modal      = document.getElementById("successModal");
const modalMsg   = document.getElementById("modalMsg");
const closeModal = document.getElementById("closeModalBtn");

function showModal(success, msg) {
  if (success) {
    modalMsg.innerHTML = msg || "We'll reach out as soon as possible. Or call us at <a href=\"tel:+12678866868\" style=\"color:var(--green);font-weight:700\">(267) 886-6868</a>.";
  } else {
    modalMsg.innerHTML = msg || "Something went wrong. Please call us at <a href=\"tel:+12678866868\" style=\"color:var(--green);font-weight:700\">(267) 886-6868</a>.";
  }
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  closeModal.focus();
}

function hideModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

if (closeModal) closeModal.addEventListener("click", hideModal);
modal?.addEventListener("click", e => { if (e.target === modal) hideModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") hideModal(); });

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name:     form.name.value.trim(),
      phone:    form.phone.value.trim(),
      service:  form.service.value,
      timeline: form.timeline.value,
      address:  form.address.value.trim(),
      details:  form.details.value.trim(),
      page:     window.location.href,
    };

    if (!payload.name || !payload.phone || !payload.service) {
      showModal(false, "Please fill in your name, phone, and service type.");
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = "Sending…";

    // If placeholder URL still in place, simulate success in dev
    if (SCRIPT_URL === "PLACEHOLDER_GOOGLE_SCRIPT_URL") {
      await new Promise(r => setTimeout(r, 800));
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request <span class="arrow">→</span>';
      showModal(true);
      return;
    }

    let ok = false;
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        body:   JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      ok = res.ok;
    } catch (_) { ok = false; }

    submitBtn.disabled    = false;
    submitBtn.innerHTML   = 'Send Request <span class="arrow">→</span>';

    if (ok) {
      form.reset();
      showModal(true);
    } else {
      showModal(false);
    }
  });
}
