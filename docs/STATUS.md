# ecnordic.ski — Project Status

**Current state:** The directive render pipeline is **live**. `markdownToHtml`
(`src/lib/utils.ts`) delegates to `renderMarkdown` (`src/lib/markdown/render.ts`). All
five static pages (About, Training, CrewLAB, resources, volunteers) carry inline container
directives (`card/grid/alert/cta/split+panel/passage`); 34 tests total. The **content
style guard** (`.claude/hooks/content-style-guard.py`) blocks AI tells in
`src/content/**/*.md`. Contact, tags, and post detail are Svelte components that now
consume the kit's CSS contract (Pass 8). See `docs/architecture.md` + `docs/design-language.md`.

**Pass 8 — kit rollout to Svelte components (done 2026-05-24).** Brought contact, tags
(`/tags` + `/tags/[tag]`), and post detail into one system with the directive pages via
**kit-as-CSS-contract** (no parallel Svelte primitive library — see `docs/architecture.md`).
Cascade math is now one util, `riseStyle` (`src/lib/motion.ts`), shared by the rehype
builder and the component pages; `page-rise`/`module-rise` keyframes promoted to global
`app.css`. Contact dropped its duplicate `<h2>` + bespoke `.submit-btn` for the kit
`btn btn-primary` Action; tags/post pages gained the per-page entrance cascade +
reduced-motion guard. No-regression: directive exact-HTML tests byte-identical; the shared
CSS edit is additive. Frozen `[slug]` untouched (deferred keyframe dedup = BACKLOG #14).

**Open follow-ups (not blocking):** CrewLAB / Training / volunteers `[PLACEHOLDER]`
content; waiver/payment-model conflict; posts at 0.92rem (tokenize `--text-body` if larger).

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
| 8 | Kit rollout to Svelte components (contact / tags / post detail) | ✓ Done |
| 9 | Remote-functions spike (experimental — `form()`/`query()`) | **Next** (BACKLOG #13) |

Passes 7–9 = the **Idiomatic 2026 Exemplar** initiative (`ROADMAP.md`); specs in `docs/superpowers/archive/`.
---

### Next starter prompt (Pass 9 — remote-functions spike)

> **Goal.** Evaluate SvelteKit experimental remote functions (`form()`/`query()`) on a
> real surface — the contact form is the natural candidate — to see whether they improve
> the data flow over the current `+page.server.ts` form action, without regressing the
> Turnstile + Email Workers path.
>
> **Scope.** In: a spike on one surface, behind the experimental flag; a written verdict
> (adopt / defer / reject). Out: a site-wide migration, the frozen directive pages, the
> waiver page (BACKLOG #12).
>
> **Still open — brainstorm first:** whether remote functions are stable enough on the
> 2026 SvelteKit/adapter-cloudflare line; how they interact with `prerender`/Turnstile;
> what "success" for the spike means. Write a plan before coding.
>
> **Approach.** "Invoke cairn-pass to start. Standard pass-end checklist applies."

**Deploy:** Live at **https://ecnordic.ski** — push to `main` → GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
