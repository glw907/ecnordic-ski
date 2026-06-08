# ecnordic.ski: Project Status

## Shipped: cairn-cms 0.35.0 (admin CSRF fix), 2026-06-08

ecnordic moved to `^0.35.0` as a `site-pass`. 0.35.0 makes cairn the single CSRF authority for the admin:
every admin form POST carries a `__Host-cairn_csrf` double-submit token that tolerates a missing `Origin`,
so the JS-free magic-link login works from a privacy browser that omits the header (closes the #29 login
blocker). A failed check serves a branded "Security check · Cairn" 403 in place of the raw SvelteKit text.

The consumer change is one line, `csrf: { checkOrigin: false }` in `svelte.config.js`, so the framework's
global check steps aside and cairn's guard owns it (cairn restores the strict `Origin` check for the site's
own non-admin POSTs). The confirm page's prop type gained the new `csrf` field; the cairn admin components
render the hidden field themselves, so nothing else changed. Verified on local dev: the login GET issues the
token cookie and a matching hidden field, a no-`Origin` POST with a valid token passes the gate, and a
missing or wrong token gets the branded 403. Gate green: check 0/0, test 54, build exit 0.

**Current state.** Public delivery and the admin run on cairn-cms `^0.35.0`; see `docs/architecture.md`.
No engineering pass is queued. The next work is the pre-publish checklist below, mostly human and external.

---

## History

- **cairn-cms 0.34 upgrade + dep prune (2026-06-08).** `^0.33.0` to `^0.34.0`; forced HTTPS at the edge
  (#28), and cut better-auth, drizzle, and the markdown-pipeline packages cairn already bundles.
- **cairn-cms 0.33 upgrade (2026-06-07).** `^0.24.0` to `^0.33.0`; admin isolated via a `(site)` route
  group + bare root layout, manifest verified by the `cairnManifest()` Vite plugin (drift now fatal).
- **Web-content authoring (2026-06-06).** Audience-first `content-draft`/`content-review` skills, the
  shared method doc, the widened `prose-guard` general tier, and the ecnordic routing.
- **Global component layer (2026-06-06).** `.ec-*` styles moved to the global stylesheet, Volunteers
  fixed, the entrance cascade covers every static page, gloss footnotes added.
- **Site refresh + 0.10–0.24 (2026-06-02/04).** Six-page content rebuild across three subagent-driven
  plans, and the early cairn adoption (`^0.10.0` to `^0.24.0`, idiomatic cairn site, content graph).

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–8 | Scaffold, design language, directive pipeline, kit rollout | ✓ Done |
| 9 | Remote-functions spike (contact on `form()`) | ✓ Done (DEFER) |
| 0.10–0.21 | Version catch-up, breaking floor, content graph | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| 0.33–0.34 | cairn 0.33/0.34 upgrades, admin standalone, dep prune | ✓ Done |
| 0.35 | cairn-cms 0.35.0 admin CSRF fix | ✓ Done |

---

### Remaining before the public launch

The pre-publish checklist is the gate before announcing the site:

- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER` on page).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
