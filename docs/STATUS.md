# ecxc.ski: Project Status

## Current state (2026-06-11)

The ECXC rebrand is complete (six passes; spec in `docs/superpowers/archive/specs/`), the engine
is on cairn `^0.37.1` with Workers Logs observability, and all five pages are rewritten through
the new coach voice drafting system.

**Visual rebrand, shipped 2026-06-11.** New palette (fireweed pink for actions, mid spruce for
ambient accents, black spruce ground; header and footer are spruce bands) and a new tile mark
(Nunito letters knocked out of four rounded tiles, with favicon and crest cuts). Selection
record: `docs/design/brand-exploration.html`; generator: `docs/design/build-mark.py`; binding
usage rule: `.claude/rules/design-system.md`. Geoff's first CMS edits (about, volunteers)
landed 2026-06-11, so the corpus harvest in the starter prompt below is now actionable.

**Coach voice drafting system, done 2026-06-09.** Generative guide (rules, budgets, recipes),
briefs per page, corpus + harvest loop, reply-stance drafting with a humanize pass; the archived
spec's amendment records the five-failure post-mortem that produced the stance correction. All
five pages are live; Geoff final-edits from here.

**Pending: domain reputation blocks magic-link delivery to the owner.** Fastmail rejects at the
DATA stage (`451 ... ecxc.ski is blacklisted`, per the `emailSendingAdaptive` GraphQL log; the
deploy token has zone Analytics:Read). New-domain blocklisting, ages out on its own; Gmail
already delivers. Re-request a login link in a day or two, confirm sign-in, then delete the old
`cairn-ecnordic-auth` D1.

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

### Pre-publish checklist (gate before announcing)

- Magic-link login confirmed on ecxc.ski, then old D1 decommission (see Pending).
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `[ASK]`).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecxc.ski**. Push to `main` auto-deploys.
