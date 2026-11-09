# Keepflow — Design Direction

**Status:** locked  
**Version:** 2.0 · November 2026  
**Primary job:** turn a curious visitor into a waitlist member, and make the product feel worth waiting for.

---

## The idea

Keepflow is a clean sheet with a current running underneath: white paper, black ink, and one electric blue thread that keeps the page moving. The canvas should feel bright and exact, then deepen into a blue-black band where the product explains itself and a near-black footer where the page comes to rest.

The name is the promise: keep the day in flow. Nothing needs to shout. The confidence comes from space, precise typography, and the fact that every element has a job.

**One-sentence direction:** *A blue-lit editorial workspace for a very capable, very discreet personal agent.*

**What makes it Keepflow, not a template:** a high-contrast Instrument Serif headline with unusually tight leading, a layered blue-white canvas rather than a flat background, a single electric-blue hairline under the header, and a deep navy product band that behaves like a chapter break.

### Deliberate choices

- **White, blue, black — nothing else.** Blue is the only chromatic accent. Green, copper, purple, and warm cream are removed. A semantic red remains for errors only.
- **The canvas is layered.** Soft blue radial washes sit behind a white page, with contour lines, a fine grain, and one large blue glow behind the agent panel. Dark mode is the same idea inverted on near-black.
- **No generic card grid.** Capabilities live in a three-column editorial spread divided by hairlines. Only the mock agent interface is a contained object, because it is a real preview.
- **No fake social proof.** The waitlist count comes from the database. With no signups it says the list is open; it never invents a number.
- **No all-caps eyebrow labels.** Small sentence-case labels do the wayfinding.
- **No motion on every card.** There is one page-load sequence, one section-reveal pattern, and motion that responds to a person's action. The background is the only long-running animation.

---

## Color

The palette is intentionally small: white, black, blue, and a single semantic danger tone. Blue is used for links, focus, live states, step numbers, the header hairline, and the atmospheric canvas.

### Light theme

| Role | Hex | Notes |
|---|---|---|
| Canvas | `#F8FAFF` | Cool paper white, not cream |
| Raised surface | `#FFFFFF` | Agent panel, form inset |
| Ink | `#05070D` | Near-black text |
| Fog | `#46536B` | Muted copy; approximately 7.3:1 on canvas |
| Hairline | `rgba(5, 7, 13, 0.13)` | Borders and dividers |
| Accent | `#1C4DF5` | Electric blue; focus, links, live state |
| Accent deep | `#1740A8` | Small accent text and the wordmark dot |
| Accent wash | `rgba(28, 77, 245, 0.08)` | Tinted surfaces and quiet fills |
| Button | `#05070D` | Primary button; hover becomes accent blue |
| Danger | `#B42318` | Accessible error on light |

### Dark theme (brand default)

| Role | Hex | Notes |
|---|---|---|
| Canvas | `#04060B` | Near-black with a blue undertone, never flat `#000` |
| Raised surface | `#0A0F1A` | The agent panel, form inset |
| Ink | `#F5F8FF` | Blue-white text |
| Fog | `#9AA8C2` | Muted copy |
| Hairline | `rgba(245, 248, 255, 0.13)` | Borders and dividers |
| Accent | `#6F9BFF` | Luminous blue; focus, links, live state |
| Accent deep | `#0B1730` | Tinted surfaces and quiet fills |
| Button | `#F5F8FF` | Primary button; hover becomes accent blue |
| Danger | `#FF9B8F` | Accessible error on dark |

### Canvas system

Both themes use three large radial blue washes over a linear base. Light mode reads as white paper with blue light falling from the top-right; dark mode reads as a black room with a blue horizon.

- **Section tint:** deep navy `#050A16` with blue blooms, used for “How it works.” Text tokens are overridden inside the band so contrast stays high.
- **Referral band:** the same blue wash as the page, at low opacity, plus a hairline rule.
- **Footer:** near-black `#03050A` with a blue radial from the top-left and a blue hairline at the boundary. It closes the page in both themes.
- **Header:** translucent white or black with blur, a one-pixel blue gradient hairline, and a primary button that inverts with the theme.

The light theme is loaded automatically through `prefers-color-scheme: light` when no manual preference exists. A manual toggle persists in `localStorage` and overrides the system preference. Dark remains the fallback and the brand's primary expression.

**Rule:** color never carries meaning alone. Errors also show text and an icon; active states also show text or shape.

---

## Typography

**Display:** Instrument Serif, roman and italic, 400 only. It has a narrow, elegant profile and enough character to make a four-word promise feel like a masthead.

**Text & UI:** Jost, variable 300–600. Geometric without feeling cold, with clear small-size letterforms and a calm rhythm.

**Scale**

| Token | Size | Use |
|---|---|---|
| Hero | `clamp(3.4rem, 9.2vw, 8.75rem)` | H1 only; line-height 0.88; tracking -0.045em |
| Display | `clamp(2.35rem, 5vw, 4.8rem)` | H2; line-height 0.98; tracking -0.035em |
| Heading | `clamp(1.45rem, 2.2vw, 2rem)` | Card and panel headings |
| Body large | `clamp(1.05rem, 1.5vw, 1.2rem)` | Hero subhead and lead paragraphs |
| Body | `1rem` / 1.65 | Main copy |
| Small | `0.8125rem` / 1.5 | Legal and metadata |
| Micro | `0.6875rem` / 1.35 | Labels in the agent mock only |

Body line length is capped at 62ch. Headlines are set in sentence case, never all caps. Italic Instrument Serif is reserved for a single editorial note and the wordmark flourish, not for accenting random words.

