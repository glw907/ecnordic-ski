# Pass 5 — Inline Container Directives (design)

**Date:** 2026-05-24
**Status:** approved for planning
**Supersedes mechanism in:** `src/routes/[slug]/+page.svelte` (`decorateAbout` /
`decorateTraining` / `decorateCrewlab`, `parseSections`, `wrapSections`,
`boldParasToGrid`, the slug→primitive inference, `SECONDARY_SECTIONS`).

---

## Goal

Replace the implicit slug→primitive mapping with **explicit inline container
directives** in the markdown, so each page's styling is visible in the file and
robust to heading renames. This refactors *how* styling is selected, not the
look: About / Training / CrewLAB must render **pixel-identical** to today
(regression-verified by headless screenshots).

## What's in / out

**In:** a `remark-directive`-based AST pipeline; a custom remark "mark" step and
a custom rehype "restructure" step that produce the existing HTML primitives from
directives; migration of `about.md`, `training.md`, `crewlab.md` to directives;
documentation of the vocabulary in `docs/design-language.md`.

**Out:** any visual change; new page content; the deferred rollout to
`resources.md` / `volunteers.md` / contact / tags / post detail (those keep
today's behavior via a transitional fallback — see *Transitional fallback*).

## Settled decisions (do not re-litigate)

- Styling is selected by **inline container directives**, not frontmatter, not
  slugs. Unmarked content = plain prose.
- Primitives and the type scale are **unchanged** — pages render identically.
- Architecture is a **pure AST pipeline**. No regex/string-replacement on
  rendered HTML. `parseSections`, `wrapSections`, `boldParasToGrid`, and the
  three `decorate*` functions are deleted (modulo the transitional fallback).
- The work is substantial-refactor-welcome: the long-term win is deleting the
  HTML-string machinery, not minimizing the diff.

---

## Ecosystem (validated May 2026)

`remark-directive@4` remains the standard for `:::` generic directives in a
non-MDX, build-time, no-runtime-JS pipeline; MDX/mdsvex/Markdoc do not fit. The
`hName`/`hProperties`/`hChildren` mapping is still canonical against
`mdast-util-to-hast@13`. For trusted build-time content, `allowDangerousHtml` +
`rehype-raw` with **no** `rehype-sanitize` is the correct config (sanitize would
strip our inline SVGs). Target majors: `remark-directive@4`, `remark-rehype@11`,
`rehype-raw@7`, `rehype-stringify@10`, `rehype-slug@6`, `hastscript@9`.

**Key constraint that shapes the architecture:** setting `data.hChildren` on a
directive node *fully bypasses* recursive mdast→hast conversion of that node's
children. Rather than hand-build children at the mdast layer, we do the
structural work in a **rehype pass on already-converted hast**.

---

## Pipeline

```
remark-parse
  → remark-gfm
  → remark-directive
  → remark-ec-directives        (mark: directive node → <section> + data-* + base classes)
  → remark-rehype (allowDangerousHtml: true)
  → rehype-raw                  (reparse authored raw HTML, e.g. training.md page-toc nav)
  → rehype-slug                 (auto heading IDs: "## Schedule" → id="schedule")
  → rehype-ec-primitives        (restructure hast: ec-head, icon, section-body, grid, split, cta)
  → rehype-stringify
```

This replaces the single `remark().use(remarkGfm).use(remarkHtml,{sanitize:false})`
call in `src/lib/utils.ts → markdownToHtml`. The same pipeline serves posts and
pages; posts simply contain no directives.

### `remark-ec-directives` (mark step, mdast)

For each `containerDirective` node, follow the remark-directive README pattern:
build `h(node.name, node.attributes)`, then set `data.hName = 'section'` and
`data.hProperties` carrying:

- `data-primitive` = the directive name (`card`, `grid`, `alert`, `cta`,
  `split`, `panel`, `passage`)
- `data-icon` = the `icon` attribute, if present
- `data-role` = the `role` attribute, if present

It does **not** set `hChildren` (so children convert normally downstream). It
adds only the marker; all visible structure is built in the rehype step. Unknown
directive names are left untouched (defensive, but not expected).

### `rehype-ec-primitives` (restructure step, hast)

Visits `<section data-primitive=…>` elements (children already converted to
hast) and rewrites each to the exact HTML the current builders emit. One handler
per primitive (mirrors today's `ecCard` / `ecCta` / alert / split logic). The
`--rise` stagger index is assigned here in document order across top-level
primitives, reproducing `riseStyle(idx)` (`0.16 + idx*0.04s`). Icons are injected
as `{type:'raw', value: svgString}` nodes (parsed by an earlier `rehype-raw`;
note ordering — see *Open implementation question* below) or built with
`hastscript`. Phosphor SVG sources move to a small named map module shared by the
plugin.

---

## Directive vocabulary

Authored in `src/content/pages/*.md`. Two optional attributes throughout:
`icon=NAME` (a Phosphor glyph name from the icon map; omit = no icon) and
`role=ROLE` (`primary` default · `secondary` people/cobalt · `caution`
alert/amber).

| Directive | Primitive | Output |
|---|---|---|
| `:::card{icon=NAME role=ROLE}` | Module card | `.ec-card` → `.ec-head` (icon + h2) + `.section-body` |
| `:::grid{icon=NAME role=ROLE}` | Grid card | `.ec-card` whose contained list becomes `.ec-grid` cells |
| `:::alert{role=caution}` | Subtle alert | `.ec-alert.ec-alert-caution`; icon inline in label; `role` selects the variant and its default icon (caution→warning), overridable with `icon` |
| `:::cta{icon=NAME}` | CTA card | `.ec-cta` centered, `.ec-chip` icon tile, contained link → `btn btn-primary` |
| `::::split` ⊃ `:::panel{icon=NAME role=ROLE}` ×2 | Paired panels | `.ec-split` of `.ec-panel`s, each leading with its own icon |
| `:::passage{icon=NAME}` | Titled prose passage | `.ec-passage` (ec-head + body, no card chrome) |
| *(no directive)* | Bare prose | rendered as-is — lede, intro paragraphs |

Nesting uses remark-directive's colon-count rule: the `split` container opens
with four colons (`::::split`) so its `:::panel` children nest cleanly.

### Content-shape changes required for identical render

- **Grid wraps a real markdown list.** Training's *Logistics* block (the
  `**Travel:** …` paragraphs) is rewritten as a `- **Travel** …` list inside
  `:::grid`. This deletes `boldParasToGrid` — grid only ever transforms a list.
  Rendered cells are unchanged.
- **Split panels are explicit.** About's *Costs & volunteers* becomes
  `::::split` with two `:::panel{icon=hand-coins}` / `:::panel{icon=handshake
  role=secondary}` children, replacing the paragraph-splitting regex.
- **Heading IDs auto-generate** (`rehype-slug`), so Training's manual
  `<h2 id="schedule">` tags become plain `## Schedule`; the `page-toc` anchors
  (`#schedule`, …) still resolve. The `page-toc` nav itself stays authored raw
  HTML (handled by `rehype-raw`).

### Worked example — About, first three sections

```markdown
:::card{icon=path}
## What we do
The high school ski season is short…
:::

:::alert{role=caution}
## Risks
Running, mountain biking, roller-skiing…
:::

:::card{icon=users-three role=secondary}
## Who can join
The group is open to students…
:::
```

---

## Per-page mapping (must reproduce today's render exactly)

**About** — `card{icon=path}` · `alert{role=caution}` · `card{icon=users-three
role=secondary}` · `grid{icon=compass}` · `split`(panels `hand-coins` /
`handshake role=secondary`, no head icon) · `cta{icon=flag}`.

**Training** — `card{icon=calendar-blank}` (Schedule) · `grid{icon=path}` (What
we do) · `card{icon=users-three role=secondary}` (Who can join) ·
`card{icon=backpack}` (What to bring) · `card{icon=tent}` (Talkeetna camp, with a
nested `:::grid` around the Logistics list) · `cta{icon=flag}` (Sign up).

**CrewLAB** — `passage{icon=why-we-use-it}` (Why we use it) ·
`grid{icon=for-athletes}` (For athletes) · `card{icon=users-three
role=secondary}` (For parents & supporters) · `cta{icon=flag}` (Getting started).
The lede stays a plain (non-emphatic) intro paragraph.

Icon names map to the existing `ICON` entries; the glyph→meaning matrix in
`docs/design-language.md` is unchanged. `data-section` attributes are dropped
unless a consumer is found (none in current CSS/JS — to verify during
implementation).

---

## Transitional fallback (deferred pages)

`resources.md` and `volunteers.md` use no directives and are out of scope this
pass, but today render as `.page-section` cards via `wrapSections`. To keep them
**unchanged** without migrating them, `wrapSections` is retained *only* as the
zero-directive fallback: a page whose rendered tree contains no
`data-primitive` markers passes through the legacy section-card wrap. This is the
one piece of HTML-string handling that survives Pass 5; it is explicitly
transitional and is deleted when those pages are migrated (post-Pass-5). All
directive-using pages bypass it entirely.

> Decision to confirm at plan time: implement the fallback as the existing
> `wrapSections` (string-based, isolated, slated for deletion) vs. a small rehype
> equivalent. Default: keep `wrapSections` as-is to avoid investing in
> throwaway code.

---

## Verification (the main burden — identical render is re-verified, not inherited)

1. `npx svelte-check` clean.
2. `npm run build` succeeds.
3. Rebuild, serve the built site on `:8787` (wrangler), and headless-screenshot
   About / Training / CrewLAB with `--force-prefers-reduced-motion`:
   **desktop + mobile**, **light + dark**. Diff against the current live render;
   reconcile every difference until identical.
4. Confirm the Training `page-toc` anchors still scroll to the right sections
   (heading IDs via `rehype-slug`).
5. Confirm posts (no directives) and the deferred pages (`resources`,
   `volunteers`) are unchanged.

---

## Open implementation question (resolve in the plan, not here)

Plugin ordering vs. icon injection: `rehype-raw` runs before
`rehype-ec-primitives`, so raw SVG nodes emitted *by* the primitive step won't be
reparsed by that earlier `rehype-raw`. Resolution options: (a) build icon SVGs as
real `hastscript` element trees in the restructure step (no raw nodes needed);
(b) run a second `rehype-raw` after restructure; (c) inject icons earlier. Prefer
(a) — pure hast, no second parse. Decide in the plan.

---

## Files touched

- `src/lib/utils.ts` — rewrite `markdownToHtml` to the new pipeline.
- `src/lib/` — new `remark-ec-directives` (mark), `rehype-ec-primitives`
  (restructure), and a Phosphor icon-map module (moved from the Svelte component).
- `src/routes/[slug]/+page.svelte` — delete the `<script module>` decorate
  machinery; keep the page shell, the scoped CSS (unchanged), and the
  `bodyHtml` derivation (now just the rendered html, plus the fallback for
  no-directive pages).
- `src/content/pages/{about,training,crewlab}.md` — add directives; convert
  Logistics paragraphs to a list; drop manual `<h2 id>`.
- `package.json` — add `remark-directive`, `remark-rehype`, `rehype-raw`,
  `rehype-stringify`, `rehype-slug`, `hastscript`; remove `remark-html`.
- `docs/design-language.md` — document the directive vocabulary (new section)
  and update the *Worked example* / *Refining a page* references from
  `decorate*` to directives.
