# ecnordic.ski — Project Status

**Current state:** Design language proven on About, Training, CrewLAB. Type is one
sitewide standard (body 0.92rem). **Pass 5 done:** the directive render pipeline is
built and unit-tested but **not yet wired into the site.** `renderMarkdown` lives in
`src/lib/markdown/render.ts` (remark-parse → gfm → directive → mark step →
remark-rehype → rehype-raw → restructure → rehype-slug → stringify); it emits the
same HTML the `decorate*` builders do, for all primitives (`card/grid/alert/cta/
split+panel/passage`). Glyphs come from `icons.ts` (byte-identical to the old
`ICON`/`PANEL_ICONS`). 14 tests in `src/tests/markdown/`. See `docs/architecture.md`.

The **content style guard** (`.claude/hooks/content-style-guard.py`) blocks AI tells
in `src/content/**/*.md`. Resources + volunteers **migrate in Pass 6** onto the
directive kit; contact, tags, post detail are Svelte components, deferred separately.

**Open follow-ups (not blocking):** CrewLAB `[PLACEHOLDER]` (what EC Nordic collects
via CrewLAB); cross-page conflict (CrewLAB routes waivers + payment through the app
vs. About / Training / waiver page's paper-waiver + free model); posts at 0.92rem
(tokenize `--text-body` if they want larger).

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo, config, Claude infra | ✓ Done |
| 2 | Build: posts, events, calendar, pages, contact, deploy | ✓ Done |
| 3 | Design: font, palette, hero grid, nav | ✓ Done |
| 4 | Design language: kit, About/Training/CrewLAB, sitewide type, content guard | ✓ Core (rollout deferred) |
| 5 | Directive render pipeline: remark/rehype, all primitives, unit-tested (no site change) | ✓ Done |
| 6 | Cut over + migrate all five pages to directives; delete `decorate*` | Next |

---

### Next starter prompt (Pass 6 — directive cutover & migration)

> **Goal.** Wire the Pass 5 `renderMarkdown` pipeline into the live site: repoint
> `markdownToHtml` at it, migrate all five content pages to inline directives, and
> delete the `decorate*`/`wrapSections`/`boldParasToGrid` machinery — proving the
> output unchanged with a screenshot regression sweep.
>
> **Plan (execute it):** `docs/superpowers/plans/2026-05-24-pass-6-directive-cutover.md`.
> Spec: `docs/superpowers/specs/2026-05-24-inline-directives-design.md`.
>
> **Settled (do not re-brainstorm):** the pipeline + vocabulary are built and frozen
> (`src/lib/markdown/`, 14 passing tests, byte-identical glyphs). The restructure step
> runs *before* `rehype-slug` (so `.card-title` serializes ahead of slug ids). Pages to
> migrate: About, Training, CrewLAB, resources, volunteers. Remove `remark-html` once
> `markdownToHtml` is repointed.
>
> **Approach.** Invoke cairn-pass to start; execute the plan task-by-task. This pass
> DOES need the screenshot regression sweep (before/after each page). Standard
> pass-end checklist applies.

**Deploy:** Live at **https://ecnordic.ski** — push to `main` → GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
