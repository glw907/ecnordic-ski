# ecnordic.ski — Project Status

**Current state:** Design language proven on About, Training, CrewLAB. Calendar
feature removed, replaced by `/crewlab` (`decorateCrewlab` in `[slug]/+page.svelte`).
Type is now **one sitewide standard** — body 0.92rem on `.post-body` (`app.css`),
`.card-body` inherits it, lede 1.0rem and grid cells 0.85rem the only deviations.
A **content style guard** (`.claude/hooks/content-style-guard.py`, PreToolUse)
blocks AI-writing tells in `src/content/**/*.md`. `docs/design-language.md` adds
*Choosing a primitive* (prose is the default) + candidate primitives. Resources
+ volunteers **migrate in Pass 6** (onto the directive kit); contact, tags, post
detail are Svelte components, deferred separately. **Pass 5 brainstorm complete:**
spec at `docs/superpowers/specs/2026-05-24-inline-directives-design.md`; the
inline-directives work is split into two plans — Pass 5 (build the render
pipeline, no site change) and Pass 6 (cut over + migrate all five pages).

**Open follow-ups (not blocking):** CrewLAB `[PLACEHOLDER]` (what EC Nordic
collects via CrewLAB); cross-page conflict (CrewLAB routes waivers + payment
through the app vs. About / Training / waiver page's paper-waiver + free model);
posts now 0.92rem (tokenize `--text-body` if they want larger). Nothing committed yet.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo, config, Claude infra | ✓ Done |
| 2 | Build: posts, events, calendar, pages, contact, deploy | ✓ Done |
| 3 | Design: font, palette, hero grid, nav | ✓ Done |
| 4 | Design language: kit, About/Training/CrewLAB, sitewide type, content guard | ✓ Core (rollout deferred) |
| 5 | Directive render pipeline: remark/rehype, all primitives, unit-tested (no site change) | Next |
| 6 | Cut over + migrate all five pages to directives; delete `decorate*` | Planned |

---

### Next starter prompt (Pass 5 — directive render pipeline)

> **Goal.** Build the remark/rehype AST pipeline that renders inline container
> directives into the kit's HTML — fully unit-tested, exported as `renderMarkdown`,
> **not yet wired into the site** (the cutover + page migration are Pass 6).
>
> **Plan (execute it):** `docs/superpowers/plans/2026-05-24-pass-5-directive-pipeline.md`
> — 8 TDD tasks, no screenshots needed. Spec:
> `docs/superpowers/specs/2026-05-24-inline-directives-design.md`.
>
> **Settled (do not re-brainstorm):** pure AST pipeline (`remark-directive` →
> mark step → `remark-rehype`/`rehype-raw`/`rehype-slug` → restructure step);
> vocabulary `:::card/grid/alert/cta/passage`, `::::split`⊃`:::panel`, attrs
> `icon=`/`role=`, unmarked = prose; icons as hast SVG from path data copied
> verbatim from the current `ICON`/`PANEL_ICONS` maps (byte-identical glyphs).
>
> **Approach.** Invoke cairn-pass to start; execute the plan task-by-task
> (subagent-driven recommended). Standard pass-end checklist applies. Pass 6
> follows with the cutover and the screenshot regression sweep.

**Deploy:** Live at **https://ecnordic.ski** — push to `main` → GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
