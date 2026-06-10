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

**Pass 0.37 (cairn upgrade), done 2026-06-09.** Engine bumped to `^0.37.1` (additive window: 0.36
structured logging, 0.37 login-confirmation panel, 0.37.1 internal diagnostics foundation) and
Workers Logs observability enabled. The send outage was fixed upstream (the `ecxc.ski` sending
domain is onboarded). Verified live: a login POST logged `auth.link.requested` and
`auth.token.minted` with no `auth.link.send_failed`, so the magic link delivered.

**Pending: domain reputation blocks magic-link delivery to the owner.** Fastmail rejects
at the DATA stage (`451 ... ecxc.ski is blacklisted`, per the Email Sending activity log via the
`emailSendingAdaptive` GraphQL dataset; the deploy token now has zone Analytics:Read). The domain
is days old, so this is new-domain blocklisting and ages out on its own; Gmail already delivers
(cross-check landed in INBOX, auth passing). Re-request a login link in a day or two, confirm
sign-in, then delete the old `cairn-ecnordic-auth` D1.

### Next starter prompt (coach voice drafting system)

> **Goal.** Build the generative drafting system and rewrite all five pages through it for
> Geoff's final edit.
>
> **Plan (approved, pre-baked):** `docs/superpowers/plans/2026-06-09-coach-voice-drafting-system.md`,
> spec at `docs/superpowers/specs/2026-06-09-coach-voice-drafting-system-design.md`. Execute
> task-by-task; spans this repo and the dotfiles (skills + method).
>
> **Approach.** Invoke site-pass. Standard pass-end checklist applies.

---

## History

- **Rename 1–6 (2026-06-08/09).** Full ECXC rebrand: identity sweep, audience broadening, new
  `cairn-ecxc-auth` D1, domain cutover with 301, brand mark (grid monogram + SVG favicon), and
  the repo/directory rename to `ecxc-ski`.
- **cairn-cms 0.33–0.37 (2026-06-07/09).** Admin isolated in a `(site)` route group, dep surface
  pruned, HTTPS forced at the edge (#28), admin-login CSRF fixed in 0.35 (cairn owns the token),
  structured logging + login-confirmation panel picked up in 0.37.1 with observability on.
- **Earlier (2026-06-02/06).** Web-content authoring skills, global component layer, six-page refresh.

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–9, 0.10–0.37 | Scaffold through cairn upgrades | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| Rename 1–6 | Full ECXC rebrand through repo rename | ✓ Done |

### Pre-publish checklist (gate before announcing)

- Magic-link login confirmed on ecxc.ski, then old D1 decommission (user-gated, see Pending).
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecxc.ski**. Push to `main` auto-deploys.
