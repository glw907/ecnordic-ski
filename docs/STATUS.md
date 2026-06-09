# ecnordic.ski: Project Status

## In progress: rebrand to ECXC (ecxc.ski), Rename 2 shipped 2026-06-08

The site is rebranding from East Community Nordic (ecnordic.ski) to East Community Cross Country
(ecxc.ski), widening the brand to welcome high school cross-country runners alongside skiers. The work
runs as a pass series; see `docs/superpowers/specs/2026-06-08-ecxc-rename-design.md`.

**Rename 2 (audience broadening), done.** The Training and About copy now frames the program for runners
and skiers together (fall and winter seasons, state meets and the Besh Cup, both race seasons); Home
already read inclusively after Rename 1. Content only. Gate green: check 0/0, test 54 (snapshots), build 0.

### Next starter prompt (Rename 3)

> **Goal.** Stand up a fresh auth D1, `cairn-ecxc-auth`, and point the live admin at it.
>
> **Scope.** Infra only, no content. Live site stays on ecnordic.ski; the old D1 stays until Rename 4.
>
> **Settled (do not re-brainstorm):** Create `cairn-ecxc-auth`, apply the schema dumped from
> `cairn-ecnordic-auth` (`SELECT sql FROM sqlite_master`), seed one owner allowlist row
> (`geoff@907.life`), and repoint the `wrangler.toml` D1 binding to the new `database_id`.
>
> **Approach.** Invoke site-pass. Gate plus a deployed admin-login check on ecnordic.ski.

---

## History

- **cairn-cms 0.33–0.35 (2026-06-07/08).** Admin isolated in a `(site)` route group, dep surface pruned,
  HTTPS forced at the edge (#28), and the admin-login CSRF fixed in 0.35 (cairn owns a missing-Origin
  double-submit token; consumer set `csrf: { checkOrigin: false }`). Closed the login blocker (#29).
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
| Rename 2 | Audience broadening (content) | ✓ Done |
| Rename 3–6 | Auth D1, domain cutover, logo, repo rename | Queued |

---

### Remaining before the public launch

The pre-publish checklist is the gate before announcing the site:

- The ecxc.ski rebrand passes above.
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecnordic.ski** (rebrands to ecxc.ski at the cutover). Push to `main` deploys via GitHub Actions.
