// =============================================================
// OZZY'S TREE SERVICE — script.js
// =============================================================

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─────────────────────────────────────────────
// 1. NAV — scrolled state + auto-hide on scroll-down
// ─────────────────────────────────────────────
const nav = document.getElementById("nav");
let lastY = window.scrollY;

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (nav) {
    nav.classList.toggle("scrolled", y > 60);
    if (y > 320 && y > lastY + 4) nav.classList.add("nav-hidden");
    else if (y < lastY - 4) nav.classList.remove("nav-hidden");
  }
  lastY = y;
}, { passive: true });

// ─────────────────────────────────────────────
// 2. MOBILE DRAWER
// ─────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const drawer = document.getElementById("drawer");

if (hamburger && drawer) {
  const setDrawer = (open) => {
    drawer.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    drawer.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  hamburger.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
}

// ─────────────────────────────────────────────
// 3. TYPEWRITER HERO
// ─────────────────────────────────────────────
const typeEl = document.getElementById("typewriter-text");
const phrases = [
  "Professional Tree Removal & Care",
  "Trees Down? We're On the Way.",
  "Safe, Clean, Done Right.",
];

if (typeEl && !reduceMotion) {
  let pi = 0, ci = 0, deleting = false;

  const tick = () => {
    const cur = phrases[pi];
    if (!deleting) {
      typeEl.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) { deleting = true; return setTimeout(tick, 2200); }
      setTimeout(tick, 62);
    } else {
      typeEl.textContent = cur.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, 320); }
      setTimeout(tick, 34);
    }
  };
  setTimeout(tick, 900);
}

// ─────────────────────────────────────────────
// 4. STATS COUNT-UP
// ─────────────────────────────────────────────
const easeOutQuad = (t) => t * (2 - t);

function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  if (Number.isNaN(target)) return;
  if (reduceMotion) { el.innerHTML = target + `<span class="suffix">${suffix}</span>`; return; }

  const dur = 1400;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    el.innerHTML = Math.floor(easeOutQuad(p) * target) + `<span class="suffix">${suffix}</span>`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statEls = [...document.querySelectorAll("#statsBar .stat")];
if (statEls.length) {
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const num = e.target.querySelector(".stat-num[data-target]");
      if (num) animateCount(num);
      statObs.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  statEls.forEach((el) => statObs.observe(el));
}

// ─────────────────────────────────────────────
// 5. SCROLL REVEAL + COVERAGE MAP TRIGGER
// ─────────────────────────────────────────────
const revealTargets = document.querySelectorAll(".reveal, #coverageMap");
if (revealTargets.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealTargets.forEach((el) => obs.observe(el));
}

// ─────────────────────────────────────────────
// 6. REVIEWS — drag marquee with inertia
// ─────────────────────────────────────────────
const mqWrap = document.getElementById("marqueeWrap");
const mqTrack = document.getElementById("marqueeTrack");

