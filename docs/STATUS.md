# ecxc.ski: Project Status

## In progress: rebrand to ECXC (ecxc.ski), domain cut over 2026-06-08

Rebranding from East Community Nordic (ecnordic.ski) to East Community Cross Country (ecxc.ski),
widening the brand to welcome runners alongside skiers. Spec: `docs/superpowers/specs/2026-06-08-ecxc-rename-design.md`.

**Rename 4 (domain cutover), done.** `ecxc.ski` is live on the new `ecxc` Worker. `ecnordic.ski`
301-redirects to it with the path and query preserved, via a Page Rule on a proxied placeholder
record (the deploy token can't edit the Rulesets API). Email Routing is enabled on `ecxc.ski` so
magic links sign from `noreply@ecxc.ski`. The old `ecnordic` Worker and its custom domain are gone.
**Pending:** delete the `cairn-ecnordic-auth` D1 once magic-link login is confirmed on `ecxc.ski`.

**Rename 4.5 (identity cleanup), done.** Swept the `ecn`/`ecn-dark` DaisyUI themes to
`ecxc`/`ecxc-dark`, the `ecnordicRegistry` identifier to `ecxcRegistry`, the waiver wordmark
classes, and the hero asset. Gate green: check 0/0, test 54, build 0.

### Next starter prompt (Rename 5)

> **Goal.** Design the ECXC brand mark: a four-spot grid monogram, "EC" over "XC".
>
> **Plan (brainstormed, pre-baked):** `docs/superpowers/plans/2026-06-09-rename-5-brand-mark.md`,
> spec at `docs/superpowers/specs/2026-06-09-ecxc-brand-mark-design.md`. Execute task-by-task.
>
> **Approach.** Invoke site-pass, design through `frontend-design`. Standard pass-end checklist applies.

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
| Rename 5–6 | Brand logo, repo rename | Queued |

### Pre-publish checklist (gate before announcing)

- The ecxc.ski rebrand passes above (old D1 decommission still pending login check).
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecxc.ski**. Push to `main` auto-deploys.
