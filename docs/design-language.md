# EC Nordic — Design Language

Living reference for the EC Nordic component kit, palette, and icon system.
Keep it current as the language evolves.

**Last updated:** 2026-05-21 — About page is the worked example.
**Builds on:** `docs/superpowers/specs/2026-05-14-ecnordic-design.md` (color tokens, type scale, nav).

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

**Derived UI tokens** sit alongside the role anchors when a role color needs a
contrast-safe variant for a specific surface — and they must **flip per theme**.
`--color-caution-accent` is the amber for the subtle alert's icon on its faint
wash (light); `ecn-dark` overrides it to a *brighter* amber so it clears
contrast on the dark wash. Add such a token rather than hardcoding a
one-mode `oklch()` in a component.

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

### Icon — `.ec-icon` (bare glyph, the default) / `.ec-chip` (tile, focal only)
A Phosphor glyph carries a section's meaning at a glance; its **color states
the role**: default = primary (crimson, program), `.ec-icon-secondary` =
secondary (cobalt, people).

The **default treatment is a bare glyph** (`.ec-icon`). A tinted rounded tile
(`.ec-chip`) repeated down a page reads as visual noise and fights the calm
stack, so the tile is **reserved for one focal accent per page** — on About
that's the closing CTA. Everything else is the bare glyph. Both live globally
in `app.css`.

```html
<span class="ec-icon"><svg class="ec-glyph" …>…</svg></span>        <!-- default -->
<span class="ec-icon ec-icon-secondary">…</span>                    <!-- people -->
<span class="ec-chip">…</span>                                      <!-- focal accent only -->
```

See **Icon system** below for *when* an icon is warranted at all, and the icon
matrix for the fixed glyph→meaning map.

### Subtle alert card — `.ec-alert` (+ role modifier)
A reusable **aside that still carries weight** — supplementary, set apart, but
not skippable. Anatomy: a compact **uppercase tracked label** (the rendered
heading) with a Phosphor alert glyph **inline at its head**, then quiet body
prose — slightly smaller, a step toward muted, tighter leading, so it reads as
supplementary while staying well above the readability floor. The label is
**neutral heading color, not the role color** — amber
dark enough to read as text turns muddy/brown, so the role color stays in the
*icon* (and link underline) only. A faint role-tinted wash alone sets it apart
from the card stack — **no border, no shadow**, so it recedes as an aside
instead of floating like a module. Padding matches `.card-body` (1.5rem) and the
icon sits inside the label rather than in a left column, so the label and prose
align with the card text above/below — no left-edge shift in the stack.

**Color lives only in the icon and the link underline — never the running
text or the label.** (Soft-tinted text on a soft-tinted background, the amber-on-amber trap
of DaisyUI's `alert-soft`, fails to read.) Links drop to heading color with an
accent underline that thickens on hover: high contrast, unmistakably a link, no
clash. It's a custom primitive (not DaisyUI's alert) precisely because the
alert forces colored text.

**Role is a modifier** driving two custom properties — `--alert-edge` (full
role color: the link underline) and `--alert-accent` (a contrast-safe,
theme-flipped amber for the *icon only*, via `--color-caution-accent`; the
label stays neutral):

```html
<div role="alert" class="ec-alert ec-alert-caution">
  <svg class="ec-glyph">…</svg>
  <div class="ec-alert-body"><h2>Risks</h2><p>…</p></div>
</div>
```

Today only `.ec-alert-caution` (amber) exists. Add `.ec-alert-info` (azure),
`.ec-alert-success` (pine), etc. by setting those two properties — the role
table governs which. Amber as an alert color appears nowhere else.

### Grid card — `.ec-grid`
A card body of short, titled points that are **peers, not a sequence** (e.g.
convictions, activity types, ways to help). A two-column grid, **unnumbered**:
a number would assert an order that doesn't exist, and a single column runs the
page too long. Each cell is a `base-200` tile (the same surface as the split
panels) leading with a bold display-font term. The **last cell of an odd-count
grid spans the full width** — both an orphan fix and a *featured* slot for the
longest or most important point, placed last. Colour stays in the card-head
icon; cells carry no per-cell icon or accent. Global in `app.css`.

### Paired info — split panels
Two equal-weight, related items side by side, each in a `base-200` panel that
**leads with its own bare icon on the same row as its label** (icon-beside-label,
not stacked). Stacks to one column on mobile.

### Action — `btn btn-primary`
The single thing you want the reader to do. One per view. Crimson, because the
primary action is the warm "act" color.

---

## Icon system (Phosphor)