if (mqWrap && mqTrack && !reduceMotion) {
  const BASE = 0.4;              // px/frame leftward drift (~24px/s)
  const DRAG_THRESHOLD = 6;      // px of horizontal movement before we take over
  let x = 0;
  let vx = -BASE;               // current velocity, px/frame
  let half = mqTrack.scrollWidth / 2;
  let dragging = false;         // actively moving the track with a finger
  let pending = null;           // pointer touched down but hasn't passed the threshold
  let lastX = 0, lastT = 0, vSample = 0;

  const measure = () => { half = mqTrack.scrollWidth / 2 || half; };
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure);

  const normalize = () => {
    if (!half) return;
    while (x <= -half) x += half;
    while (x > 0) x -= half;
  };

  const frame = () => {
    if (!dragging) {
      x += vx;
      vx += (-BASE - vx) * 0.045;   // ease back to base drift
      normalize();
      mqTrack.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  mqWrap.addEventListener("pointerdown", (e) => {
    pending = { id: e.pointerId, startX: e.clientX, startY: e.clientY };
    lastX = e.clientX;
    lastT = performance.now();
    vSample = 0;
  });

  mqWrap.addEventListener("pointermove", (e) => {
    if (pending && !dragging) {
      const dx = e.clientX - pending.startX;
      const dy = e.clientY - pending.startY;
      // let vertical gestures scroll the page untouched
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > DRAG_THRESHOLD) { pending = null; return; }
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      dragging = true;
      mqWrap.classList.add("dragging");
      if (mqWrap.setPointerCapture) mqWrap.setPointerCapture(pending.id);
    }
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    x += dx;
    normalize();
    mqTrack.style.transform = `translateX(${x}px)`;
    const dt = now - lastT || 16;
    vSample = (dx / dt) * 16;
    lastX = e.clientX;
    lastT = now;
  });

  const endDrag = () => {
    pending = null;
    if (!dragging) return;
    dragging = false;
    mqWrap.classList.remove("dragging");
    if (Math.abs(vSample) > 0.5) vx = Math.max(-45, Math.min(45, vSample));
    vSample = 0;
  };
  mqWrap.addEventListener("pointerup", endDrag);
  mqWrap.addEventListener("pointercancel", endDrag);
  mqWrap.addEventListener("pointerleave", endDrag);
}

// ─────────────────────────────────────────────
// 7. MODALS (success + legal)
// ─────────────────────────────────────────────
function openModal(m) {
  if (!m) return;
  m.classList.add("open");
  m.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const card = m.querySelector(".legal-card");
  if (card) card.scrollTop = 0;
}
function closeModal(m) {
  if (!m) return;
  m.classList.remove("open");
  m.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-modal]").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(document.getElementById(trigger.dataset.modal));
  });
});

document.querySelectorAll(".modal").forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m || e.target.closest("[data-close]")) closeModal(m);
  });
});

const closeSuccessBtn = document.getElementById("closeSuccessBtn");
const successModal = document.getElementById("successModal");
if (closeSuccessBtn) closeSuccessBtn.addEventListener("click", () => closeModal(successModal));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".modal.open").forEach(closeModal);
});

// ─────────────────────────────────────────────
// 8. QUOTE FORM
// ─────────────────────────────────────────────
const SCRIPT_URL = "PLACEHOLDER_GOOGLE_SCRIPT_URL"; // TODO: paste Ozzy's Apps Script web-app URL

const form = document.getElementById("quoteForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");

function showResult(ok, msg) {
  if (successMsg && msg) successMsg.innerHTML = msg;
  openModal(successModal);
}

if (form && submitBtn) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // NB: access controls via form.elements — `form.name` resolves to the
    // form's own name property, not the <input name="name">.
    const f = form.elements;
    const payload = {
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      email: f.email.value.trim(),
      service: f.service.value,
      address: f.address.value.trim(),
      timeline: f.timeline.value,
      contactpref: f.contactpref.value,
      details: f.details.value.trim(),
      page: window.location.href,
    };

    if (!payload.name || !payload.phone || !payload.service) {
      showResult(false, "Please fill in your name, phone, and service so we can help.");
      return;
    }

    const reset = () => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request <span class="arrow">→</span>';
    };
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    // Dev / pre-backend: simulate success while the endpoint is a placeholder
    if (SCRIPT_URL === "PLACEHOLDER_GOOGLE_SCRIPT_URL") {
      await new Promise((r) => setTimeout(r, 800));
      form.reset();
      reset();
      showResult(true, 'We\'ll reach out as soon as possible. Or call us directly at <a href="tel:+12678866868">(267) 886-6868</a>.');
      return;
    }

    let ok = false;
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
    } catch (_) {
      ok = false;
    }

    reset();
    if (ok) {
      form.reset();
      showResult(true, 'We\'ll reach out as soon as possible. Or call us directly at <a href="tel:+12678866868">(267) 886-6868</a>.');
    } else {
      showResult(false, 'Something went wrong sending that. Please call or text us at <a href="tel:+12678866868">(267) 886-6868</a>.');
    }
  });
}
