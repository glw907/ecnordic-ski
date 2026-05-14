# ecnordic.ski — Project Status

**Current state:** Pass 2 complete. All ECN features built; awaiting domain registration and deploy.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo creation, ECN config, Claude infrastructure | ✓ Done |
| 2 | Build: 3-segment posts, events pipeline, calendar, static pages, contact, deploy | ✓ Done |
| 3 | Design: /frontend-design visual treatment | planned |

---

### Next starter prompt (Pass 3)

> **Goal.** Apply full ECN visual design: refine typography, color palette,
> layout, and component polish across all pages.
>
> **Scope.** In: design tokens, component styles, layout, typography, mobile.
> Out: new features, content changes, infrastructure.
>
> **Settled (do not re-brainstorm):** ECN fonts (Alegreya Sans body, iA Writer
> Quattro S display, iA Writer Mono S mono) are in place. Theme names are
> `ecn` / `ecn-dark`. Color tokens use oklch() in the `--color-*` namespace.
>
> **Still open — brainstorm these:** Final color palette (crimson/navy
> proportions), nav visual treatment, homepage layout, calendar page styling.
>
> **Approach.** Invoke cairn-pass to start. Standard pass-end checklist applies.

---

### Task 12: Deploy (manual steps required)

Before Pass 3 — complete these one-time manual steps:

1. Register `ecnordic.ski` via Cloudflare Registrar (or `npx wrangler registrar domains purchase --domain ecnordic.ski`)
2. Register Turnstile widget for ecnordic.ski in Cloudflare dashboard → update site key in `src/routes/contact/+page.svelte`
3. Add GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
4. Set Worker secrets: `npx wrangler secret put TURNSTILE_SECRET_KEY` and `npx wrangler secret put CONTACT_EMAIL`
5. `git push` → GitHub Actions → verify live at ecnordic.ski
