# ecnordic.ski: Project Status

## Queued: upgrade to cairn-cms 0.33.0 (admin stands alone)

cairn-cms published `0.33.0` on 2026-06-08 (registry `latest`), folding the admin-stands-alone initiative
across `0.30.0` through `0.33.0` over the prior `0.29.0`. This site pins `^0.24.0`, and a caret on a `0.x`
version locks the minor, so the range will not pull `0.33.0` on its own. Run this as a `site-pass`. The
full per-version action list is in `../cairn-cms/docs/guides/upgrade-cairn.md`; the three items below are
the ones that touch this site, verified against its code on 2026-06-08.

1. **Bump the dependency.** Set `@glw907/cairn-cms` to `^0.33.0` in `package.json`, reinstall, and
   regenerate the committed manifest (`npm run cairn:manifest`). Confirm `scripts/build-manifest.mjs`
   still resolves its engine imports: the `0.27.0` surface-narrowing moved the delivery read surface off
   the root barrel, and the `0.26.0` DX-B pass added a `cairnManifest()` Vite plugin that can replace the
   hand-rolled script. Repoint the imports or adopt the plugin if the script breaks.

2. **Fix the `composeRuntime` call.** `src/lib/cairn.server.ts:14` uses the old positional form
   `composeRuntime(cairn, [], urlPolicyFrom(siteConfig))`. The object form landed at `0.25.0`. Change it
   to `composeRuntime({ adapter: cairn, siteConfig })` and drop the now-unused `urlPolicyFrom` import. This
   break is already latent against the current `^0.24.0` pin.

3. **Move host chrome out of `/admin`.** The root `src/routes/+layout.svelte` imports `../app.css` and
   renders `<Nav>`, `<SearchModal>`, a width-constraining `<main class="container ... max-w-5xl">`, and a
   `<footer>`. All of it wraps `/admin` today. Create a `src/routes/(site)/+layout.svelte` group that holds
   the `app.css` import, the Nav, the SearchModal, the `<main>` wrapper, and the footer, then move the
   public routes into the group: `+page.svelte`, `+page.server.ts`, `[...path]`, `archives`, `contact`,
   `tags`, `waiver` (and `+layout.server.ts` if it loads chrome data). Leave the root layout bare
   (`{@render children()}`, plus the `<svelte:head>` feed links if you keep them there). Keep `admin/` and
   the endpoints (`feed.xml`, `feed.json`, `sitemap.xml`, `robots.txt`, `healthz`) at the route root. Group
   folders do not change any URL. A dev-only guard in the admin logs a console error until the root layout
   is chrome-free.

**Not affected, skip:** the `0.30.0` render-authoring import moves and the `rehypeDispatch` removal (this
site imports neither). `0.31.0` and `0.32.0` are additive. One quick check: `0.30.0` makes `defineRegistry`
fail a component that sets `defaultIconByRole` with no `type:'icon'` attribute; this site defines
`ICON_ATTR` (`type:'icon'`) in `src/lib/markdown/components.ts`, so confirm each component that sets
`defaultIconByRole` lists `ICON_ATTR` in its attributes.

**Verify:** `npm run check` 0/0, `npm run build` exit 0, and an admin smoke (sign in at `/admin`, confirm
the admin renders full-bleed with no site nav or footer around it, create and preview a post). The public
pages must look unchanged, since the chrome only moved.

---

**Shipped: web-content authoring infrastructure (2026-06-06).** The audience-first web-content
authoring track is built and verified, across all eight plan tasks. What shipped: the shared method
doc (`web-content-method.md`), the `content-draft` and `content-review` skills, the widened
`prose-guard` general-tier lexicon, the ecnordic routing (the `content.md` router, the `CLAUDE.md`
pointer, the reminder hook), the content-guide pointer plus trailhead exemplars, and the retirement
of `content-cleanup`. The technical writing voice stays intact. The work spanned two repos: the
dotfiles (`~/.dotfiles`, holding the shared method, the two skills, and `prose-guard`) and this repo
(the content guide, the routing rule, the reminder hook, the `content-cleanup` retirement). The
design spec is at `docs/superpowers/specs/2026-06-05-web-content-authoring-design.md`, and the
eight-task plan is at `docs/superpowers/plans/2026-06-06-web-content-authoring.md`.

End-to-end verification passed. `prose-guard` blocks `embark` and advises on `vital` and `journey` in
the general tier, the docs tier still does not block on `robust` or `comprehensive`, and the suite is
90 green. A live `content-review` smoke test on `src/content/pages/about.md` loaded the method doc,
ran the rubric, and returned a Publish band (93) with a full score table and per-sentence findings.

Both repos are pushed: the dotfiles to `github.com/glw907/workstation`, the ecnordic changes to `main`.
The ecnordic push touched only config and docs, no rendered page, so the live site content did not
change. One operational note: the dotfiles side needed a re-stow of the `claude` package
(`stow -R claude`) so the new `~/.claude/docs/web-content-method.md` symlink exists, and that was done.
The two out-of-scope follow-ups are filed in `BACKLOG.md` (#26 and #27). The natural next step is the
#26 rubric audit: run `content-review` over each page in `src/content/pages/`, ideally in a fresh
session for an independent score.

**Shipped: global component layer (2026-06-06).** The `.ec-*` component styles moved to the global
stylesheet, the Volunteers page is fixed, the entrance cascade now covers every static page, and
About and Volunteers carry gloss footnotes. Eight commits (`fd3c90e` through `5745aa8`), pushed to
production. Each CSS task kept the 54 characterization snapshots green; the two content tasks updated
their own page snapshots.

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
Correction (2026-06-06): this work is on `main` and deployed, not pending. The `site-refresh` branch was
merged before the global component-layer pass and has now been deleted, along with the stale
`chore/stable-0.6.0` and `cutover/cairn-rc` branches. The repo runs on `main` alone.

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
in CrewLAB, and the program is free with need-blind donations. One content confirmation remains open as a
pre-publish item, the CrewLAB collection model (BACKLOG #21 and #22). The Training loaner equipment (#24)
and the camp packing list (#25) are now closed.

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

### Remaining before the public launch

The content rebuild is a finished first draft, merged to `main` and deploying to the live URL. The site
is not a public launch yet, so the pre-publish checklist is the gate before announcing it:

- Attorney review of the waiver.
- The external confirmations: the CrewLAB join link and signing flow (#22) and the CrewLAB collection
  model (#21). The crewlab page still carries a live `PLACEHOLDER` for what EC Nordic collects.
- The launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), and `/home` to `/` (#17).
- Real photos in place of the placeholders.

BACKLOG #24 (Training loaner equipment) and #25 (camp packing list) are already closed.

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
