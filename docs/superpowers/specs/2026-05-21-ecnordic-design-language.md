# EC Nordic — Design Language (Pass 4)

**Date:** 2026-05-21
**Status:** Implemented — About page is the worked example
**Builds on:** `2026-05-14-ecnordic-design.md` (color tokens, type scale, nav)

---

## What this document is

Pass 3 set the *foundation* — color tokens, fonts, the crimson nav line.
This adds the *content layer*: a small kit of named components, each with
**one meaning**, that compose into any body page. It is meant to be read by
a person learning the system, not just applied. Every choice has a reason.

The guiding ideas, in order of importance:

1. **One concept, no loose decoration.** Nothing is on the page "to look
   nice." Each element states something. If a mark has no meaning, it's cut.
2. **Color encodes role.** A reader can decode the palette (see below). We
   never reach for a color because it's pretty — we reach for the one whose
   *meaning* fits.
3. **Repetition is order.** A handful of primitives, reused verbatim, is what
   makes a page feel designed. Variety comes from *which* primitive fits a
   section's job, not from inventing a new look per section.
4. **Lean on DaisyUI.** We already ship it. Every primitive is a DaisyUI
   component except one small custom atom (the icon chip). This keeps the
   system idiomatic, themeable, and portable.

---

## Color system

Two brand anchors define a **warm ↔ cool axis** (they sit nearly opposite on
the hue wheel, so they balance). Every other color is a measured step off one
anchor, with matched chroma/lightness in OKLCH so the family harmonizes.

| Token | Hue | Family | Meaning |
|-------|-----|--------|---------|
| `primary` — crimson | ~18° | warm | The program, and the one action |
| `secondary` — cobalt | ~260° | cool | People, community, wayfinding |
| `warning` — amber | ~72° | warm | Caution |
| `error` — vermilion | ~30° | warm | Error / destructive |
| `success` — pine | ~155° | cool | Free / confirmed / "go" |
| `info` — azure | ~245° | cool | Neutral information |
| `accent` — teal | ~195° | cool | Highlights & interactive accents |
| `neutral` — slate | ~255° | — | Structural UI |

**The teachable rule:** *warm = act / attention / care; cool = trust / calm /
affirm.* Caution and error are warm because they ask you to slow down or stop;
success and info are cool because they reassure.

Defined in `src/app.css` as DaisyUI theme overrides for `ecn` (light) and
`ecn-dark` (dark), each line annotated with its meaning. Constraints from
Pass 3 still hold: `oklch()` only, no hex/rgb, no hardcoded `oklch()` in
components — reference `var(--color-*)`.

---

## Typography

Unchanged from Pass 3. Nunito (display, 600/700/800) for headings, labels,
numbers; Alegreya Sans (body, 400/500/700) for prose; iA Writer Mono S for
code. Reference via `--font-display` / `--font-body` / `--font-mono`.

---

## The component kit

Each primitive: its **meaning**, the **DaisyUI** it maps to, and **when** to
reach for it.

### Module — `card`
A self-contained block of related content. Subtle by default so the page
reads as a calm stack, not a row of loud boxes.

```html
<section class="card bg-base-100 border border-base-300 shadow-sm">
  <div class="card-body"> … </div>
</section>
```

### Icon chip — `.ec-chip` (the one custom atom)
A Phosphor glyph in a tinted rounded square. Carries a section's meaning at a
glance; its **color states the role**: default = primary (crimson, program),
`.ec-chip-secondary` = secondary (cobalt, people). `.ec-chip-sm` for inline
use. Defined globally in `app.css` so any page/component can use it.

```html
<span class="ec-chip"><svg class="ec-glyph" …>…</svg></span>
<span class="ec-chip ec-chip-secondary ec-chip-sm">…</span>
```

### Caution — `alert alert-soft alert-warning`
Secondary or cautionary information that should register without alarming.
Amber, by the color rule. This is the *only* place warning color appears.

### Values list — `list` + `list-row` + numbered `badge badge-primary`
An ordered set of short, titled points (e.g. principles, steps). Honest about
sequence; the number is a `badge`, not decoration.

### Paired info — split panels
Two equal-weight, related items side by side, each in a `base-200` panel with
its own icon chip. Stacks on mobile.

### Action — `btn btn-primary`
The single thing you want the reader to do. One per view. Crimson, because the
primary action is the warm "act" color.

---

## Icon system (Phosphor)

We use [Phosphor](https://phosphoricons.com) (regular weight). Sources come
from the `@phosphor-icons/core` dev dependency.

- **In markdown-driven pages** (rendered via `{@html}`, e.g. `[slug]`): icons
  are **inlined SVG strings**, mapped per section in the page component. No
  runtime font. `fill="currentColor"` so the chip's `color` themes them.
- **In Svelte components elsewhere:** use inline SVG or, if preferred later,
  `phosphor-svelte` components — same artwork, same `.ec-glyph` sizing.

To add an icon: copy the path from
`node_modules/@phosphor-icons/core/assets/regular/<name>.svg`, wrap it with
`class="ec-glyph"`, and add it to the page's icon map.

---

## Worked example — the About page

`src/routes/[slug]/+page.svelte` → `decorateAbout()` maps each H2 section to
the primitive that fits its job, choosing the role color by meaning:

| Section | Primitive | Icon | Role color |
|---------|-----------|------|------------|
| What we do | Module card | `path` | primary |
| Risks | Caution alert | `warning` | warning |
| Who can join | Module card | `users-three` | **secondary** (people) |
| Program philosophy | Module + values list | `compass` | primary |
| Costs & volunteers | Module + split | `hand-heart`; `gift` / `hand-heart` | primary; primary / **secondary** |
| Getting started | Centered CTA card | `flag` | primary + `btn btn-primary` |

The intro lede stays large; the clarifying paragraph drops to muted. Section
order is the reader's journey: what it is → the honest caveat → can I join →
why we do it → what it costs → how to start.

---

## Reuse — do / don't

- **Do** pick the primitive whose *meaning* matches the content's job.
- **Do** let color follow the role table; if no role fits, use none.
- **Don't** add a color, line, or shape that doesn't state something.
- **Don't** invent a new section look when a primitive already fits — sameness
  is the point.
- **Don't** hardcode `oklch()` or DaisyUI v4 short vars; use `var(--color-*)`.
