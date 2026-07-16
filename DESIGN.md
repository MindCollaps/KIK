---
name: Kino im Kasten
description: Warm dark cinema-marquee system for a free, student-curated film program in Dresden.
colors:
  marquee-red-deep: "#7A1B15"
  marquee-red-strong: "#9C2419"
  marquee-red: "#C4301F"
  marquee-red-bright: "#DD5B45"
  marquee-red-pale: "#EE9683"
  projector-gold-deep: "#7A5A12"
  projector-gold-strong: "#99721A"
  projector-gold: "#C08F2E"
  projector-gold-bright: "#D7AC5C"
  projector-gold-pale: "#E8CB92"
  surface-deepest: "#0F0C0A"
  surface: "#161210"
  surface-raised: "#1D1815"
  surface-raised-alt: "#241E1A"
  surface-line: "#2B2420"
  surface-border: "#332B25"
  surface-muted: "#453A31"
  surface-strong: "#5C4F42"
  ink-brightest: "#F4F0EA"
  ink-bright: "#EAE4DB"
  ink: "#D3CABB"
  ink-muted: "#C2B7A5"
  ink-faint: "#A89C88"
  ink-faintest: "#8C7F6C"
  cream-white: "#FBF8F4"
  ink-black: "#1B1613"
  success: "#4C9E55"
  warning: "#E2941F"
  error: "#C22569"
  error-strong: "#9C1B58"
  info: "#1FAA9C"
typography:
  display:
    fontFamily: "'Bebas Neue', 'Noto Sans', Arial, sans-serif"
    fontSize: "clamp(2.875rem, 6.2vw, 5.375rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "'Bebas Neue', 'Noto Sans', Arial, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 3.625rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.02em"
  title:
    fontFamily: "'Noto Sans', Arial, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 650
    lineHeight: 1.3
  body:
    fontFamily: "'Noto Sans', Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Noto Sans', Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "14px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.marquee-red}"
    textColor: "{colors.cream-white}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.marquee-red-bright}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "rgb(251 248 244 / 4%)"
  input-field:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "18px"
---

# Design System: Kino im Kasten

## 1. Overview

**Creative North Star: "The Marquee"**

Kino im Kasten reads like a cinema marquee at night: warm near-black surfaces, a hot marquee-red accent, and a projector-gold second voice, all set under a condensed uppercase display face that could sit above a theater door. It's dark by default — the base tokens *are* the dark values, with light mode a faithful daylight translation of the same warm palette rather than a separate identity. Nothing here is corporate or slick; the system carries the confident-but-handmade feel of a student-run screening series, not a chain cinema's brand kit.

The system explicitly rejects commercial multiplex chain polish (CineStar/Cinemaxx-style corporate cinema marketing), generic startup/SaaS landing-page grammar (gradient heroes, feature grids, trust-bar clichés), and sterile university-administration styling. Warmth comes from the palette and typography, not from a cream/pastel background — the neutrals are tinted brown-black and warm-paper, never a flat gray or a generic off-white.

**Key Characteristics:**
- Condensed, uppercase, tightly-leaded display type for anything that announces (headlines, event titles, the logotype)
- One hot accent (marquee red) for action and brand marks; one warm second accent (projector gold) reserved for meta/time/label text — never both competing in the same element
- Flat, bordered surfaces layered by tone, not by shadow
- A single deliberate glass moment (the floating "today's screening" ticket card) rather than glassmorphism as a default
- Dark-first: the default experience is a warm near-black room; light mode is the same room in daylight, not a different brand

## 2. Colors

The palette is warm throughout — neutrals lean brown-black rather than true gray, tied to the same hue family as the two accent colors, so dark and light modes read as one system.

