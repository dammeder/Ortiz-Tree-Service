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
    if (y > 320 && y > lastY + 4 && !nav.classList.contains("menu-open")) nav.classList.add("nav-hidden");
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
    nav?.classList.toggle("menu-open", open);
    if (open) nav?.classList.remove("nav-hidden");
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.setAttribute("aria-hidden", String(!open));
    drawer.inert = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) drawer.querySelector("a")?.focus();
  };
  hamburger.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) {
      setDrawer(false);
      hamburger.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1000 && drawer.classList.contains("open")) setDrawer(false);
  });
  setDrawer(false);
}

// ─────────────────────────────────────────────
// 3. TYPEWRITER HERO
// ─────────────────────────────────────────────
const typeEl = document.getElementById("typewriter-text");
const phrases = [
  "Tree Removal",
  "Storm Cleanup",
  "Emergency Help",
  "Trimming & Stumps",
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
const statEls = [...document.querySelectorAll("#statsBar .stat")];
if (statEls.length && !reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("stats-animated");

  const animateCount = (el) => {
    const target = Number.parseInt(el.dataset.target, 10);
    if (!Number.isFinite(target)) return;
    const duration = 950;
    let startedAt;
    const step = (now) => {
      if (startedAt === undefined) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.min(target, Math.round(eased * target)));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    el.textContent = "0";
    requestAnimationFrame(step);
  };

  const statObs = new IntersectionObserver((entries) => {
    const entering = entries.filter((entry) => entry.isIntersecting);
    entering.forEach((entry, index) => {
      const stat = entry.target;
      const delay = index * 110;
      stat.style.setProperty("--stat-delay", `${delay}ms`);
      stat.classList.add("stat-visible");
      const count = stat.querySelector(".stat-count[data-target]");
      if (count) window.setTimeout(() => animateCount(count), delay);
      statObs.unobserve(stat);
    });
  }, { threshold: 0.3 });
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
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-lrovxlJqwch_I0Sd1ROoLj6VT_0OeIF_bDolgWQsOLox_sBt8inT6d5SmyNCjiyj/exec";

const enhancedSelects = new Map();

const closeCustomSelects = (except = null) => {
  enhancedSelects.forEach(({ wrapper, close }) => {
    if (wrapper !== except) close();
  });
};

document.querySelectorAll("select[data-custom-select]").forEach((select) => {
  const field = select.closest(".field");
  if (!field) return;

  const fieldLabel = field.querySelector(`label[for="${select.id}"]`);
  if (fieldLabel && !fieldLabel.id) fieldLabel.id = `${select.id}-label`;

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", `${select.id}-options`);
  if (fieldLabel) trigger.setAttribute("aria-labelledby", fieldLabel.id);
  const describedBy = select.getAttribute("aria-describedby");
  if (describedBy) trigger.setAttribute("aria-describedby", describedBy);

  const valueLabel = document.createElement("span");
  valueLabel.className = "custom-select-value";
  valueLabel.id = `${select.id}-value`;
  if (fieldLabel) trigger.setAttribute("aria-labelledby", `${fieldLabel.id} ${valueLabel.id}`);
  trigger.append(valueLabel);

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("viewBox", "0 0 24 24");
  chevron.setAttribute("fill", "none");
  chevron.setAttribute("aria-hidden", "true");
  const chevronPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  chevronPath.setAttribute("d", "M6 9l6 6 6-6");
  chevronPath.setAttribute("stroke", "currentColor");
  chevronPath.setAttribute("stroke-width", "2");
  chevronPath.setAttribute("stroke-linecap", "round");
  chevronPath.setAttribute("stroke-linejoin", "round");
  chevron.append(chevronPath);
  trigger.append(chevron);

  const menu = document.createElement("div");
  menu.className = "custom-select-menu";
  menu.id = `${select.id}-options`;
  menu.setAttribute("role", "listbox");
  menu.setAttribute("aria-labelledby", fieldLabel?.id || "");
  menu.hidden = true;

  const options = [...select.options].filter((option) => option.value);
  const optionButtons = options.map((nativeOption, index) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "custom-select-option";
    option.id = `${select.id}-option-${index}`;
    option.dataset.value = nativeOption.value;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.textContent = nativeOption.textContent;
    menu.append(option);
    return option;
  });

  wrapper.append(trigger, menu);
  select.insertAdjacentElement("afterend", wrapper);

  const sync = () => {
    const selectedOption = select.options[select.selectedIndex] || select.options[0];
    valueLabel.textContent = selectedOption?.textContent || "Choose one";
    trigger.classList.toggle("has-value", Boolean(select.value));
    optionButtons.forEach((option) => {
      option.setAttribute("aria-selected", String(option.dataset.value === select.value));
    });
  };

  const close = (returnFocus = false) => {
    if (!wrapper.classList.contains("open")) return;
    wrapper.classList.remove("open", "opens-up");
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    if (returnFocus) trigger.focus();
  };

  const open = (focusLast = false) => {
    closeCustomSelects(wrapper);
    wrapper.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;

    const triggerRect = trigger.getBoundingClientRect();
    const stickyBarRoom = window.innerWidth < 1000 ? 88 : 16;
    const roomBelow = window.innerHeight - triggerRect.bottom - stickyBarRoom;
    const roomAbove = triggerRect.top - 16;
    const menuHeight = Math.min(menu.scrollHeight, window.innerHeight * .42);
    wrapper.classList.toggle("opens-up", roomBelow < menuHeight + 12 && roomAbove > roomBelow);

    window.requestAnimationFrame(() => {
      const selected = optionButtons.find((option) => option.getAttribute("aria-selected") === "true");
      const target = focusLast ? optionButtons.at(-1) : selected || optionButtons[0];
      target?.focus();
    });
  };

  trigger.addEventListener("click", () => {
    if (wrapper.classList.contains("open")) close();
    else open();
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    open(event.key === "ArrowUp");
  });

  optionButtons.forEach((option, index) => {
    option.addEventListener("click", () => {
      select.value = option.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
      close(true);
    });

    option.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowDown") nextIndex = (index + 1) % optionButtons.length;
      else if (event.key === "ArrowUp") nextIndex = (index - 1 + optionButtons.length) % optionButtons.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = optionButtons.length - 1;
      else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      } else if (event.key === "Tab") {
        close();
        return;
      } else {
        return;
      }
      event.preventDefault();
      optionButtons[nextIndex]?.focus();
    });
  });

  select.addEventListener("change", sync);
  select.form?.addEventListener("reset", () => window.setTimeout(sync, 0));
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");
  field.classList.add("select-enhanced");
  sync();
  enhancedSelects.set(select, { wrapper, trigger, menu, close, sync });
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".custom-select")) closeCustomSelects();
});

