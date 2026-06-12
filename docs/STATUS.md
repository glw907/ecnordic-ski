# ecxc.ski: Project Status

## Current state (2026-06-12)

The ECXC rebrand is complete (six passes; spec in `docs/superpowers/archive/specs/`), the engine
is on cairn `^0.51.0` with the single-mount admin and the iframed editor preview, and all five
pages are rewritten through the new coach voice drafting system.

**cairn 0.51.0 bump, shipped 2026-06-12.** Pin to `^0.51.0` (commit `827bc74`) atop the held
preview-knob wiring (`47f82dc`, the fidelity proof for the engine's iframed preview); deploy run
`27429659432` green. `cairn-doctor --probe https://ecxc.ski` passed 11/0 on its first live run,
verifying the sign-in envelope and the non-leak answer from the deployed site. The one skip is
the D1 auth-store check: `wrangler.toml` carries no `account_id`, so the doctor's derivation has
nothing to read; adding the one-line `account_id` would let it run (cheap follow-up).

**cairn 0.50.0 crossing, shipped 2026-06-12.** The eighteen-file admin shim tree became the
two-file catch-all mount plus the composer (see `docs/architecture.md`); floors raised to svelte
`^5.56.3` and kit `^2.12`. Live-proven after deploy: `/admin/login` 200 with the CSRF envelope,
a real login POST returned `sent` (logs: `auth.link.requested` then `auth.token.minted`, no
send failure), back-to-back POSTs returned `throttled` (the 0.38 states, proven live at last),
and `cairn-doctor` runs 9/9 green with full credentials. Remaining manual step: Geoff clicks a
magic link (fresh ones in the inbox from the proof; if none arrived, Fastmail's new-domain
blacklisting of 2026-06-11 may still be aging out, while the binding now accepts the send) to
confirm sign-in and exercise the publish workflow, then the old `cairn-ecnordic-auth` D1 can go.

**Visual rebrand, shipped 2026-06-11.** Fireweed/spruce palette and the tile mark; selection
record `docs/design/brand-exploration.html`, binding rule `.claude/rules/design-system.md`.
Geoff's first CMS edits landed 2026-06-11, so the harvest starter below is actionable.

### Next starter prompt

> **Goal.** Harvest Geoff's first edits. After he edits any rewritten page, run the corpus
> harvest ("feed my edits back"): diff against the draft commit, promote the strongest passages
> to First-party gold, and turn any twice-made fix into a guide rule.
>
> **Also open:** the pre-publish checklist below, and backlog #21 (the crewlab payment `[ASK]`
> ships visibly in the page), #30 favicon fallback, #15 heading skip.
>
> **Approach.** Harvest is a small pass, no plan needed. For new initiatives, invoke site-pass.

---

## History

- **Coach voice drafting system (2026-06-09).** Generative guide, briefs, corpus, reply stance;
  full site rewrite as the acceptance test.
- **Rename 1–6 (2026-06-08/09).** Full ECXC rebrand: identity sweep, audience broadening, new
  `cairn-ecxc-auth` D1, domain cutover with 301, brand mark, repo/directory rename to `ecxc-ski`.
- **cairn-cms 0.33–0.37 (2026-06-07/09).** Admin isolated, HTTPS forced (#28), CSRF owned by
  cairn (0.35), structured logging + observability (0.37.1).
- **Earlier (2026-06-02/06).** Web-content authoring skills, component layer, six-page refresh.

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–9, 0.10–0.37 | Scaffold through cairn upgrades | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| Rename 1–6 | Full ECXC rebrand through repo rename | ✓ Done |
| Drafting system | Coach voice system + site rewrite | ✓ Done |
| cairn 0.50 crossing | Single-mount admin retrofit, live-proven | ✓ Done |

### Pre-publish checklist (gate before announcing)

- Magic-link login confirmed on ecxc.ski, then old D1 decommission (see Pending).
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `[ASK]`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecxc.ski**. Push to `main` auto-deploys.
