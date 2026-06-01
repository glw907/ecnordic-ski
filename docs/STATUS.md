# ecnordic.ski: Project Status

**Current state:** The directive render pipeline is **live**; all five static pages carry
inline container directives; the **content style guard** blocks AI tells in
`src/content/**/*.md`. The **contact form now runs on a SvelteKit remote function**
(`form()`, Pass 9). See `docs/architecture.md`. Contact, tags, and post detail consume the
kit's CSS contract (Pass 8). See `docs/architecture.md` + `docs/design-language.md`.

**cairn-cms 0.10 migration, Pass 1a: DONE (2026-06-01).** ecnordic now pins
`@glw907/cairn-cms@^0.10.0` (was `0.6.0`). The version catch-up landed in five commits
(`fc61162`..`1b61a48`): the bump and carta-md removal, the `renderPreview`-to-`render` rename on
both the adapter and `EditPage`, the month-dated posts URL policy in the YAML, and the policy
threaded into `composeRuntime`. Gates green (`check` 0/0, `npm test` 57 exit 0, build exit 0).
Public URLs unchanged (the welcome post still serves at `/2026/05/welcome/`). A runtime smoke
confirmed `composeDatedId` derives ecnordic's `YYYY-MM-slug` filename, so the admin create flow is
correct. Post-mortem and the durable `@types/node` hoist gotcha are in the plan file
(`docs/superpowers/plans/2026-05-31-ecnordic-pass-1a-cairn-0.10-catchup.md`). The five commits sit
on local `main`, not yet pushed.

**Immediate next action: cairn-cms 0.10 migration, Pass 1b (delivery surface).** This is the second
half of the design's Pass 1: the catch-all `[...path]` route, engine feeds and sitemap, and retiring
the hand-rolled `posts.ts`/`pages.ts`/`feed.ts`. The roadmap and component-shape design are in
`docs/superpowers/specs/2026-05-31-ecnordic-cairn-0.10-migration-design.md`. The plan is not yet
written; **brainstorm the open delivery decisions first, then author it with `writing-plans`**, then
execute `subagent-driven` from the ecnordic-ski directory. Pass 2 converts the seven components to
the typed slot schema, and Pass 3 adds the component reference file. The earlier "Pass 10:
placeholder content" work below is separate and still open.

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