Fonts are self-hosted under the SIL Open Font License. Licenses live in `public/fonts/`.

---

## Layout

- **Grid:** 12 columns, max width 78rem, 20px gutters at 375px and 40px at 768px+.
- **Hero:** minimum `100svh`, left-aligned copy in columns 1–8, empty space and contours in 9–12. Nav is 72px on desktop, 64px on mobile. The form is capped at 36rem so it feels like a note, not a billboard.
- **Section rhythm:** `clamp(5.5rem, 11vw, 10rem)` vertical padding. A hairline, a change in background, or the navy band marks each shift; there are no floating rounded boxes.
- **Radius:** 2px for fields, 8px for the form well, 16px for the agent panel, pill only for the primary button and status chips. Hierarchy is carried by scale and line, not by a single radius repeated everywhere.
- **Borders:** one-pixel hairlines, blue-tinted at the edges. Soft inner shadows appear only inside the form and agent panel.
- **Mobile:** 375px is the design width. No horizontal scroll, all interactive targets at least 44×44px, the email field and button stack with a full-width button, and the form stays in normal document flow so the keyboard never covers it.

---

## The ambient visual

A set of five hand-drawn contour paths drifts through the right side of the hero. They are an SVG, not a video or WebGL canvas, and they move with a single 42-second transform loop. A 3–5%-opacity grain tile sits over the page. A soft blue radial glow sits behind the agent panel and another low blue wash sits near the final CTA.

The header carries a single blue gradient hairline. It is the smallest repeating brand mark on the page.

The contours are decorative only. They are `aria-hidden`, pause when the document is hidden, and become completely static under `prefers-reduced-motion: reduce`.

The custom cursor glow is a 540px soft blue light that follows a fine pointer. It is desktop-only, hidden for coarse pointers and reduced motion, and has no effect on layout or interaction.

---

## Motion

Motion has three jobs: establish hierarchy on load, answer an action, and make the agent feel alive.

1. **Hero load:** label, headline, subhead, form, and note rise 14px and fade in over 520ms with a 70ms stagger. One sequence, no repeated scroll effects above the fold.
2. **Section reveals:** capability columns, steps, and the trust panel rise 18px and fade over 500ms when 15% visible. Each group reveals once. Reduced motion shows the final state immediately.
3. **Form response:** using Motion, the form well morphs height between the input and success states. The success panel fades and rises into place. Focus moves to the success heading, so keyboard users are not dropped at the top of the page.
4. **Button hover:** the primary button moves to electric blue with a soft blue ring and a 1.015 scale. No magnetic movement; the cursor glow already provides the tactile moment.
5. **Agent panel:** a slow progress line and a pulsing status dot suggest work in progress without hiding any content. Nothing loops aggressively; reduced motion pauses it.
6. **Theme switch:** the color tokens cross-fade over 220ms. A native View Transition circular reveal is used where supported, only when reduced motion is not requested.

No animation uses width, height, top, or left except the explicit form container measurement handled by Motion. Everything else is transform and opacity.

---

## Components and states

- **Email form:** visible label, blue-tinted border, hairline inner shadow, black primary button. On focus the field gets a 2px blue ring at 2px offset. Empty, invalid, loading, duplicate, success, rate-limited, and server-error states all have their own copy.
- **Success state:** a compact editorial receipt. Large position number, copyable referral link, X / WhatsApp / LinkedIn / copy actions. The share row wraps on mobile.
- **Count:** a live blue dot plus a sentence. Zero signups reads “The list is open. Be first in line.” It never fabricates a count.
- **FAQ:** native `<details>`/`<summary>` for reliable keyboard and screen-reader behavior, styled like a page index. The plus mark rotates to a minus.
- **Agent panel:** a translucent blue-white gradient surface in light mode, a blue-black surface in dark mode, with a blue border and a soft blue shadow.
- **Admin:** quiet, functional, no marketing. Serif headings, tabular data, a single blue accent for today's bar, and a CSV export that is safe against spreadsheet formula injection.

---

## Accessibility commitments

- WCAG 2.2 AA target; body and UI text at 4.5:1 or better.
- Visible 2px focus rings, 2px offset, on every interactive control.
- One H1, logical heading order, landmarks, skip link.
- `aria-live` for async form results; focus moved to the success/duplicate heading.
- Native form semantics, `autocomplete="email"`, `inputmode="email"`, and labels that do not disappear.
- Native disclosure elements instead of a custom ARIA widget.
- `prefers-reduced-motion` disables ambient drift, stagger reveals, cursor glow, and smooth scrolling.
- Keyboard-only path tested from nav through form, shares, FAQ, footer, and admin login.
- Charts include a visually hidden data table.

---

## Copy principles

- Lead with the outcome, not the model.
- Make one promise per section.
- Short sentences. Concrete verbs. No “supercharge,” “revolutionize,” or “unlock.”
- Performed quietness, not performed luxury.
- The product is capable; the page never has to say so twice.
- The name does the work: **keep** the day **in flow**.

See `COPY_OPTIONS.md` for the considered alternatives and the reason the chosen lines won.

---

## What was deliberately removed

- The green/copper “riverbed” palette and every warm cream surface.
- A floating glass navbar (kept the nav translucent but not glassy).
- Testimonial cards and logo strips (there are no real customers yet).
- A fake countdown (a real spring 2027 window is enough).
- Purple gradients, green glows, and warm gold accents.
- A fourth capability card, a comparison table, and a newsletter pop-up (they would dilute the one action).
- A custom animated accordion (native disclosure is better).
