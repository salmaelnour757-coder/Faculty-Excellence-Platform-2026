# FEP Card Layer System
`docs/03-design-system.md` — Faculty Excellence Platform design system specification
Version 1.0 — derived from the approved theme mockup (22 July 2026)

---

## 1. What this document is

This names and describes FEP's fixed visual and interaction language, separately from the customizable brand tokens (§2). This separation is deliberate: the structural system below is the original creative asset; the three brand colors are configuration data any institution sets. The IP filing points to this document as evidence of a described, named design system — not an unnamed set of CSS classes.

**Name: FEP Card Layer System.** Everything faculty-facing renders as a card, strip, or floating layer, built from one token set, with gloss and glass reserved to specific, limited surfaces rather than applied everywhere.

---

## 2. Token layers

### 2a. Customizable (institution-set, stored on `institutions`)
```
--brand-primary     institution's primary color
--brand-secondary    institution's secondary color
--brand-accent       institution's accent color
```
Default shipped values: navy `#1B2A4A` / gold `#B08D3E` / teal `#2E6E6E`.

### 2b. Derived (computed from 2a via `color-mix()`, never separately configured)
- Card header gradient: `color-mix(brand-primary, white 18%)` → `brand-primary` → `color-mix(brand-primary, black 22%)`, 135°
- Accent text/pill/progress-bar fills: `color-mix(brand-accent, ...)` at fixed ratios
- All Insight heat map cell colors derive from `brand-accent` at severity-mapped opacity, not a separate chart palette

### 2c. Surface (light/dark, switched via `data-theme` attribute — not derived from brand color)
```
Light:  --surface-page #F4F5F7   --surface-card #FFFFFF   --text-primary #161A22
Dark:   --surface-page #0E1420   --surface-card #161D2C   --text-primary #EDEFF3
```
Dark mode is a separately designed palette (lifted navy-black tones), not an inversion of light mode.

---

## 3. Components

### Card
- `border-radius: 16px`, `1px solid var(--border)`
- Two-layer resting shadow (contact + diffused): `0 1px 2px`, `0 6px 16px`
- Hover: lifts `translateY(-3px)`, shadow deepens to `0 2px 4px` / `0 16px 32px` — the only surface that lifts on hover
- Contains an optional **Card header** (gloss zone, §4) and a flat **Card body**

### Section Strip
- Full-width horizontal band, flat fill (no gradient) — used to divide page regions (e.g., separating Insight's institution view from its metric cards)
- `--surface-card` background, `1px solid var(--border)` top/bottom only

### Quote Box
- Flat card variant, `border-left: 3px solid var(--brand-accent)`, no radius on the accented side (per the no-rounded-single-border rule)
- Used for callouts — e.g., a faculty member's own reflection text in Evidence

### Pill / Badge
- `border-radius: 999px`, background `color-mix(brand-secondary 16%, transparent)`, text `color-mix(brand-secondary 55%, text-primary 45%)`
- One pill style system-wide — status, recommendation tags, tier labels all reuse it, never a one-off variant

### Primary Button
- Gradient fill using `brand-accent` (the only button-level gloss)
- Shadow: `0 4px 14px color-mix(brand-accent 45%, transparent)`, deepens on hover
- Press state: `translateY(0) scale(.98)` — no bounce, no overshoot

### Glass Panel
- Reserved exclusively for **floating, non-static** elements — toast notifications, modals, nav-on-scroll
- `backdrop-filter: blur(14px) saturate(140%)`, background `color-mix(surface-elevated 72%, transparent)`
- Never applied to a static page background or an in-flow card

---

## 4. The gloss rule (where gradient is allowed)

Gradient appears in exactly two places, system-wide:
1. Card header background (the gloss sweep)
2. Primary button fill

Nowhere else gets a gradient. This restraint is what reads as high-end rather than busy — the rule itself, consistently applied, is part of the named system.

---

## 5. Motion

One easing curve, one duration tier, everywhere:
```
--ease: cubic-bezier(.4, 0, .2, 1)
Micro-interactions (hover, press):     150ms
Card/panel state changes:              250ms
Page-level / theme-switch transitions: 400ms
```
No bounce, no overshoot curves — the restraint in the motion system matches the restraint in the gloss rule.

---

## 6. Where this lives in code

- `shared/theme/tokens.css` — §2 variables
- `shared/theme/light.css`, `shared/theme/dark.css` — §2c palettes
- `shared/components/Card.jsx`, `SectionStrip.jsx`, `QuoteBox.jsx`, `Pill.jsx`, `Button.jsx`, `GlassPanel.jsx` — one implementation each, built once against these tokens, imported everywhere else — no module re-implements its own card or button
