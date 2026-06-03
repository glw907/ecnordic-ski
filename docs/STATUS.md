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

**Immediate next: the cairn-cms 0.21 migration, Plan A (the breaking floor), subagent-driven.**
The engine moved from 0.10 to 0.21, so the migration target jumped. This is an all-in migration
(brainstormed and approved 2026-06-02, design
`docs/superpowers/specs/2026-06-02-ecnordic-cairn-0.21-migration-design.md`), and it doubles as the
first real DX audit of cairn-cms. It runs as two plan files, executed back to back in a clean
session: Plan A (`docs/superpowers/plans/2026-06-02-ecnordic-cairn-0.21-plan-a-breaking-floor.md`)
is the breaking floor (bump to `^0.21.0`, the schema-contract adapter, the seven components ported to
the `build(ctx)` slot model, the five directive content files rewritten, the sanitize floor
reconciled onto the engine's, `createSiteIndexes`), and Plan B
(`docs/superpowers/plans/2026-06-02-ecnordic-cairn-0.21-plan-b-content-graph.md`) is content-graph
adoption (manifest, build resolver, delete and rename actions, the `cairn:` link conversion) plus the
DX-findings synthesis. Start at Plan A Task 0. Do not push; a push deploys live. This supersedes the
old Pass 2 and Pass 3 (the 0.10-era design); the separate "Pass 10: placeholder content" work stays
open.

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

### Next starter prompt (cairn-cms 0.21 migration, Plan A)

> Execute the ecnordic cairn 0.21 migration, Plan A
> (`docs/superpowers/plans/2026-06-02-ecnordic-cairn-0.21-plan-a-breaking-floor.md`), subagent-driven,
> from the ecnordic-ski directory on `main`. Start at Task 0. The design is settled and approved
> (`docs/superpowers/specs/2026-06-02-ecnordic-cairn-0.21-migration-design.md`), so skip brainstorming.
> Dispatch one implementer per task and verify each commit before the next. Capture cairn-cms DX
> friction in `docs/cairn-dx-findings.md` as you go (a co-primary deliverable). Do NOT push; a push
> deploys ecnordic live. When Plan A's gate is green (`check` 0/0, `npm test` exit 0, `npm run build`
> exit 0, `url-inventory` and characterization tests green), run Plan B
> (`docs/superpowers/plans/2026-06-02-ecnordic-cairn-0.21-plan-b-content-graph.md`) the same way, then
> the `site-pass` pass-end ritual (the live deploy and the admin smoke stay a human fast-follow).

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
