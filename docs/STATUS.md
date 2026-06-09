# ecnordic.ski: Project Status

## In progress: rebrand to ECXC (ecxc.ski), Rename 1 shipped 2026-06-08

The site is rebranding from East Community Nordic (ecnordic.ski) to East Community Cross Country
(ecxc.ski), widening the brand to welcome high school cross-country runners alongside skiers. The work
runs as a pass series; see `docs/superpowers/specs/2026-06-08-ecxc-rename-design.md`.

**Rename 1 (identity sweep), done.** The org name is swept across content, routes, config, code, and the
current docs. The naming convention is rewritten: "East Community Cross Country" first, "ECXC" after, the
sport word flexible. The Nav wordmark is a plain "ECXC" placeholder. Domain, Worker, route, and the auth
DB stay on ecnordic.ski until the cutover, so the live site keeps serving. Gate green: check 0/0, test 54,
build exit 0.

**Remaining passes:** audience broadening (content welcomes runners and skiers), new auth D1 (owner
geoff@907.life), domain cutover plus the ecnordic.ski redirect, brand logo via frontend-design, then the
repo and directory rename.

---

## History

- **cairn-cms 0.35 (2026-06-08).** Admin CSRF fix: cairn owns CSRF via a double-submit token tolerant of a
  missing Origin; consumer set `csrf: { checkOrigin: false }`. Closed the login blocker (#29).
- **cairn-cms 0.34 + dep prune (2026-06-08).** Forced HTTPS at the edge (#28); cut better-auth, drizzle,
  and the markdown-pipeline packages cairn bundles.
- **cairn-cms 0.33 (2026-06-07).** Admin isolated via a `(site)` route group; manifest verified by the Vite plugin.
- **Earlier (2026-06-02/06).** Web-content authoring skills, global component layer, six-page site refresh,
  and the 0.10 to 0.24 cairn adoption.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–9, 0.10–0.21 | Scaffold, design, directives, version catch-up, content graph | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| 0.33–0.35 | cairn upgrades: admin standalone, dep prune, CSRF fix | ✓ Done |
| Rename 1 | ECXC identity sweep | ✓ Done |
| Rename 2–6 | Content broadening, auth D1, domain cutover, logo, repo rename | Queued |

---

### Remaining before the public launch

The pre-publish checklist is the gate before announcing the site:

- The ecxc.ski rebrand passes above.
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecnordic.ski** (rebrands to ecxc.ski at the cutover). Push to `main` deploys via GitHub Actions.
