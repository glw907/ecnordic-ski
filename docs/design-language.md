# EC Nordic — Design Language

Living reference for the EC Nordic component kit, palette, and icon system.
Keep it current as the language evolves.

**Last updated:** 2026-05-20 — typography scale, label ramp, vertical rhythm, motion, and the page-refinement process documented.
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

Three families, each by role: **Nunito** (display — headings, labels, numbers,
600/700/800), **Alegreya Sans** (body — prose, 400/400-italic/500/700),
**iA Writer Mono S** (code). Reference via `--font-display` / `--font-body` /
`--font-mono`; never hardcode family names.

**Real italic.** Alegreya Sans ships a true italic face (`AlegreyaSans-Italic.woff2`,
400). Every `<em>`, blockquote, and description gets the designed italic — never
a browser-synthesised slant. Don't set `font-style: italic` on text expecting a
weight/face that isn't loaded.

### The scale — every level reasoned on more than one axis

Hierarchy is carried by **size + weight + colour + leading/tracking together**,
never by size alone. Each level states its job:

| Role | Font · size | Weight | Colour | Leading | Tracking |
|------|-------------|--------|--------|---------|----------|
| Page title | Nunito · clamp→2.25rem | 800 | heading | 1.15 | −0.02em |
| Section head (h2 / card) | Nunito · 1.25–1.3rem | 700 | heading | 1.25 | −0.01em |
| Subhead (h3) | Nunito · 1.05rem | 700 | heading | 1.3 | 0 |
| Lede | Alegreya · 1.15rem | 500 | heading | 1.55 | 0 |
| Body | Alegreya · 1.03–1.05rem | 400 | body | 1.62 | 0 |
| Supporting prose | Alegreya · 0.85–0.95rem | 400 | **body-soft** | 1.5 | 0 |
| Term / mini-label | Nunito · 1.0rem | 700 | heading | 1.3 | 0 |
| Eyebrow / label | Nunito · 0.68–0.8rem | 700 | muted (or role) | — | ramp ↓ |
| Meta / caption | Alegreya · 0.72rem | 400 | muted / faint | 1.3 | 0 |

Two governing rules behind the numbers:

1. **Leading is inverse to size** — large display is tight (1.15); body is open
   (1.62). List items run a touch tighter (1.55) since lines are short.
2. **Uppercase tracking loosens as size shrinks** — the eyebrow ramp:
   `0.80rem → 0.09em`, `0.78 → 0.09`, `0.75 → 0.095`, `0.72 → 0.10`,
   `0.70 → 0.105`, `0.68 → 0.11em`. All uppercase labels are Nunito 700 so a
   label (a date, a section eyebrow, a table header) reads with one voice
   wherever it appears.

**`--color-body-soft`** is the supporting-prose colour — one measured step from
`body` toward `muted`, themed in both modes. It marks *elaboration that sits
under a term or heading* (grid cells, alert body, the About intro context
paragraph): quieter than body, but well clear of `muted`'s caption weight.
`muted` stays reserved for genuinely secondary text (meta, captions) — never for
a substantive paragraph.

### Vertical rhythm

Spacing steps on a consistent ~1.5× scale so the stack feels composed:
**0.5rem** (heading → its body) → **0.9rem** (gap between sibling tiles: grid
cells, split panels) → **1.4rem** (module-to-module, and lede → first section).
The page title takes a little extra (1.6rem) as the top-of-page anchor.

---

## Motion — page entrance

A body page resolves as **one top-to-bottom cascade**: the title fades up first
(0s), then the lede (0.06s), then each module in document order. It walks the
eye down the page in reading order and makes the stack feel like it *settles*
rather than blinking in. Keep it subtle — it should be felt, not watched.

**Keyframes.** `page-rise` (title + lede) and `module-rise` (each module) both
fade from `opacity:0` + `translateY` up to rest, `0.5–0.55s`,
`cubic-bezier(0.22, 1, 0.36, 1)`, `both`.

