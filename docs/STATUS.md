# ecnordic.ski — Project Status

**Current state:** The directive render pipeline is **live**. `markdownToHtml`
(`src/lib/utils.ts`) delegates to `renderMarkdown` (`src/lib/markdown/render.ts`). All
five static pages (About, Training, CrewLAB, resources, volunteers) carry inline container
directives (`card/grid/alert/cta/split+panel/passage`); 31 tests total. The **content
style guard** (`.claude/hooks/content-style-guard.py`) blocks AI tells in
`src/content/**/*.md`. Contact, tags, and post detail are Svelte components (kit rollout =
Pass 8). See `docs/architecture.md` + `docs/design-language.md`.

**Pass 7 — conformance & hardening sweep (done 2026-05-24).** Made the codebase
exemplar-idiomatic for stable 2026 Svelte 5 / Tailwind v4 / DaisyUI v5 / TS, **zero
output change**. Landed: typed `strProp` accessor replacing ~8 `as string` hast casts
(`rehype-ec-primitives.ts`); a `PagefindUIModule` interface replacing `@ts-ignore`/`as any`
(`SearchModal`); `Snippet`-typed `children` (`Icon`/`+layout`). Idiom verified vs. the
Svelte MCP. Tailwind/DaisyUI audit clean except the waiver `--w-*` hardcoded palette
(BACKLOG #12, deferred — oklch port would shift pixels). Regression proof: 18 exact-HTML
tests + all 11 prerendered pages byte-identical pre/post-pass (screenshot AE gate dropped
as `--rise` animation jitter).

**Open follow-ups (not blocking):** CrewLAB / Training / volunteers `[PLACEHOLDER]`
content; waiver/payment-model conflict (CrewLAB app-routed vs. paper-waiver + free); posts at 0.92rem (tokenize `--text-body` if larger wanted).

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo, config, Claude infra | ✓ Done |
| 2 | Build: posts, events, calendar, pages, contact, deploy | ✓ Done |
| 3 | Design: font, palette, hero grid, nav | ✓ Done |
| 4 | Design language: kit, About/Training/CrewLAB, sitewide type, content guard | ✓ Core |
| 5 | Directive render pipeline: remark/rehype, all primitives, unit-tested | ✓ Done |
| 6 | Cut over + migrate all five pages to directives; delete `decorate*` | ✓ Done |
| 7 | Conformance & hardening sweep (idiomatic, MCP-verified, no visual change) | ✓ Done |
| 8 | Kit rollout to Svelte components (contact / tags / post detail) | **Next** |
| 9 | Remote-functions spike (experimental — `form()`/`query()`) | Deferred (BACKLOG #13) |

Passes 7–9 are the **Idiomatic 2026 Exemplar** initiative (`ROADMAP.md`); specs archived under `docs/superpowers/archive/`.

---

### Next starter prompt (Pass 8 — kit rollout to Svelte components)

> **Goal.** Bring the design-language kit (directive primitives / shared visual patterns)
> to the three surfaces still hand-built as Svelte components — contact, tags (`/tags` +
> `/tags/[tag]`), post detail (`[year]/[month]/[slug]`) — so they read as one system with
> the five directive pages.
>
> **Scope.** In: those three component surfaces. Out: the five frozen directive pages, new
> content, the waiver page (BACKLOG #12 owns its colors), remote functions (Pass 9).
>
> **Still open — brainstorm first:** these are Svelte components, not markdown, so the
> pipeline doesn't apply directly — decide how the kit's patterns get expressed (shared
> components? shared `app.css` classes? a hybrid?) and write a plan before coding.
>
> **Approach.** "Invoke cairn-pass to start. Standard pass-end checklist applies."

**Deploy:** Live at **https://ecnordic.ski** — push to `main` → GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
