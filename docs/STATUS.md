# ecnordic.ski: Project Status

## In progress: rebrand to ECXC (ecxc.ski), Rename 3 shipped 2026-06-08

Rebranding from East Community Nordic (ecnordic.ski) to East Community Cross Country (ecxc.ski), widening
the brand to welcome runners alongside skiers. Spec: `docs/superpowers/specs/2026-06-08-ecxc-rename-design.md`.

**Rename 3 (new auth D1), done.** Created `cairn-ecxc-auth` (`a47c56d2-25ef-4131-a505-8c9fd5a92f1f`),
re-applied cairn's schema (editor, magic_token, session + two indexes), seeded the `geoff@907.life`
owner, and repointed the `wrangler.toml` `AUTH_DB` binding. The old `cairn-ecnordic-auth` stays live
until the Rename 4 cutover. Gate green: check 0/0, test 54, build 0.

### Next starter prompt (Rename 4)

> **Goal.** Cut the live site over to `ecxc.ski` and 301-redirect the old domain.
>
> **Scope.** Domain, route, and Worker name. This is the disruptive pass; the Worker renames from
> `ecnordic` to `ecxc`, which creates a new Worker and orphans the old one.
>
> **Settled (do not re-brainstorm):** Wire `ecxc.ski` DNS and the Worker custom domain through the
> Cloudflare API (zone `3de7acd16b3a1fab5bafa2a46c3b0243`). Flip `site.config.yaml` `url` and
> `email.sender`, plus `wrangler.toml` `PUBLIC_ORIGIN`, `route`, and Worker `name`. Add the
> `ecnordic.ski` to `ecxc.ski` 301 Redirect Rule on the old zone. Decommission the old Worker route
> and the `cairn-ecnordic-auth` database after verifying.
>
> **Approach.** Invoke site-pass. Verify `ecxc.ski` serves, `ecnordic.ski` 301s, and magic-link login
> works end to end on the new domain against `cairn-ecxc-auth`.

---

## History

- **cairn-cms 0.33–0.35 (2026-06-07/08).** Admin isolated in a `(site)` route group, dep surface pruned,
  HTTPS forced at the edge (#28), and the admin-login CSRF fixed in 0.35 (cairn owns the token). Closed #29.
- **Earlier (2026-06-02/06).** Web-content authoring skills, global component layer, six-page site
  refresh, and the 0.10 to 0.24 cairn adoption.

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–9, 0.10–0.21 | Scaffold, design, directives, version catch-up, content graph | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| 0.33–0.35 | cairn upgrades: admin standalone, dep prune, CSRF fix | ✓ Done |
| Rename 1 | ECXC identity sweep | ✓ Done |
| Rename 2 | Audience broadening (content) | ✓ Done |
| Rename 3 | New auth D1 (cairn-ecxc-auth) | ✓ Done |
| Rename 4–6 | Domain cutover, logo, repo rename | Queued |

### Pre-publish checklist (gate before announcing)

- The ecxc.ski rebrand passes above.
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecnordic.ski** (rebrands to ecxc.ski at cutover). Push to `main` auto-deploys.
