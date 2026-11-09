# Rill — Design Direction

**Status:** locked  
**Version:** 1.0 · November 2026  
**Primary job:** turn a curious visitor into a waitlist member, and make the product feel worth waiting for.

---

## The idea

Rill is a small stream: quiet, continuous, and strong enough to change the shape of a day. The page should feel like a room at dusk — dim, warm, unhurried — with one living element: a set of pale river contours moving almost imperceptibly behind the hero.

The name is a permission slip. Nothing about this page needs to shout. The confidence comes from space, exact typography, and the fact that every element has a job.

**One-sentence direction:** *A dark editorial field journal for a very capable, very discreet personal agent.*

**What makes it Rill, not a template:** slow topographic contour lines rather than abstract gradients, a high-contrast Instrument Serif headline with unusually tight leading, and a warm bone form set directly into the page instead of floating in a glass card.

### Deliberate choices

- **No purple, no neon, no glowing brain.** The accent is a quiet lichen green that only appears on focus, links, live dots, and the progress line.
- **No generic card grid.** Capabilities live in a three-column editorial spread divided by hairlines. Only the mock agent interface is a contained object, because it is a real preview.
- **No fake social proof.** The waitlist count comes from the database. With no signups it says the list is open; it never invents a number.
- **No all-caps eyebrow labels.** Small sentence-case labels do the wayfinding.
- **No motion on every card.** There is one page-load sequence, one section-reveal pattern, and motion that responds to a person's action. The background is the only long-running animation.

---

## Color

The palette is intentionally small: one dark base, one bone neutral, one fog neutral, one living accent, and a single danger tone.

### Dark theme (brand default)

| Role | Hex | Notes |
|---|---|---|
| Canvas | `#0C0F0C` | Peat black with a green undertone, never pure black |
| Raised surface | `#121712` | The agent panel, form inset |
| Ink | `#EDE8DC` | Warm bone; approximately 15.8:1 on canvas |
| Fog | `#A7AA9C` | Muted copy; approximately 7.6:1 on canvas |
| Hairline | `rgba(237, 232, 220, 0.14)` | Borders and dividers |
| Lichen | `#C0D0AC` | Accent, focus, live state; approximately 11.5:1 on canvas |
| Lichen deep | `#263226` | Tinted surfaces and quiet fills |
| Danger | `#F3A48D` | Accessible error on dark |

### Light theme

| Role | Hex | Notes |
|---|---|---|
| Canvas | `#EEEADF` | Morning stone, slightly green rather than cream |
| Raised surface | `#F7F3E9` | Form and panel inset |
| Ink | `#111711` | Forest-black text; approximately 16.9:1 on canvas |
| Fog | `#576154` | Muted copy; approximately 6.6:1 on canvas |
| Hairline | `rgba(17, 23, 17, 0.16)` | Borders and dividers |
| Lichen | `#385235` | Accent and focus; approximately 8.1:1 on canvas |
| Lichen deep | `#DCE5D4` | Tinted surfaces |
| Danger | `#9B341F` | Accessible error on light |

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
- **Section rhythm:** `clamp(5.5rem, 11vw, 10rem)` vertical padding. A hairline or a change in background marks each shift; there are no floating rounded boxes.
- **Radius:** 2px for fields, 8px for the form well, 16px for the agent panel, pill only for the primary button and status chips. Hierarchy is carried by scale and line, not by a single radius repeated everywhere.
- **Borders:** one-pixel hairlines, slightly warmer than the canvas. Soft inner shadows appear only inside the form and agent panel.
- **Mobile:** 375px is the design width. No horizontal scroll, all interactive targets at least 44×44px, the email field and button stack with a full-width button, and the form stays in normal document flow so the keyboard never covers it.

---

## The ambient visual

A set of five hand-drawn contour paths drifts through the right side of the hero. They are an SVG, not a video or WebGL canvas, and they move with a single 42-second transform loop. A 4%-opacity grain tile and a very soft radial wash sit over the top.

The contours are decorative only. They are `aria-hidden`, pause when the document is hidden, and become completely static under `prefers-reduced-motion: reduce`.

The custom cursor glow is a 260px soft light that follows a fine pointer. It is desktop-only, hidden for coarse pointers and reduced motion, and has no effect on layout or interaction.

---

## Motion

Motion has three jobs: establish hierarchy on load, answer an action, and make the agent feel alive.

1. **Hero load:** label, headline, subhead, form, and note rise 14px and fade in over 520ms with a 70ms stagger. One sequence, no repeated scroll effects above the fold.
2. **Section reveals:** capability columns, steps, and the trust panel rise 18px and fade over 500ms when 15% visible. Each group reveals once. Reduced motion shows the final state immediately.
3. **Form response:** using Motion, the form well morphs height between the input and success states. The success panel fades and rises into place. Focus moves to the success heading, so keyboard users are not dropped at the top of the page.
4. **Button hover:** a soft lichen glow and a 1.015 scale. No magnetic movement; the cursor glow already provides the tactile moment.
5. **Agent panel:** a slow progress line and a pulsing status dot suggest work in progress without hiding any content. Nothing loops aggressively; reduced motion pauses it.
6. **Theme switch:** the color tokens cross-fade over 220ms. A native View Transition circular reveal is used where supported, only when reduced motion is not requested.

No animation uses width, height, top, or left except the explicit form container measurement handled by Motion. Everything else is transform and opacity.

---

## Components and states

- **Email form:** visible label, border, hairline inner shadow, bone primary button. On focus the field gets a 2px lichen ring at 2px offset. Empty, invalid, loading, duplicate, success, rate-limited, and server-error states all have their own copy.
- **Success state:** a compact editorial receipt. Large position number, copyable referral link, X / WhatsApp / LinkedIn / copy actions. The share row wraps on mobile.
- **Count:** a live dot plus a sentence. Zero signups reads “The list is open. Be first in line.” It never fabricates a count.
- **FAQ:** native `<details>`/`<summary>` for reliable keyboard and screen-reader behavior, styled like a page index. The plus mark rotates to a minus.
- **Admin:** quiet, functional, no marketing. Serif headings, tabular data, a single accent for today's bar, and a CSV export that is safe against spreadsheet formula injection.

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

See `COPY_OPTIONS.md` for the considered alternatives and the reason the chosen lines won.

---

## What was deliberately removed

- A floating glass navbar (kept the nav opaque and quiet).
- Testimonial cards and logo strips (there are no real customers yet).
- A fake countdown (a real spring 2027 window is enough).
- Purple gradients and glowing orbs (the contours are the visual signature).
- A fourth capability card, a comparison table, and a newsletter pop-up (they would dilute the one action).
- A custom animated accordion (native disclosure is better).
