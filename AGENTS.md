# AGENTS.md

Guidance for Codex working in this repo.

## What this is

**Ozzy's Tree Service** — static lead-gen site for Ozzy (Meder's friend). Ozzy
left Ortiz Tree Service and started his own thing; this repo was the old Ortiz
site, rebuilt and rebranded (Aug 2026). All leads route to **Ozzy's** number.

- Repo name is still `Ortiz-Tree-Service` on GitHub — rename later.
- `CNAME` still points at `ortiztrees.services` (Meder owns the domain). It's a
  placeholder host until Ozzy has budget for his own domain.
- Stack: plain HTML/CSS/JS, GitHub Pages, no build step.
- Fonts: Playfair Display (display) + Inter (body). Palette: forest green
  (`--brand #0a5a2a`, `--cta #0c6b31`, `--accent #46b56a`) on near-black
  `--bg #0b120e`, cream nav.

## Design lineage

Built as **Ducky's site as the skin + Ortiz's engineering as the guts**:
- From Ducky (`~/github/Ducky-Tree-Service`): forest bg + cream nav aesthetic,
  section lineup, steps bar, hero media card, contact layout, footer.
- Ported from the old Ortiz build: typewriter hero, count-up stats, animated SVG
  coverage map, touch-safe reviews marquee, Privacy/Terms modals, `.js`-gated
  scroll-reveal, nav auto-hide, mobile sticky CTA, `prefers-reduced-motion`.

**Mobile-first is the hard rule.** Base CSS is mobile; `min-width` queries layer
on tablet/desktop. Locked interaction decisions:
- Services: every card's content is always visible, vertically stacked, plain
  scroll. No flip / accordion / horizontal-scroll. Desktop = 3-col grid.
- Reviews: JS drift-marquee that never pause-locks. Finger drag takes over 1:1
  (after a 6px threshold so taps/vertical-scroll pass through), releases back
  into the drift with momentum. No hover logic.

## Business data

- **Phone (all leads):** (267) 886-6868 → `tel:+12678866868`
- **Service area:** Philadelphia base, all PA + NJ. Counties: Philadelphia,
  Bucks, Montgomery, Delaware, Chester, Camden NJ, Burlington NJ, Gloucester NJ.
- **Services (6):** Tree Removal, Tree Trimming, Stump Grinding, Emergency
  Service, Storm Damage, Lot Clearing.

## Placeholders — DO NOT ship to real launch without confirming with Ozzy

Grep `TODO` in `index.html`. Ozzy was unreachable when this was built; these are
educated guesses:
- **Years experience:** stat says `10+` — unconfirmed.
- **Satisfaction:** stat says `100%` — puffery placeholder.
- **"Licensed & Insured":** claimed in hero, why-section, footer — UNVERIFIED.
- **Reviews:** all 7 are fabricated (generic names, real PA/NJ towns). Ozzy
  okayed running placeholders short-term. No real people named.
- **Images:** hero + 6 service cards are Ducky's photos (two show a "DUCKY'S
  TREE SERVICE" shirt). Ozzy has zero real assets — everything needs generating.
- **Logo:** none. Wordmark is text + an inline SVG leaf mark. Favicon is an
  inline SVG data URI.
- **Form backend:** `SCRIPT_URL` in `script.js` is `PLACEHOLDER_GOOGLE_SCRIPT_URL`
  — the form fakes a success response. Needs a new Google Apps Script + Sheet.

## TODO (post-rebuild)

- [ ] Confirm with Ozzy: exact business name, phone, email, years experience,
      licensed/insured status, 24/7 reality, service list.
- [ ] Generate: logo, hero photo, 6 service-card photos, crew shots. (Old Ortiz
      image-gen prompts are in the vault note.)
- [ ] Real reviews + Google Business Profile; wire a "See Google Reviews" link.
- [ ] Stand up the form backend (new Sheet + Apps Script), paste URL into
      `SCRIPT_URL`.
- [ ] Buy Ozzy a domain, update `CNAME` + DNS, rename the GitHub repo.
- [ ] Font experiments if Playfair feels too formal for the brand.
- [ ] Verify mobile on a real device / DevTools responsive mode — the browser
      automation used to build this was locked at a 1710px viewport, so mobile
      breakpoints were written mobile-first but not pixel-verified.

## Old Ortiz assets

Everything Ortiz-branded (trucks with the competitor's real phone number, Ortiz
logo art, worker-in-Ortiz-shirt photo) is in `_ortiz-archive/` (gitignored, kept
on disk for reference). Do not reference these from the site.

## Dev

- Local: `cd ~/github/Ortiz-Tree-Service && python3 -m http.server 8899` →
  http://localhost:8899/
- Never auto-commit or auto-push — ask Meder.
- Read Meder's vault AGENTS.md for his working style:
  `/Users/mederemilev/marvinsroom/marvinsroom/AGENTS.md`
