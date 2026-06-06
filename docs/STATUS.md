# ecnordic.ski: Project Status

**Current initiative: global component layer (plan ready, 2026-06-05).** The Training-page redesign
and the sitewide theme polish shipped to production in commit `931e644`. The follow-up is a
component-system consolidation. Lift the reusable `.ec-*` styles out of the page-scoped route block
into the global stylesheet so every component renders the same everywhere, fix the Volunteers page
(its `split`/`panel` and grid head render unstyled today), generalize the entrance cascade to all
static pages, and add gloss footnotes to About and Volunteers. The design spec is at
`docs/superpowers/specs/2026-06-05-global-component-layer-design.md`, and the eight-task plan is at
`docs/superpowers/plans/2026-06-05-global-component-layer.md`. Execute it via
`subagent-driven-development`, one implementer per task, in a fresh session. Do not push; a push to
`main` deploys live.

---

**Site refresh initiative: ALL THREE PLANS DONE (2026-06-04).** A full content rebuild to the
brief's six-page IA (Home, About, Training, Volunteers & Coaches, CrewLAB, Contact, plus a utility
Archives). The design spec is committed at `docs/superpowers/specs/2026-06-04-site-refresh-design.md`; it
carries the canonical-facts block (activities, eligibility, schedule, camp, non-affiliation, waiver) that
keeps copy in sync across separately-drafted pages. The work was three sequenced plans, each executed via
`subagent-driven-development`, one implementer per task. With Plan 3 landed, the content rebuild is at a
finished first draft. The remaining initiative work is the pre-publish checklist and the launch-time
redirects, both tracked in `BACKLOG.md`.

Plan 1 (the structural floor) landed in six commits on `site-refresh`: the six-page primary nav (Resources
dropped), the footer Archives link, the `aside` / `figure` / `gallery` directives, the `/archives` page,
the editable Home (welcome copy moved into a `src/content/pages/home.md` content page), and the Contact
intro copy.

Plan 2 (carry-over and revise pages) is DONE, in four content commits plus one spec fix on `site-refresh`.
It rewrote About, CrewLAB, and Volunteers & Coaches to the canonical facts, placed the origin story and the
three bios verbatim, pointed every waiver reference at CrewLAB, and retired the Resources page. The waiver
and forms content folded into CrewLAB first, then the page was deleted and its one inbound link repointed.
The editorial backstop found no AI-rhythm tells in the rewritten pages. One snag surfaced mid-execution:
the verbatim origin story used "dedicated", a word on the content-guide banned list, so `prose-guard`
blocked writing it into a content page. The fix swapped it to "committed" at the canonical source, so the
spec and the About page stay in sync. Gate green (`check` 0/0, `npm test` 54, build clean). The count fell
from 56 to 54 because the two Resources characterization tests retired with the page.

Plan 3 (the Training hub) is DONE, in two commits on `site-refresh`. It rewrote
`src/content/pages/training.md` to the canonical facts across the full Training map (intro, schedule,
activities, training groups, who can join, what to bring, Talkeetna camp, sign up, your first session,
common questions), glossed "spenst" and "over-distance" in asides, and corrected the old "camp registration
is included" clause to the canonical separate-registration phrasing. The spec assigned a `toc` directive to
this plan, but cairn-cms `^0.24.0` cannot host it. The toc needs a render pass after `rehypeSlug`, and the
engine exposes no plugin hook (DX finding 18). The toc is descoped by decision (BACKLOG #23); the page
keeps a hand-maintained `<nav class="page-toc">` until a cairn-cms engine change lands the real component.
The editorial backstop found no AI-rhythm tells in the rewritten page, so the content, manifest, and
snapshots were left untouched. The page carries two tracked content placeholders, a loaner-equipment line
(BACKLOG #24) and the camp packing list (BACKLOG #25). Gate green (`check` 0/0, `npm test` 54, build clean).
All work sits on the `site-refresh` branch, unpushed (a push to `main` deploys live).

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
experimental, so keep contact as the proving ground (BACKLOG #13). **Pass 10 (closed):** the
old placeholder-content concern is resolved. Every page now carries real content, the Training rewrite in
Plan 3 being the last. The waiver and payment model is settled by the canonical facts: the waiver is signed
in CrewLAB, and the program is free with need-blind donations. Three content confirmations remain open as
pre-publish items, the CrewLAB collection model (BACKLOG #21), the Training loaner equipment (#24), and the
camp packing list (#25).

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
| Refresh 2 | Carry-over and revise pages (About, CrewLAB, Volunteers; retire Resources) | ✓ Done |
| Refresh 3 | Training hub rewrite to canonical facts; toc deferred (BACKLOG #23) | ✓ Done |

---

### Next starter prompt (finish the site-refresh initiative)

> All three site-refresh plans are done and green on `site-refresh`, unpushed. The content rebuild is at a
> finished first draft. What remains is the pre-publish checklist and the launch-time redirects. The
> pre-publish checklist covers attorney review of the waiver, the external confirmations (the live CrewLAB
> join link and signing flow in BACKLOG #22, the CrewLAB collection model in #21, the Training loaner
> equipment in #24, and the camp packing list in #25), and swapping in real photos. The launch-time
> redirects are `/resources` and `/waiver` to CrewLAB (BACKLOG #18) and `/home` to `/` (#17). Decide
> whether to merge `site-refresh` to `main` now (a push to `main` deploys live) or to hold for the
> pre-publish items first. Do not push without that decision.

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
