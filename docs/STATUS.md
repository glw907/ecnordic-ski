# ecxc.ski: Project Status

## Rebrand to ECXC: complete (2026-06-09)

East Community Nordic (ecnordic.ski) is now East Community Cross Country (ecxc.ski), welcoming
runners alongside skiers. All six rename passes shipped; spec archived at
`docs/superpowers/archive/specs/2026-06-08-ecxc-rename-design.md`.

**Rename 6 (repo + directory rename), done.** GitHub repo renamed to `glw907/ecxc-ski` (old name
redirects), git remote updated, local directory moved to `~/Projects/ecxc-ski`, per-project Claude
memory carried to the new path slug. Swept the live repo-name references: cairn backend `repo`,
`package.json` name, the CLAUDE.md header, the workflow rule, and the backlog domain tag
(`#ecnordic` to `#ecxc`).

**Pending (user):** confirm magic-link login on `ecxc.ski` (blocked on a verified Email Routing
destination or a provider sender; see the cairn DX escalation), then delete the old
`cairn-ecnordic-auth` D1.

### Next starter prompt

> **Goal.** Open. The rebrand initiative is done; remaining work is the pre-publish checklist
> below (mostly user-gated) and the backlog. Nearest dev-shaped items: #30 raster favicon
> fallback, #26 retroactive content rubric audit, #15 ArchiveList heading skip.
>
> **Approach.** Pick the next initiative with the user, then invoke site-pass.

---

## History

- **Rename 1–6 (2026-06-08/09).** Full ECXC rebrand: identity sweep, audience broadening, new
  `cairn-ecxc-auth` D1, domain cutover with 301, brand mark (grid monogram + SVG favicon), and
  the repo/directory rename to `ecxc-ski`.
- **cairn-cms 0.33–0.35 (2026-06-07/08).** Admin isolated in a `(site)` route group, dep surface
  pruned, HTTPS forced at the edge (#28), admin-login CSRF fixed in 0.35 (cairn owns the token).
- **Earlier (2026-06-02/06).** Web-content authoring skills, global component layer, six-page refresh.

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–9, 0.10–0.35 | Scaffold through cairn upgrades | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| Rename 1–6 | Full ECXC rebrand through repo rename | ✓ Done |

### Pre-publish checklist (gate before announcing)

- Magic-link login confirmed on ecxc.ski, then old D1 decommission (user-gated, see Pending).
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecxc.ski**. Push to `main` auto-deploys.
