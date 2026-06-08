# ecnordic.ski: Project Status

## Shipped: cairn-cms 0.33.0 upgrade (admin stands alone), 2026-06-07

ecnordic moved from `^0.24.0` to `^0.33.0` as a `site-pass`. Five changes landed. The dependency bump
(manifest regenerated, in sync). `composeRuntime` moved to the object form
`composeRuntime({ adapter: cairn, siteConfig })` in `src/lib/cairn.server.ts`. The manifest check moved to
the `cairnManifest()` Vite plugin: the in-graph `verifyManifest` is dropped, `cairn:manifest` now runs the
shipped `cairn-manifest` bin, and the hand-rolled `scripts/build-manifest.mjs` is deleted. That makes
manifest drift fatal regardless of `handleHttpError`, closing the non-fatal-manifest carry-forward. The
render-authoring helpers `iconSpan`, `cardShell`, and `MakeIcon` repointed to `@glw907/cairn-cms/render`
(the 0.30.0 move; STATUS had wrongly marked this "not affected", the bump caught it). The host chrome moved
into a `(site)` route group so `/admin` renders standalone: the root layout is bare, the 0.33.0 dev guard
stays quiet, and no URL moved.

Gate green: `npm run check` 0/0, `npm test` 54, `npm run build` exit 0, prerender output unchanged at every
public URL, `/admin/login` 200 with no site chrome. The full create-and-preview-a-post admin smoke needs
magic-link auth and the GitHub App, so it stays a human fast-follow, as in prior migrations.

**Current state.** The directive render pipeline is live; all static pages carry inline container
directives; the content style guard blocks AI tells in `src/content/**/*.md`. The contact form runs on a
SvelteKit remote function (`form()`, Pass 9). Public delivery and the admin run on cairn-cms `^0.33.0`. See
`docs/architecture.md`. No engineering pass is queued; the next work is the pre-publish checklist below,
which is mostly human and external.

---

## History

- **Web-content authoring (2026-06-06).** Audience-first `content-draft`/`content-review` skills, the
  shared method doc, the widened `prose-guard` general tier, and the ecnordic routing. Follow-ups: BACKLOG
  #26 (rubric audit), #27.
- **Global component layer (2026-06-06).** `.ec-*` styles moved to the global stylesheet, Volunteers fixed,
  the entrance cascade covers every static page, gloss footnotes added.
- **Site refresh (2026-06-04).** Full content rebuild to the six-page IA across three subagent-driven
  plans; finished first draft on `main`.
- **cairn-cms 0.24 bump (2026-06-04).** `^0.21.0` to `^0.24.0`; one consumer change (the `CairnHead`
  import split).
- **cairn-cms 0.21 migration (2026-06-02).** `^0.10.0` to `^0.21.0` as a fully idiomatic cairn site
  (schema contract, slot model, engine public surface, content graph). First cairn DX audit.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–8 | Scaffold, design language, directive pipeline, kit rollout | ✓ Done |
| 9 | Remote-functions spike (contact on `form()`) | ✓ Done (DEFER) |
| 0.10 | Version catch-up + delivery surface | ✓ Done |
| 0.21 | Breaking floor + content graph | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| 0.33 | cairn-cms 0.33.0 upgrade (admin stands alone) | ✓ Done |

---

### Remaining before the public launch

The content rebuild is a finished first draft, merged to `main` and deploying to the live URL. The
pre-publish checklist is the gate before announcing it:

- Attorney review of the waiver.
- The CrewLAB external confirmations: the join link and signing flow (#22) and the collection model (#21).
  The crewlab page still carries a live `PLACEHOLDER` for what EC Nordic collects.
- The launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), and `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
