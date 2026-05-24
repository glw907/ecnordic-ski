# ecnordic.ski — Project Status

**Current state:** Design language proven on About, Training, CrewLAB. Calendar
feature removed, replaced by `/crewlab` (`decorateCrewlab` in `[slug]/+page.svelte`).
Type is now **one sitewide standard** — body 0.92rem on `.post-body` (`app.css`),
`.card-body` inherits it, lede 1.0rem and grid cells 0.85rem the only deviations.
A **content style guard** (`.claude/hooks/content-style-guard.py`, PreToolUse)
blocks AI-writing tells in `src/content/**/*.md`. `docs/design-language.md` adds
*Choosing a primitive* (prose is the default) + candidate primitives. Resources,
volunteers, contact, tags, post detail **not yet migrated — deferred to after
Pass 5** so new pages adopt directives from the start.

**Open follow-ups (not blocking):** CrewLAB `[PLACEHOLDER]` (what EC Nordic
collects via CrewLAB); cross-page conflict (CrewLAB routes waivers + payment
through the app vs. About / Training / waiver page's paper-waiver + free model);
posts now 0.92rem (tokenize `--text-body` if they want larger). Nothing committed yet.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo, config, Claude infra | ✓ Done |
| 2 | Build: posts, events, calendar, pages, contact, deploy | ✓ Done |
| 3 | Design: font, palette, hero grid, nav | ✓ Done |
| 4 | Design language: kit, About/Training/CrewLAB, sitewide type, content guard | ✓ Core (rollout deferred) |
| 5 | Inline directives: explicit, self-documenting content styling | Next |

---

### Next starter prompt (Pass 5 — inline directives)

> **Goal.** Replace the implicit slug→primitive mapping in `decorate<Page>()`
> with explicit inline directives in the markdown, so each page's styling is
> visible in the file and robust to heading renames.
>
> **Read first:** `[slug]/+page.svelte` (`decorateAbout/Training/Crewlab` + `ICON`
> map), the `markdownToHtml` pipeline (`src/lib/utils.ts`, `pages.ts`), and
> `docs/design-language.md` (*Choosing a primitive*).
>
> **Scope.** In: a remark container-directive mechanism (`:::card`, `:::grid`,
> `:::alert`, `:::cta`); render from directives not slugs; migrate About /
> Training / CrewLAB; unmarked = prose default; document the vocabulary. Out:
> visual changes (this refactors *how* styling is selected, not the look), new
> content, the deferred remaining-page rollout.
>
> **Settled:** Inline container directives (not frontmatter, not slugs). Unmarked
> = prose. Primitives + type scale unchanged — pages must render identically
> (regression-check via screenshots).
>
> **Still open — brainstorm:** directive vocabulary + param passing (role colour,
> icon — e.g. `:::alert{type=caution}`); which remark plugin + how it slots into
> `markdownToHtml`; icons as directive attrs vs slug-mapped; keep `decorate*` or unify.
>
> **Approach.** Invoke cairn-pass to start. Standard pass-end checklist applies.
> Regression-verify with headless screenshots (rebuild first;
> `--force-prefers-reduced-motion`).

**Deploy:** Live at **https://ecnordic.ski** — push to `main` → GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
