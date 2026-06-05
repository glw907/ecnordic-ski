# ecnordic.ski: Project Status

**Site refresh initiative: PLAN 1 DONE (2026-06-04).** A full content rebuild to the brief's
six-page IA (Home, About, Training, Volunteers & Coaches, CrewLAB, Contact, plus a utility Archives).
The design spec is committed at `docs/superpowers/specs/2026-06-04-site-refresh-design.md`; it carries the
canonical-facts block (activities, eligibility, schedule, camp, non-affiliation, waiver) that keeps copy
in sync across separately-drafted pages. The work is three sequenced plans. Plan 1 (the structural floor)
landed in six commits on `site-refresh`: the six-page primary nav (Resources dropped), the footer Archives
link, the `aside` / `figure` / `gallery` directives, the `/archives` page (tag index plus by-year list plus
feed links), the editable Home (welcome copy moved from the `WELCOME_BLURB` constant into a
`src/content/pages/home.md` content page rendered through cairn), and the Contact intro copy. Gates green
(`check` 0/0, `npm test` 56, build clean). All work sits on the `site-refresh` branch, unpushed (a push to
`main` deploys live). **Immediate next: author Plan 2 (About, CrewLAB, Volunteers content) from the spec's
section maps and canonical-facts block, then execute it via `subagent-driven-development`.** Plan 3 (the
Training hub) follows. A secondary mission runs alongside: collect cairn-cms DX findings in
`docs/cairn-dx-findings.md` (Plan 1 added finding 17, the missing route-less content-fragment concept that
forced the editable Home into a redundant `/home` URL).

**Current state.** The directive render pipeline is live; all five static pages carry inline
container directives; the content style guard blocks AI tells in `src/content/**/*.md`. The
contact form runs on a SvelteKit remote function (`form()`, Pass 9). Public delivery and the admin
surface run on the cairn-cms engine at `^0.24.0`. See `docs/architecture.md`.

**cairn-cms 0.24 bump: DONE (2026-06-04).** ecnordic moved from `^0.21.0` to `^0.24.0`, the latest
version on npm. A routine version bump, not a structural migration. The whole upgrade was one consumer
change: the `CairnHead` import moved to `@glw907/cairn-cms/delivery/head` (the 0.22 entry-point split).
The 0.23 date and tags validation tightening needed no work, since the one post already held a valid
date and an in-vocabulary tag. Gates green (`check` 0/0, `npm test` 50, build clean). The upgrade
surfaced one DX finding, filed in `cairn-cms/docs/cairn-dx-feedback-2026-06-04-ecnordic-0.24.md`: the
changelog and upgrade guide ship in neither the npm tarball nor a `homepage` link, so an npm consumer
cannot reach the upgrade path from the registry.

**cairn-cms 0.21 migration: DONE (2026-06-02).** ecnordic moved from `^0.10.0` to `^0.21.0` as a
completely idiomatic cairn site, across two plans. Plan A (the breaking floor) ported the adapter to
the `defineFields` schema contract, the seven directive components to the `build(ctx)` slot model, the
five directive pages to the slot syntax, dropped the site's second sanitize pass for the engine floor
(extended via `sanitizeSchema`), and adopted the idiomatic public surface (`createSiteIndexes`,
`createPublicRoutes`, `CairnHead`, the `*Response` helpers). Plan B added the content graph: the
committed manifest (`src/content/.cairn/index.json`) and its `verifyManifest` build backstop, the
`delete`/`rename` admin actions, and the welcome post's CrewLAB link converted to a `cairn:pages/crewlab`
token (the `/waiver` link stays absolute, since the waiver is a hand-built route, not a content page).
Zero URL movement (guarded by `url-inventory`), no rendered-body change. Gates green (`check` 0/0,
`npm test` 50 exit 0, `npm run build` exit 0). The migration doubled as the first cairn-cms DX audit:
findings in `docs/cairn-dx-findings.md`, filed as an engine backlog in
`cairn-cms/docs/dx-backlog-ecnordic-migration.md`. All commits sit on local `main`, not pushed (a push
deploys live).

**Immediate next: deploy and the live `/admin` smoke (human fast-follow).** A push to `main` deploys
ecnordic to production, so a human pushes when ready, then smoke-tests `/admin`: the delete and rename
actions and the editor link picker against the real Worker. Two build-time follow-ups are recorded as DX
findings and in `BACKLOG.md`: the dangling-token backstop is not fatal (the inherited
`prerender.handleHttpError: 'warn'` downgrades the prerender 500 to a warning), and the schema contract
dropped four validation rules the old validator enforced.

**Pass 9 (DEFER):** contact form on `form()`, verified on adapter-cloudflare; the API is
experimental, so keep contact as the proving ground (BACKLOG #13). **Pass 10 (open, not blocking):**
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
| 0.21 | Breaking floor (Plan A) + content graph (Plan B) | ✓ Done |
| Refresh 1 | Structural floor (nav, directives, archives, editable Home, Contact copy) | ✓ Done |

---

### Next starter prompt (author site-refresh Plan 2)

> Site-refresh Plan 1 is done and committed on `site-refresh`, unpushed. Author Plan 2: the About,
> CrewLAB, and Volunteers & Coaches content. Work from the design spec at
> `docs/superpowers/specs/2026-06-04-site-refresh-design.md`, using its section maps and the
> canonical-facts block so copy stays in sync across the separately-drafted pages. Write the plan
> against the real directive APIs that Plan 1 landed (`aside`, `figure`, `gallery`, plus the existing
> `split`/`panel` for the Volunteers bios, since the `roster` directive is deferred per BACKLOG #19).
> Then execute via `subagent-driven-development`. Standard pass-end checklist applies.

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