We use [Phosphor](https://phosphoricons.com) (regular weight). Sources come
from the `@phosphor-icons/core` dev dependency.

### When to use an icon (and when not to)

Icons are inherently ambiguous — recognition depends on prior exposure, and few
glyphs are truly universal — so an icon is never the message; it *accelerates*
finding a message that the text already carries. Guidance below follows
Nielsen Norman Group's icon-usability research (see Sources).

1. **Always paired with a text label.** Every icon sits beside a heading or a
   bold label that states the meaning. No icon-only controls, no
   hover-to-reveal meaning. The icon speeds scanning; the words remove doubt.
2. **One per section, for wayfinding.** A single icon at a section head helps a
   reader scan the page's structure. That's its job. Don't sprinkle icons onto
   sub-points.
3. **Inside a section, only to label parallel choices.** An icon earns its
   place on a sub-element only when the reader is weighing distinct options
   against each other (the two cost/volunteer panels: give money vs. give time).
4. **No icon repeats on a page.** Each meaning gets its own glyph; reusing one
   glyph for two roles muddies both. (This is why the costs *section* keeps
   `hand-heart` while its panels use `hand-coins` and `handshake`.)
5. **No decorative icons.** If a glyph states nothing the text doesn't, cut it
   — same rule as the rest of the language. If it takes more than ~5 seconds to
   think of a fitting icon for a concept, there probably isn't one; use none.

**Skip the icon when** — a quick checklist; if any is true, use none:

- The concept is abstract and no glyph reads within ~5 seconds (it would be
  ambiguous or decorative).
- The glyph would only restate the adjacent label or echo a nearby icon
  (redundant).
- It sits on a sub-point that isn't one of a set of parallel choices.
- It can't carry a visible text label beside it.
- The page already uses that glyph for a different meaning.
- Its only job is to fill space or make the block "look designed."

The default is *no* icon. A section earns one for wayfinding; anything beyond
that has to clear the checklist above.

### Icon matrix (the fixed glyph → meaning map)

Every icon on the site is registered here with its single meaning. Reach for a
glyph by *meaning*; if a needed meaning isn't listed, add a row rather than
overloading an existing glyph.

| Phosphor glyph | Meaning / role | Where used | Color |
|----------------|----------------|------------|-------|
| `path` | the training path / the work | About → What we do | primary |
| `warning` | caution | About → Risks (caution callout) | warning (amber) |
| `users-three` | people / who belongs | About → Who can join | secondary |
| `compass` | direction, what guides us | About → Program philosophy | primary |
| `hand-coins` | giving money / donations | About → "Free to join" panel | primary |
| `handshake` | giving time / volunteering | About → "Lend a hand" panel | secondary |
| `flag` | start / the goal | About → Getting started (CTA) | primary |

### Implementation

- **In markdown-driven pages** (rendered via `{@html}`, e.g. `[slug]`): icons
  are **inlined SVG strings**, mapped per section in the page component. No
  runtime font. `fill="currentColor"` so `.ec-icon`'s `color` themes them.
- **In Svelte components elsewhere:** use inline SVG or, if preferred later,
  `phosphor-svelte` components — same artwork, same `.ec-glyph` sizing.

To add an icon: copy the path from
`node_modules/@phosphor-icons/core/assets/regular/<name>.svg`, wrap it via the
`svg()` helper (or `class="ec-glyph"`), add it to the page's icon map, **and
add a row to the icon matrix above.**

Sources: [NN/G — Icon Usability](https://www.nngroup.com/articles/icon-usability/),
[NN/G — Yes, Icons Need Text Labels](https://www.nngroup.com/videos/icon-text-labels/).

---

## Worked example — the About page

`src/routes/[slug]/+page.svelte` → `decorateAbout()` maps each H2 section to
the primitive that fits its job, choosing the role color by meaning:

| Section | Primitive | Icon (treatment) | Role color |
|---------|-----------|------|------------|
| What we do | Module card | `path` (bare glyph) | primary |
| Risks | Subtle alert card (`.ec-alert.ec-alert-caution`) | `warning` (chrome only) | warning |
| Who can join | Module card | `users-three` (bare glyph) | **secondary** (people) |
| Program philosophy | Grid card (`.ec-grid`) | `compass` (bare glyph) | primary |
| Costs & volunteers | Module + split | head: none (panels carry it); panels `hand-coins` / `handshake` (bare) | primary / **secondary** |
| Getting started | Centered CTA card | `flag` (**`.ec-chip` tile** — the one focal accent) | primary + `btn btn-primary` |

The intro lede stays large; the clarifying paragraph drops to muted. Section
order is the reader's journey: what it is → the honest caveat → can I join →
why we do it → what it costs → how to start.

---

## Reuse — do / don't

- **Do** pick the primitive whose *meaning* matches the content's job.
- **Do** let color follow the role table; if no role fits, use none.
- **Do** confine a container's accent color to its chrome (border, icon, wash);
  keep running text at full body/heading contrast.
- **Do** pair every icon with a text label, default to the bare glyph, and
  register new glyphs in the icon matrix.
- **Don't** add a color, line, shape, or icon that doesn't state something.
- **Don't** color running text or a link with an accent that clashes or lowers
  contrast — links in a colored container take heading color + underline.
- **Don't** number a list that isn't a sequence; don't tile every icon.
- **Don't** invent a new section look when a primitive already fits — sameness
  is the point.
- **Don't** hardcode `oklch()` or DaisyUI v4 short vars; use `var(--color-*)`.
