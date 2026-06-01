# ecnordic.ski: Project Status

**Current state.** The directive render pipeline is live; all five static pages carry inline
container directives; the content style guard blocks AI tells in `src/content/**/*.md`. The
contact form runs on a SvelteKit remote function (`form()`, Pass 9). The public delivery now
runs entirely on the cairn-cms engine. See `docs/architecture.md`.

**cairn-cms 0.10 migration, Pass 1a + 1b: DONE (2026-06-01).** 1a pinned
`@glw907/cairn-cms@^0.10.0` and renamed `renderPreview` to `render`. 1b replaced the
hand-rolled delivery (`posts.ts`, `pages.ts`, `feed.ts`, the explicit post and page route
folders) with one content layer (`src/lib/content.ts`), a catch-all `[...path]` route behind a
byPermalink resolver, engine-built feeds, a new sitemap and robots, and full `buildSeoMeta`
heads. The contract held: zero URL movement (guarded by the `url-inventory` test) and no
rendered-body change. Gates green (`check` 0/0, `npm test` 64 exit 0, build). A `wrangler dev`
smoke confirmed every delivery route serves, `/no/such/path` 404s, and `/admin` still redirects
to login. Eight commits sit on local `main`, not yet pushed (a push deploys live). Frontmatter
validation now runs on the admin save path, not as a build gate (BACKLOG #16).

**Immediate next: cairn-cms 0.10 migration Pass 2 (components to the typed slot schema).**
Brainstorm first. This is the per-site half of the cairn component-registry initiative (engine
Plan 3): convert the seven directive components to the registry's typed attributes and named
slots so the editor's guided insert form and the build share one declaration. Roadmap:
`docs/superpowers/specs/2026-05-31-ecnordic-cairn-0.10-migration-design.md`. Pass 3 adds the
component reference file. The separate "Pass 10: placeholder content" work stays open.

**Pass 9 (DEFER):** contact form on `form()`, verified on adapter-cloudflare; the API is
experimental, so keep contact as the proving ground (BACKLOG #13). **Open, not blocking:**
placeholder content on CrewLAB / Training / volunteers; waiver/payment-model conflict.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–3 | Scaffold, build, design | ✓ Done |
| 4 | Design language: kit, sitewide type, content guard | ✓ Core |
| 5–6 | Directive pipeline + cut over all pages; delete `decorate*` | ✓ Done |
| 7–8 | Conformance sweep + kit rollout to components | ✓ Done |
| 9 | Remote-functions spike (contact on `form()`) | ✓ Done (DEFER) |
| 0.10 | 1a version catch-up + 1b delivery surface | ✓ Done |

---

### Next starter prompt (cairn-cms 0.10 migration, Pass 2)

> **Goal.** Convert ecnordic's seven directive components to the cairn component registry's typed
> attributes and named slots, so the admin guided-insert form and the build read one declaration.
>
> **Scope.** In: the directive component definitions and the build/render wiring. Out: visual
> changes, new components, the placeholder content (Pass 10).
>
> **Settled.** Delivery runs on the engine (Pass 1b). One canonical remark-directive grammar.
>
> **Still open, brainstorm first:** how the seven components map to explicit named slots; how
> `build()` reads the slots; migration order. This is the per-site half of engine Plan 3.
>
> **Approach.** "Invoke site-pass. Brainstorm before coding. Read the migration design spec first. Standard pass-end checklist."

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
