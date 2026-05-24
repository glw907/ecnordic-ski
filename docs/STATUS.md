# ecnordic.ski — Project Status

**Current state:** The directive render pipeline is **live**. `markdownToHtml`
(`src/lib/utils.ts`) delegates to `renderMarkdown` (`src/lib/markdown/render.ts`:
remark-parse → gfm → directive → mark step → remark-rehype → rehype-raw →
restructure → rehype-slug → stringify); the old `decorate*`/`wrapSections`/
`boldParasToGrid` machinery is deleted. All five static pages (About, Training,
CrewLAB, resources, volunteers) carry inline container directives
(`card/grid/alert/cta/split+panel/passage`). About/Training/CrewLAB verified
pixel-identical (headless AE=0) and HTML-identical modulo dropped `data-section` +
slug `id`s; resources/volunteers moved onto the kit. 18 tests in
`src/tests/markdown/`. The mark step restores accidental prose colons (`4:00`) that
micromark would parse as directives. See `docs/architecture.md` + `docs/design-language.md`.

The **content style guard** (`.claude/hooks/content-style-guard.py`) blocks AI tells
in `src/content/**/*.md`. Contact, tags, and post detail are Svelte components, not
markdown pages — their kit rollout is still deferred.

**Architecture cleanup (2026-05-24).** Three improvements outside the pass sequence:
(1) **mdsvex removed** — it was configured but unused (content is read `?raw` and
rendered by the directive pipeline), so the dep + preprocessor are gone, one markdown
system remains. (2) **Frontmatter is now a build gate** — `src/lib/content-schema.ts`
(`validatePostFrontmatter`/`validatePageFrontmatter`, tested) throws on malformed
content; tags are checked against `POST_TAGS` in `config.ts`. (3) **Static pages
prerender explicitly** — `[slug]` declares `prerender = true` + `entries()` from
`getPageSlugs()` instead of relying on link-crawl. `docs/architecture.md` was rewritten
to match reality (it had described the 907.life template). Backlog #7/#8 closed
(resolved by the directive pipeline); #10 (CMS config wrong repo) and #11 (welcome post
URL carries a day) logged.

**Claude infrastructure modernization (2026-05-24).** The official **Svelte MCP**
(`mcp.svelte.dev`) is wired via project `.mcp.json` — live Svelte 5 / SvelteKit docs;
**requires a session restart + approving the `svelte` server to activate.** Fixed the
`content-cleanup` skill (was lowercase `skill.md` with no frontmatter → never loaded;
now a proper `SKILL.md`). Added a SvelteKit-specific `/ship` skill (the global one is
Go-only). Deleted dead Hugo-era infra (`css-rules.md`, `check-css-important.sh`) and
corrected Hugo leftovers in `ai-operational-rules.md`; cleaned Hugo cruft from
`settings.local.json`. The 11 hookify rules (Svelte 5 / Tailwind v4 / DaisyUI v5) are
confirmed active.

**Open follow-ups (not blocking):** CrewLAB / Training / volunteers `[PLACEHOLDER]`
content (real specifics from EC Nordic); cross-page conflict (CrewLAB routes waivers
+ payment through the app vs. About / Training / waiver page's paper-waiver + free
model); posts at 0.92rem (tokenize `--text-body` if they want larger).

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo, config, Claude infra | ✓ Done |
| 2 | Build: posts, events, calendar, pages, contact, deploy | ✓ Done |
| 3 | Design: font, palette, hero grid, nav | ✓ Done |
| 4 | Design language: kit, About/Training/CrewLAB, sitewide type, content guard | ✓ Core (rollout deferred) |
| 5 | Directive render pipeline: remark/rehype, all primitives, unit-tested (no site change) | ✓ Done |
| 6 | Cut over + migrate all five pages to directives; delete `decorate*` | ✓ Done |
| 7 | Conformance & hardening sweep (idiomatic Svelte 5 / Tailwind v4 / DaisyUI v5 / TS, MCP-verified, no visual change) | **Planned — ready to execute** |
| 8 | Kit rollout to Svelte components (contact / tags / post detail) | After 7 |
| 9 | Remote-functions spike (experimental — `form()`/`query()`) | Deferred |

Passes 7–9 are the **Idiomatic 2026 Exemplar** initiative. Spec:
`docs/superpowers/specs/2026-05-24-idiomatic-2026-exemplar-design.md`.

---

### Next starter prompt (Pass 7 — Conformance & hardening sweep)

> **The plan is already written** —
> `docs/superpowers/plans/2026-05-24-pass-7-conformance-sweep.md` (spec:
> `docs/superpowers/specs/2026-05-24-idiomatic-2026-exemplar-design.md`). Execute it
> task-by-task with `superpowers:subagent-driven-development` (or `executing-plans`).
>
> **Goal.** Make the codebase exemplar-idiomatic for stable 2026 Svelte 5 / SvelteKit /
> Tailwind v4 / DaisyUI v5 / TypeScript — changing how the code reads, not a single
> rendered pixel. Three tracks: type/structure hardening (concrete: `strProp` accessor
> in `rehype-ec-primitives.ts`, typed Pagefind import in `SearchModal`), Tailwind/DaisyUI
> audit, and MCP-verified Svelte 5 idiom check. The 31 tests + an all-surfaces AE=0
> screenshot diff are the regression guard.
>
> **PREREQUISITE.** Approve the `svelte` MCP server (`/mcp`) before Task 4 — the idiom
> verification depends on it. Tasks 1–3 don't.
>
> **Scope.** In: the three tracks above, whole codebase. Out: kit rollout (that's Pass 8),
> new content, the five frozen directive pages, remote functions (Pass 9, deferred).
>
> **Pass end.** code-simplifier over changed files, full gates, AE=0 on all 11 surfaces,
> update STATUS/BACKLOG/ROADMAP. Do not push (push deploys) unless asked / via `/ship`.

**Deploy:** Live at **https://ecnordic.ski** — push to `main` → GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
