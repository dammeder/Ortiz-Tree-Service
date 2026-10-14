# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

**Ozzy's Tree Service** — static lead-gen site for Ozzy (Meder's friend). Ozzy
left Ortiz Tree Service and started his own thing; this repo was the old Ortiz
site, rebuilt and rebranded (Aug 2026). All leads route to **Ozzy's** number.

- Repo name is still `Ortiz-Tree-Service` on GitHub — rename later.
- Ozzy now owns `ozzystreeservice.com`. The DNS/Pages migration is being handled
  separately; reconcile the Pages-created remote commit before changing or
  pushing the locally stale `CNAME`.
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
- **"Licensed & Insured":** confirmed by Meder; keep the claim.
- **Reviews:** all 7 are fabricated (generic names, real PA/NJ towns). Ozzy
  okayed running placeholders short-term. No real people named.
- **Images:** the six service-card photos were replaced with approved generated
  Ozzy crew images. The existing hero remains intentionally unchanged for now.
- **Logo:** none. Wordmark is text + an inline SVG leaf mark. Favicon is an
  inline SVG data URI.
- **Form backend:** live Google Sheet + Apps Script endpoint, wired into
  `SCRIPT_URL` and verified through the real website form. Notifications
  temporarily go to `mederemilev04@gmail.com`; switch to Ozzy's email and
  deploy a new Apps Script version before launch.

## TODO (post-rebuild)

- [ ] Confirm with Ozzy: exact business name, phone, email, years experience,
      licensed/insured status, 24/7 reality, service list.
- [ ] Generate: logo, hero photo, 6 service-card photos, crew shots. (Old Ortiz
      image-gen prompts are in the vault note.)
- [ ] Real reviews + Google Business Profile; wire a "See Google Reviews" link.
- [x] Stand up the form backend (new Sheet + Apps Script), paste URL into
      `SCRIPT_URL`, and verify the Sheet row + email notification.
- [ ] Finish the `ozzystreeservice.com` DNS/Pages migration, reconcile the
      remote `CNAME` commit, then rename the GitHub repo later if desired.
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
- Read Meder's vault CLAUDE.md for his working style:
  `/Users/mederemilev/marvinsroom/marvinsroom/CLAUDE.md`