window.addEventListener("resize", () => closeCustomSelects());

const form = document.getElementById("quoteForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");
const successTitle = document.getElementById("successTitle");
const successIcon = successModal?.querySelector(".modal-icon");

function showResult(ok, msg) {
  if (successTitle) successTitle.textContent = ok ? "Request Sent!" : "Couldn’t Send Request";
  if (successIcon) successIcon.textContent = ok ? "✅" : "⚠️";
  if (successMsg && msg) successMsg.innerHTML = msg;
  openModal(successModal);
  closeSuccessBtn?.focus();
}

if (form && submitBtn) {
  const nameInput = form.elements.name;
  const phoneInput = form.elements.phone;
  const contactOptions = [...form.querySelectorAll('input[name="contactpref"]')];

  const sanitizeName = (value) => String(value || "")
    .replace(/[^\p{L}\p{M}\s.'’\-]/gu, "")
    .replace(/\s{2,}/g, " ");

  const hasValidName = (value) => {
    const letters = String(value || "").match(/\p{L}/gu) || [];
    return letters.length >= 2;
  };

  const phoneDigits = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    return digits.slice(0, 10);
  };

  const formatPhone = (value) => {
    const digits = phoneDigits(value);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const setFieldError = (control, message) => {
    const field = control.closest(".field");
    const error = field?.querySelector(".field-error");
    const interactiveControl = enhancedSelects.get(control)?.trigger || control;
    field?.classList.toggle("has-error", Boolean(message));
    if (error) error.textContent = message;
    if (control.type === "radio") {
      contactOptions.forEach((option) => option.setAttribute("aria-invalid", String(Boolean(message))));
    } else {
      control.setAttribute("aria-invalid", String(Boolean(message)));
      interactiveControl.setAttribute("aria-invalid", String(Boolean(message)));
    }
  };

  const validateForm = () => {
    const f = form.elements;
    const checks = [
      [f.name, hasValidName(f.name.value) ? "" : "Enter a name with at least two letters."],
      [f.phone, phoneDigits(f.phone.value).length === 10 ? "" : "Enter a 10-digit phone number."],
      [f.email, !f.email.value.trim() || f.email.validity.valid ? "" : "Please enter a valid email address."],
      [f.service, f.service.value ? "" : "Choose a service."],
      [f.timeline, f.timeline.value ? "" : "Choose a timeline."],
      [contactOptions[0], contactOptions.some((option) => option.checked) ? "" : "Choose call, text, or email."],
    ];

    checks.forEach(([control, message]) => setFieldError(control, message));
    const firstInvalid = checks.find(([, message]) => message)?.[0];
    if (firstInvalid) {
      const focusTarget = enhancedSelects.get(firstInvalid)?.trigger || firstInvalid;
      focusTarget.focus();
      focusTarget.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      return false;
    }
    return true;
  };

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
    setFieldError(phoneInput, "");
  });

  nameInput.addEventListener("input", (event) => {
    if (event.isComposing) return;
    nameInput.value = sanitizeName(nameInput.value);
    setFieldError(nameInput, "");
  });
  form.elements.email.addEventListener("input", () => setFieldError(form.elements.email, ""));
  [form.elements.service, form.elements.timeline].forEach((control) => {
    control.addEventListener("change", () => setFieldError(control, ""));
  });
  contactOptions.forEach((control) => {
    control.addEventListener("change", () => setFieldError(contactOptions[0], ""));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      contactpref: form.querySelector('input[name="contactpref"]:checked')?.value || "",
      details: f.details.value.trim(),
      website: f.website.value.trim(),
      page: window.location.href,
    };

    // Honeypot: bots commonly fill every field; real visitors never see this one.
    if (payload.website) {
      form.reset();
      showResult(true, 'We\'ll reach out as soon as possible. Or call us directly at <a href="tel:+12678866868">(267) 886-6868</a>.');
      return;
    }

    const reset = () => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request <span class="arrow">→</span>';
    };
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    let ok = false;
    let errorMessage = "";
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json();
      ok = response.ok && result.ok === true;
      if (!ok) errorMessage = result.error || "The server rejected the request.";
    } catch (error) {
      ok = false;
      errorMessage = error?.name === "AbortError"
        ? "The request timed out."
        : error instanceof Error ? error.message : "Network error";
    } finally {
      window.clearTimeout(timeoutId);
    }

    reset();
    if (ok) {
      form.reset();
      showResult(true, 'We\'ll reach out as soon as possible. Or call us directly at <a href="tel:+12678866868">(267) 886-6868</a>.');
    } else {
      console.error("Quote request failed:", errorMessage);
      showResult(false, 'Your request was not delivered. Please try again, or call or text us at <a href="tel:+12678866868">(267) 886-6868</a>.');
    }
  });
}
