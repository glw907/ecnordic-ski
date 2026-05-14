# ecnordic.ski — Project Status

**Current state:** Pass 3 complete. Visual design shipped — Nunito, crimson/cobalt palette, hero grid, schedule card, news cards.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo creation, ECN config, Claude infrastructure | ✓ Done |
| 2 | Build: 3-segment posts, events pipeline, calendar, static pages, contact, deploy | ✓ Done |
| 3 | Design: Nunito font, crimson/cobalt palette, hero grid, nav, news cards | ✓ Done |
| 4 | Polish: remaining page styles (about, resources, contact, tags, post detail) | planned |

---

### Next starter prompt (Pass 4)

> **Goal.** Apply consistent visual polish to all remaining pages: about, resources,
> talkeetna-camp, contact, tag pages, and individual post detail view.
>
> **Scope.** In: page-level styles, post body typography, contact form styling,
> tag page layout, mobile responsiveness audit. Out: new features, new content,
> infrastructure changes.
>
> **Settled (do not re-brainstorm):** Design system is locked — Nunito display,
> Alegreya Sans body, crimson primary `oklch(54% 0.26 18)`, cobalt secondary
> `oklch(48% 0.20 260)`, `ecn`/`ecn-dark` themes. Section labels: 0.8rem, weight
> 700, uppercase, 0.1em tracking, `var(--color-muted)`. Cards use border-radius 10–12px,
> subtle box-shadow, `var(--color-border-subtle)` borders.
>
> **Still open — brainstorm these:** None. Extend the established system to unfinished pages.
>
> **Approach.** Invoke cairn-pass to start. Standard pass-end checklist applies.

---

### Task 12: Deploy (manual steps required)

Before going live — complete these one-time manual steps if not yet done:

1. Register `ecnordic.ski` via Cloudflare Registrar
2. Register Turnstile widget for ecnordic.ski → update site key in `src/routes/contact/+page.svelte`
3. Add GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
4. Set Worker secrets: `npx wrangler secret put TURNSTILE_SECRET_KEY` and `npx wrangler secret put CONTACT_EMAIL`
5. `git push` → GitHub Actions → verify live at ecnordic.ski