### Primary
- **Marquee Red** (#C4301F): the brand color and primary accent — hero CTAs, the logo mark, active states, focus rings. Reserved for the single most important action or signal on a screen.
- **Marquee Red Bright** (#DD5B45): hover state for primary red surfaces.
- **Marquee Red Strong** (#9C2419) / **Marquee Red Deep** (#7A1B15): focus/active states and text-on-light-surface uses of the brand color.
- **Marquee Red Pale** (#EE9683): light-touch accents on dark surfaces (changelog headings, decorative marks) where full-strength red would overpower.

### Secondary
- **Projector Gold** (#C08F2E): the film-strip accent — always paired with meta information (timestamps, dates, small supporting labels), never with primary CTAs.
- **Projector Gold Bright** (#D7AC5C): the gold used on dark surfaces for meta text (event times, ticket details) — brighter than the 500 step for legibility on near-black.
- **Projector Gold Strong** (#99721A) / **Projector Gold Deep** (#7A5A12): gold on light surfaces.
- **Projector Gold Pale** (#E8CB92): rare, light-touch decorative use.

### Neutral
- **Surface** family (Surface Deepest #0F0C0A → Surface Strong #5C4F42, 8 steps): the tonal layering system. Page background sits at Surface (#161210), cards and raised panels at Surface Raised (#1D1815), hairline borders and dividers at Surface Border (#332B25).
- **Ink** family (Ink Brightest #F4F0EA → Ink Faintest #8C7F6C, 6 steps): text tones on dark surfaces. Default body copy sits at Ink (#D3CABB); labels and eyebrows step down to Ink Muted (#C2B7A5) and Ink Faint (#A89C88).
- **Cream White** (#FBF8F4): headline color and the text color used on top of the primary-red surface — the brightest neutral in the system, reserved for emphasis, not body copy.
- **Ink Black** (#1B1613): the anchor black; rarely used directly, mostly as the seed for alpha-blended overlays.

### Semantic
- **Success** (#4C9E55), **Warning** (#E2941F), **Error** (#C22569) / **Error Strong** (#9C1B58), **Info** (#1FAA9C): toast icons, form validation, destructive button text. Deliberately distinct from Marquee Red — error uses a magenta-pink family specifically so it never competes visually with the brand accent.

### Named Rules
**The Two-Voice Rule.** Marquee red and projector gold never compete as accents in the same element. Red owns action and identity (buttons, the mark, focus states); gold owns meta and context (dates, times, small labels). If a component needs an accent and isn't a primary action or a piece of metadata, it doesn't get one — it stays neutral.

**The Warm Neutral Rule.** No neutral in this system is a true gray. Every surface and ink tone carries the same brown-red undertone as the brand hue, in both dark and light mode — flat gray or a generic cream/off-white background is a break from the system, not a valid variant.

## 3. Typography

**Display Font:** Bebas Neue (with Noto Sans, Arial, sans-serif fallback)
**Body Font:** Noto Sans — variable font, `font-variation-settings: "wdth" 100` (with Arial, sans-serif fallback)

**Character:** A condensed, all-caps marquee face paired with a clean, workmanlike variable sans. The display face does the shouting (headlines, event titles, the logotype); Noto Sans stays quiet and legible everywhere else, including inside buttons and form controls at a slightly heavier 600 weight for emphasis.

### Hierarchy
- **Display** (400, `clamp(46px, 6.2vw, 86px)`, line-height 0.95, uppercase, +0.01em tracking): hero headlines only — the single largest statement on a page.
- **Headline** (400, `clamp(32px, 4.4vw, 58px)`, line-height ~1.05, uppercase, +0.02em tracking): section titles ("Programm-Highlights", "Kalender", page headers via CommonPage).
- **Title** (650, 1.2rem, line-height 1.3, sentence case): card and article headings (program items, event cards) — the one place display type steps aside for a heavier body-family weight instead.
- **Body** (400, 0.95rem–1rem, line-height 1.55–1.7, sentence case): running copy, capped conversationally around 50–65ch in practice (see hero subtext, card descriptions).
- **Label** (700, 11px, uppercase, +0.14em tracking, Ink Muted color): eyebrows, meta lines, dates — small, wide-tracked, and always in a muted ink tone, never full-strength white.

### Named Rules
**The Marquee Rule.** Bebas Neue is reserved for display and headline roles only, always uppercase. It never appears in body copy, form fields, or anywhere legibility at small sizes matters — condensed all-caps type is for announcing, not for reading paragraphs.

## 4. Elevation

The system is flat by default: depth comes from tonal layering (surface → surface-raised → surface-border hairlines) and 1px borders, not from box-shadow. The one exception is deliberate rather than decorative: the floating "today's screening" ticket card on the homepage uses `backdrop-filter: blur(8px)` over a semi-transparent dark panel to feel like it's hovering above the hero photo. That single glass moment is the system's allowance for backdrop-blur — it is not a pattern to repeat on cards, menus, or popups generally.

### Shadow Vocabulary
- **Toast lift** (`box-shadow: 2px 2px 2px rgb(0 0 0 / 25%)`): the only conventional drop shadow in the system, used solely on toast notifications, which are the one component that floats above everything else and needs a hard separation cue.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit at rest with no shadow. Separation comes from a 1px border in Surface Border (#332B25) or a step up the surface-tone ramp (Surface → Surface Raised). Shadows are reserved for genuinely floating elements (toasts) — not for cards, buttons, or panels sitting in normal document flow.

## 5. Components

### Buttons
- **Shape:** 4px radius, 40px min-height (32px for the S size), 8px 20px padding.
- **Primary:** Marquee Red (#C4301F) background, Cream White (#FBF8F4) text. Hover → Marquee Red Bright (#DD5B45); focus/active → Marquee Red Strong (#9C2419).
- **Secondary:** transparent background, current-color text. Hover → 4% white overlay; focus/active → full Marquee Red fill (an intentional inversion — secondary buttons become primary-colored on activation).
- **Secondary Black:** Surface Muted (#453A31) background for use on already-dark chrome (the header nav); hover → Surface Strong (#5C4F42).
- **Destructive:** transparent background, Error Strong (#9C1B58) text — never a filled red background, so it's never confused with the primary brand action.
- **Link:** no background, underlined, 10px uppercase-free text in a caller-specified color; used for inline low-emphasis actions only.
- **Disabled:** 24% opacity across all variants, pointer-events removed.

### Cards / Containers
- **Corner Style:** 8px for utility containers (auth box, popups, form panels), 14px for content cards (homepage program/event cards, the hero visual frame).
- **Background:** Surface Raised (#1D1815) as the default raised tone; some overlays run at 75–88% opacity of Surface Raised over the page background for a slightly translucent layered feel without invoking blur.
- **Shadow Strategy:** none at rest — see Elevation. Separation is a 1px Surface Border line.
- **Border:** 1px, Surface Border (#332B25) in dark mode.
- **Internal Padding:** 18px for content cards, 32px for modal/auth containers.

### Inputs / Fields
- **Style:** Surface Raised (#1D1815, one step darker than page background in practice) fill, no visible border at rest, 2px transparent border reserved for state, 8px radius.
- **Focus:** border shifts to solid Marquee Red (#C4301F).
- **Error:** border shifts to solid Error (#C22569), overriding focus color.
- **Text:** Noto Sans, 13px, 600 weight — form text is deliberately heavier than body copy for scannability.

### Checkbox
- **Style:** 16×16px box, 4px radius, 1px Ink Bright (#EAE4DB) border at rest.
- **Checked:** Marquee Red fill and border, white check glyph scales in from 0 (0.3s).

### Toast
- **Style:** Ink-Brightest-family light surface (#F4F0EA-adjacent, distinctly lighter than the rest of the dark UI — toasts intentionally pop as a bright card regardless of theme), 8px radius, semantic-colored leading icon, hard drop shadow (see Elevation).
- **Behavior:** max 3 stacked at once, oldest auto-dismissed; auto-removes after its duration.

### Navigation
- **Style:** sticky header, Surface Deepest (#0F0C0A) background, 1px Surface Line (#2B2420) bottom border. Logotype pairs a red outlined mark with uppercase Bebas Neue wordmark. Menu items are Secondary-type buttons; the active route uses the "secondary-875" tone step. Submenus are absolute-positioned dropdown panels that fade/slide in on hover (0.3s), with a rotating chevron indicator.
- **Mobile:** not yet distinctly specified in code — carry the same tone and radius system into a collapsed/drawer treatment when built.

## 6. Do's and Don'ts

### Do:
- **Do** keep Bebas Neue uppercase and reserved for display/headline roles (The Marquee Rule).
- **Do** let marquee red own actions and identity, and projector gold own meta/time/label text — never both as competing accents in one element (The Two-Voice Rule).
- **Do** separate surfaces with a 1px Surface Border line or a tonal step, not a shadow (The Flat-By-Default Rule).
- **Do** keep every neutral tinted toward the brand's warm brown-red hue, in both dark and light mode (The Warm Neutral Rule).
- **Do** treat the homepage ticket card's backdrop-blur as the single glass moment in the system, not a reusable pattern.
- **Do** lead every screening/event surface with concrete, scannable facts (film, date, venue, price) — per PRODUCT.md, showing beats selling.

### Don't:
- **Don't** design toward commercial multiplex chain polish (CineStar/Cinemaxx-style corporate cinema marketing) — KiK is student-run, not a business.
- **Don't** reach for generic startup/SaaS landing-page grammar: gradient hero backgrounds, feature-grid sections, or a trust-bar of logos standing in for real proof.
- **Don't** let the site feel like a sterile university administration page — no stiff bureaucratic layout or tone.
- **Don't** use `background-clip: text` gradients on headlines, or any gradient text.
- **Don't** apply backdrop-filter/glassmorphism decoratively across cards or panels — it's reserved for the one floating ticket element.
- **Don't** use a colored `border-left`/`border-right` stripe as a callout or card accent; separation is a full 1px border or a tone shift, never a side stripe.
- **Don't** default to a flat gray or cream/pastel neutral — every gray in this system is warm-tinted on purpose.
