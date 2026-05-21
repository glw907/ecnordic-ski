# ecnordic.ski — Project Status

**Current state:** Pass 4 in progress. Design *language* defined and proven on the About page — a reusable DaisyUI-based component kit (card module, soft warning alert, numbered list, button action), a custom icon-chip primitive, Phosphor icons, and a meaning-driven warm/cool palette built from the two brand colors. Documented in `docs/superpowers/specs/2026-05-21-ecnordic-design-language.md`. Remaining pages not yet migrated.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo creation, ECN config, Claude infrastructure | ✓ Done |
| 2 | Build: 3-segment posts, events pipeline, calendar, static pages, contact, deploy | ✓ Done |
| 3 | Design: Nunito font, crimson/cobalt palette, hero grid, nav, news cards | ✓ Done |
| 4 | Design language + rollout: reusable DaisyUI kit, prove on About, migrate remaining pages | in progress — kit + About done |

---

### Next starter prompt (Pass 4 — rollout)

> **Goal.** Roll the EC Nordic design language out to the remaining content pages:
> training, resources, volunteers, contact, tag pages, and individual post detail.
> About is the worked example — match it.
>
> **Read first:** `docs/superpowers/specs/2026-05-21-ecnordic-design-language.md`
> (the kit, the palette, the color=role rule) and `src/routes/[slug]/+page.svelte`
> (`decorateAbout` shows how markdown sections map to DaisyUI primitives + Phosphor
> icon chips). The icon-chip primitive lives globally in `src/app.css`.
>
> **Scope.** In: apply the kit (card module, alert caution, list values, btn action,
> icon chips) to each page; pick the primitive whose *meaning* fits each section;
> let color follow the role table; mobile + dark-mode check. Out: new features,
> palette changes, new content.
>
> **Settled (do not re-brainstorm):** Design language is locked — DaisyUI-first,
> meaning-driven warm/cool palette from crimson + cobalt, Phosphor icons, no abstract
> motifs (the "ski-track" idea was rejected as illegible). See the spec.
>
> **Approach.** Invoke cairn-pass to start. Standard pass-end checklist applies.
> Verify visually with a headless screenshot (chrome `--headless --screenshot`) —
> the wrangler dev server serves built assets, so rebuild before checking.

---

### Task 12: Deploy (manual steps required)

Before going live — complete these one-time manual steps if not yet done:

1. Register `ecnordic.ski` via Cloudflare Registrar
2. Register Turnstile widget for ecnordic.ski → update site key in `src/routes/contact/+page.svelte`
3. Add GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
4. Set Worker secrets: `npx wrangler secret put TURNSTILE_SECRET_KEY` and `npx wrangler secret put CONTACT_EMAIL`
5. `git push` → GitHub Actions → verify live at ecnordic.ski