**The stagger.** Each module gets a delay via an inline `--rise` custom property;
the CSS reads `animation-delay: var(--rise, 0s)`. The delay is
**`0.16 + index × 0.04s`** — a *tight* step, so the modules read as a single
wave, not section-by-section (a larger step makes the individual fades
noticeable, which we don't want).

**Two rules:**
1. **Disable the page-level rise on a page that staggers its modules**
   (`.static-page[data-page="…"] { animation: none }`) — otherwise the container
   transform and the module transforms compound and the motion looks doubled.
2. **Always honour `prefers-reduced-motion`** — set `animation: none` on the
   page, title, lede, and modules in the reduce block. Non-negotiable.

**Applying to a new page.** Emit the per-module `--rise` (the `riseStyle(idx)`
helper in `[slug]/+page.svelte` is the reference: `style="--rise:${(0.16 + idx *
0.04).toFixed(2)}s"`), then add the `module-rise` rule + delay scoped to that
page's module wrapper. The mechanism is page-agnostic; only the scoping selector
changes. About is the worked example.

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

---

## Refining a page — process

The ordered procedure for taking a page from raw to polished. About is the
worked example (`src/routes/[slug]/+page.svelte` → `decorateAbout`); each step
links to the rule that governs it. Work top to bottom — the early steps are
structure, the later ones are finish.

**Before you start.** Read this whole doc, the relevant rule in
`.claude/rules/` (content for copy, design-system for tokens), and skim the
target page's current markup/content. Confirm scope against the active starter
prompt in `docs/STATUS.md` (what's in / out). If the page needs *new* content,
that's a content task first — see `docs/content-guide.md`.

1. **Map each section to a primitive by *meaning*** — module `card`, subtle
   `.ec-alert`, `.ec-grid`, split panels, or the single CTA (`btn btn-primary`).
   Pick the one whose job fits; never invent a new section look when one fits
   (→ *The component kit*, *Reuse do/don't*). Most pages are markdown rendered
   via `{@html}`, so this is a `decorate<Page>()` function mirroring
   `decorateAbout`.

2. **Assign role colour and icons.** Colour follows the role table (primary =
   program/action, secondary = people, warning = caution; if no role fits, use
   none). One wayfinding icon per section *only if* it clears the icon checklist;
   register any new glyph in the icon matrix (→ *Color system*, *Icon system*).

3. **Apply the type scale.** Every text level separated on size + weight +
   colour together, never size alone. Lede → body → supporting prose
   (`--color-body-soft` for elaboration under a heading); uppercase labels use
   Nunito 700 + the tracking ramp; `muted` only for genuinely secondary text
   (→ *Typography → the scale*).

4. **Set the vertical rhythm** to the ~1.5× scale: 0.5rem (heading → body),
   0.9rem (sibling tiles), 1.4rem (module-to-module / lede → first section)
   (→ *Vertical rhythm*).

5. **Wire the entrance cascade.** Emit a per-module `--rise` (the `riseStyle`
   helper) and add the `module-rise` rule scoped to the page; disable the
   page-level rise on that page; honour `prefers-reduced-motion`
   (→ *Motion — page entrance*).

6. **Verify, before claiming done.** `npx svelte-check` clean; `npm run build`;
   then a headless screenshot of the **built** page on `:8787` (wrangler serves
   the build, so rebuild first). Check, with the screenshot — not by assertion:
   **desktop + mobile** layout, **dark mode**, the **vertical rhythm**, and that
   colour stays in chrome (no accent-coloured running text). Crop in at 2× to
   judge type and spacing.

7. **Pass-end ritual** — `code-simplifier` over the changed code, svelte-check,
   update `docs/STATUS.md` (+ this doc if the language itself changed), commit
   and push. This is the `cairn-pass` skill; invoke it to start and to close.

**Done means:** the page is indistinguishable in craft from About — a casual
visitor feels the coherence without noticing any single choice, and a designer
would find every value reasoned.
