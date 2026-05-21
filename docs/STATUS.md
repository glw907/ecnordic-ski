# ecnordic.ski — Project Status

**Current state:** Pass 4 in progress. Design *language* defined and proven on the About page — a reusable DaisyUI-based component kit (card module, subtle alert card, `.ec-grid` card of parallel titled points, button action), bare Phosphor icons (tile reserved for one focal accent) with a meaning matrix and usage rules, and a meaning-driven warm/cool palette built from the two brand colors. The About-only `.ec-values` list is now the global `.ec-grid` primitive. A full type system is now documented — reasoned scale (size+weight+colour per level), an uppercase-label tracking ramp, the `--color-body-soft` supporting-prose token, a real Alegreya Sans italic face, and a ~1.5× vertical-rhythm scale; About also gains a staggered entrance. Documented in `docs/design-language.md`. **Training** is now migrated too (`decorateTraining` in `[slug]/+page.svelte`, sharing the `decoratePage` skeleton with About). Resources, volunteers, contact, tags, and post detail not yet migrated.

**Toolchain (2026-05-21):** dependencies modernized — Node 24 (pinned via `.nvmrc` +
`engines`), Vite 8/Rolldown, TypeScript 6, adapter-cloudflare 7, wrangler 4.93, plus
security patches. Calendar migrated to schedule-x v3 Temporal dates. See `docs/architecture.md`
→ *Build Toolchain & Version Notes*.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo creation, ECN config, Claude infrastructure | ✓ Done |
| 2 | Build: 3-segment posts, events pipeline, calendar, static pages, contact, deploy | ✓ Done |
| 3 | Design: Nunito font, crimson/cobalt palette, hero grid, nav, news cards | ✓ Done |
| 4 | Design language + rollout: reusable DaisyUI kit, prove on About, migrate remaining pages | in progress — kit + About + Training done |

---

### Next starter prompt (Pass 4 — rollout)

> **Goal.** Roll the EC Nordic design language out to the remaining content pages:
> resources, volunteers, contact, tag pages, and individual post detail.
> About and Training are the worked examples — match them.
>
> **Read first:** `docs/design-language.md`
> (the kit, the palette, the color=role rule) and `src/routes/[slug]/+page.svelte`
> (`decoratePage` is the shared skeleton; `decorateAbout` / `decorateTraining` show
> how markdown sections map to DaisyUI primitives + Phosphor icons. A new markdown
> page gets its own `decorate<Page>` callback and a `[data-page="<slug>"]` arm on the
> shared module CSS selectors). The icon primitives live globally in `src/app.css`.
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

### Task 12: Deploy — ✓ complete

Live at **https://ecnordic.ski**. Domain registered, Turnstile widget + site key
wired (`src/lib/components/ContactForm.svelte`), GitHub Actions secrets and Worker
secrets (`TURNSTILE_SECRET_KEY`, `CONTACT_EMAIL`) all set. Pushes to `main` deploy
via GitHub Actions.
