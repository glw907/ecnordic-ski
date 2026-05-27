# ecnordic.ski: Project Status

**Current state:** The directive render pipeline is **live**; all five static pages carry
inline container directives; the **content style guard** blocks AI tells in
`src/content/**/*.md`. The **contact form now runs on a SvelteKit remote function**
(`form()`, Pass 9). See `docs/architecture.md`. Contact, tags, and post detail consume the
kit's CSS contract (Pass 8). See `docs/architecture.md` + `docs/design-language.md`.

**Pass 9: remote-functions spike (done 2026-05-24). Verdict: DEFER (adopt later).**
Converted the live contact form from a `+page.server.ts` action to a `form()` remote
function in `src/lib/contact.remote.ts` (Valibot schema, Turnstile + Email Workers intact,
`invalid()` for inline errors). Verified end-to-end on adapter-cloudflare via `wrangler
dev`: generated `/_app/remote/...` endpoint, CSRF origin check, schema issues + value
repopulation, **both** JS-enhanced and no-JS full-reload paths. `prerender = false` moved
to `+page.ts` (load-bearing for the no-JS POST). Real ergonomic win, but the API is
experimental ("subject to change", no stable date) and the team frames it as additive.
Keep contact as the proving ground; don't migrate other surfaces until stable (BACKLOG #13). Added dep: `valibot`. Flag: `kit.experimental.remoteFunctions`.

**Open follow-ups (not blocking):** CrewLAB / Training / volunteers `[PLACEHOLDER]`
content; waiver/payment-model conflict; posts at 0.92rem (tokenize `--text-body` if larger).
Re-evaluate remote functions when SvelteKit ships them stable.

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
| 9 | Remote-functions spike (contact form on `form()`) | ✓ Done (DEFER) |

Passes 7–9 = the **Idiomatic 2026 Exemplar** initiative (`ROADMAP.md`), now complete; specs in `docs/superpowers/archive/`.
---

### Next starter prompt (Pass 10: placeholder content)

> **Goal.** Replace the `[PLACEHOLDER]` content on the CrewLAB, Training, and volunteers
> pages with real copy that passes the content guard and the self-critique pass.
>
> **Scope.** In: the three placeholder pages (`src/content/pages/`), keeping their existing
> directive structure. Out: design/kit changes, new pages, the waiver/payment-model
> conflict (BACKLOG #12).
>
> **Still open, brainstorm first:** what real information exists for each page (ask the
> user, since this is program-specific and not derivable from the repo); how much directive
> structure to keep vs. reflow to the content.
>
> **Approach.** "Invoke site-pass to start. Read `docs/content-guide.md` in full first.
> Standard pass-end checklist applies."

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
