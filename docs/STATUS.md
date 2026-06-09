# ecxc.ski: Project Status

## In progress: rebrand to ECXC (ecxc.ski), domain cut over 2026-06-08

Rebranding from East Community Nordic (ecnordic.ski) to East Community Cross Country (ecxc.ski),
widening the brand to welcome runners alongside skiers. Spec: `docs/superpowers/specs/2026-06-08-ecxc-rename-design.md`.

**Rename 4 (domain cutover), done.** `ecxc.ski` is live on the new `ecxc` Worker. `ecnordic.ski`
301-redirects to it with the path and query preserved, via a Page Rule on a proxied placeholder
record (the deploy token can't edit the Rulesets API). Email Routing is enabled on `ecxc.ski` so
magic links sign from `noreply@ecxc.ski`. The old `ecnordic` Worker and its custom domain are gone.
**Pending:** delete the `cairn-ecnordic-auth` D1 once magic-link login is confirmed on `ecxc.ski`.

**Rename 5 (brand mark), done.** Four-spot grid monogram (EC over XC, rectilinear paths) in
`Nav.svelte` via `currentColor`, plus `static/favicon.svg` (white glyphs on a crimson tile) wired
in `app.html`. A glyph-sync test pins the two path copies. Gate green: check 0/0, test 59, build 0.
Follow-ups logged: #30 Safari PNG favicon fallback, #31 `$app/state` migration.

### Next starter prompt (Rename 6)

> **Goal.** Rename the repo and local directory: `ecnordic-ski` becomes `ecxc-ski`.
>
> **Scope.** `gh repo rename ecxc-ski`, update the git remote, `mv ~/Projects/ecnordic-ski
> ~/Projects/ecxc-ski`, carry the per-project Claude memory dir to the new path slug, and sweep
> stale repo-name references (Sveltia config, docs, workflows). Runs last because it moves the
> working directory out from under the session; resume in the new directory.
>
> **Approach.** Invoke site-pass. Standard pass-end checklist applies.

---

## History

- **Rename 1–4.5 (2026-06-08).** ECXC identity sweep, audience broadening, new `cairn-ecxc-auth` D1,
  domain cutover to ecxc.ski with the 301 redirect, and the `ecn`-to-`ecxc` code identity cleanup.
- **cairn-cms 0.33–0.35 (2026-06-07/08).** Admin isolated in a `(site)` route group, dep surface
  pruned, HTTPS forced at the edge (#28), admin-login CSRF fixed in 0.35 (cairn owns the token).
- **Earlier (2026-06-02/06).** Web-content authoring skills, global component layer, six-page refresh.

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–9, 0.10–0.35 | Scaffold through cairn upgrades | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| Rename 1–3 | Identity sweep, audience, new auth D1 | ✓ Done |
| Rename 4 | Domain cutover + 301 redirect | ✓ Done |
| Rename 4.5 | ecn-to-ecxc code identity cleanup | ✓ Done |
| Rename 5 | Brand logo (grid monogram + favicon) | ✓ Done |
| Rename 6 | Repo and directory rename | Queued |

### Pre-publish checklist (gate before announcing)

- The ecxc.ski rebrand passes above (old D1 decommission still pending login check).
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecxc.ski**. Push to `main` auto-deploys.
