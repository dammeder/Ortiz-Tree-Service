// mark JS as active so CSS can safely hide scroll-reveal elements
document.documentElement.classList.add("js");

// ── Google Sheets endpoint (TODO: replace with new Ortiz sheet URL)
const SCRIPT_URL = "PLACEHOLDER_GOOGLE_SCRIPT_URL";

// ─────────────────────────────────────────────
// 1. NAV — scroll state
// ─────────────────────────────────────────────
const nav = document.getElementById("nav");
let lastNavY = window.scrollY;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 60);

  // hide on scroll-down (past the hero), reveal on scroll-up
  if (y > 320 && y > lastNavY + 4) {
    nav.classList.add("nav-hidden");
  } else if (y < lastNavY - 4) {
    nav.classList.remove("nav-hidden");
  }
  lastNavY = y;
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
// 4. STATS COUNT-UP + TRUCK REVEAL
// ─────────────────────────────────────────────
function easeOutQuad(t) { return t * (2 - t); }

function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || "";
  const duration = 1400;
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

const statsBar = document.getElementById("statsBar");
const statEls  = statsBar ? [...statsBar.querySelectorAll(".stat")] : [];

function revealStat(stat) {
  if (!stat || stat.dataset.revealed) return;
  stat.dataset.revealed = "1";
  stat.classList.add("visible");
  const num = stat.querySelector(".stat-num[data-target]");
  if (num) animateCount(num);
}

const statsTruck   = document.getElementById("statsTruck");
const desktopTruck = window.matchMedia("(min-width: 981px)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (statsBar && statsTruck && desktopTruck && !reduceMotion) {
  // DESKTOP: the truck drives across the stats bar and reveals each stat in its wake
  statsBar.classList.add("truck-mode");
  let rafId = null;

  function updateTruck() {
    rafId = null;
    const rect = statsBar.getBoundingClientRect();
    const vpH  = window.innerHeight;
    // 0 → 1 as the bar travels from entering the viewport bottom to leaving the top
    const progress = Math.max(0, Math.min(1, (vpH - rect.top) / (vpH + rect.height)));

    const truckW = statsTruck.offsetWidth || 120;
    const travel = rect.width + truckW * 1.6;          // fully off-left → fully off-right
    const x      = progress * travel - truckW * 1.3;
    statsTruck.style.transform = `translateX(${x}px)`;

    // reveal a stat once the truck's front bumper has passed its center
    const bumperX = rect.left + x + truckW;
    statEls.forEach(stat => {
      const s = stat.getBoundingClientRect();
      if (bumperX >= s.left + s.width * 0.5) revealStat(stat);
    });
    if (progress >= 0.98) statEls.forEach(revealStat); // safety: never leave one hidden
  }

  const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(updateTruck); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  if (!statsTruck.complete) statsTruck.addEventListener("load", onScroll);
  updateTruck();
} else if (statEls.length) {
  // MOBILE / reduced-motion: no truck — just staggered reveal + count-up on scroll-in
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { revealStat(e.target); statObs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => statObs.observe(el));
}

// ─────────────────────────────────────────────
// 6. SCROLL REVEAL — generic .visible toggle
// ─────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  ".why-map-wrap, .why-inner, .svc-card, .field"
);
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
revealEls.forEach(el => revealObs.observe(el));

// ─────────────────────────────────────────────
// 7. SERVICE SCROLL DOTS
// ─────────────────────────────────────────────
const track = document.getElementById("servicesTrack");
const dots  = document.querySelectorAll(".scroll-dot");

function cardStep() {
  const w = track.querySelector(".svc-card")?.getBoundingClientRect().width;
  return (w ? w + 18 : 300);
}

if (track && dots.length) {
  track.addEventListener("scroll", () => {
    const activeIdx = Math.round(track.scrollLeft / cardStep());
    dots.forEach((d, i) => d.classList.toggle("active", i === activeIdx));
  }, { passive: true });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: i * cardStep(), behavior: "smooth" });
    });
  });
}

// Service cards: hover reveals the overlay on mouse, but touch has no hover —
// so on touch devices, tapping a card toggles its .flipped state (and closes siblings).
const isTouch = window.matchMedia("(hover: none)").matches;
if (isTouch) {
  document.querySelectorAll(".svc-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // let the CTA links inside the overlay work normally
      if (e.target.closest("a")) return;
      const wasOpen = card.classList.contains("flipped");
      document.querySelectorAll(".svc-card.flipped").forEach(c => c.classList.remove("flipped"));
      if (!wasOpen) card.classList.add("flipped");
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

// ─────────────────────────────────────────────
// 9. LEGAL MODALS (privacy / terms)
// ─────────────────────────────────────────────
function closeLegal(m) {
  m.classList.remove("open");
  m.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-modal]").forEach(trigger => {
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    const m = document.getElementById(trigger.dataset.modal);
    if (!m) return;
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    m.scrollTop = 0;
  });
});

document.querySelectorAll(".legal-modal").forEach(m => {
  m.addEventListener("click", (e) => {
    if (e.target === m || e.target.closest("[data-close]")) closeLegal(m);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".legal-modal.open").forEach(closeLegal);
  }
});
