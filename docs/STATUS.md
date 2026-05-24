# ecnordic.ski — Project Status

**Current state:** The directive render pipeline is **live**. `markdownToHtml`
(`src/lib/utils.ts`) delegates to `renderMarkdown` (`src/lib/markdown/render.ts`:
remark-parse → gfm → directive → mark step → remark-rehype → rehype-raw →
restructure → rehype-slug → stringify); the old `decorate*`/`wrapSections`/
`boldParasToGrid` machinery is deleted. All five static pages (About, Training,
CrewLAB, resources, volunteers) carry inline container directives
(`card/grid/alert/cta/split+panel/passage`). About/Training/CrewLAB verified
pixel-identical (headless AE=0) and HTML-identical modulo dropped `data-section` +
slug `id`s; resources/volunteers moved onto the kit. 18 tests in
`src/tests/markdown/`. The mark step restores accidental prose colons (`4:00`) that
micromark would parse as directives. See `docs/architecture.md` + `docs/design-language.md`.

The **content style guard** (`.claude/hooks/content-style-guard.py`) blocks AI tells
in `src/content/**/*.md`. Contact, tags, and post detail are Svelte components, not
markdown pages — their kit rollout is still deferred.

**Architecture cleanup (2026-05-24).** Three improvements outside the pass sequence:
(1) **mdsvex removed** — it was configured but unused (content is read `?raw` and
rendered by the directive pipeline), so the dep + preprocessor are gone, one markdown
system remains. (2) **Frontmatter is now a build gate** — `src/lib/content-schema.ts`
(`validatePostFrontmatter`/`validatePageFrontmatter`, tested) throws on malformed
content; tags are checked against `POST_TAGS` in `config.ts`. (3) **Static pages
prerender explicitly** — `[slug]` declares `prerender = true` + `entries()` from
`getPageSlugs()` instead of relying on link-crawl. `docs/architecture.md` was rewritten
to match reality (it had described the 907.life template). Backlog #7/#8 closed
(resolved by the directive pipeline); #10 (CMS config wrong repo) and #11 (welcome post
URL carries a day) logged.

**Open follow-ups (not blocking):** CrewLAB / Training / volunteers `[PLACEHOLDER]`
content (real specifics from EC Nordic); cross-page conflict (CrewLAB routes waivers
+ payment through the app vs. About / Training / waiver page's paper-waiver + free
model); posts at 0.92rem (tokenize `--text-body` if they want larger).

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1 | Scaffold: repo, config, Claude infra | ✓ Done |
| 2 | Build: posts, events, calendar, pages, contact, deploy | ✓ Done |
| 3 | Design: font, palette, hero grid, nav | ✓ Done |
| 4 | Design language: kit, About/Training/CrewLAB, sitewide type, content guard | ✓ Core (rollout deferred) |
| 5 | Directive render pipeline: remark/rehype, all primitives, unit-tested (no site change) | ✓ Done |
| 6 | Cut over + migrate all five pages to directives; delete `decorate*` | ✓ Done |
| 7 | Kit rollout to Svelte components (contact / tags / post detail) | Next |

---

### Next starter prompt (Pass 7 — Svelte-component kit rollout)

> **Goal.** Bring the design-language kit to the parts of the site that are Svelte
> components rather than markdown pages: the contact form/page, the tag pages, and
> the post-detail layout — the three surfaces deferred since Pass 4.
>
> **Scope.** In: applying kit primitives/tokens to those components. Out: new content;
> re-touching the five directive pages (done + frozen).
>
> **Still open — brainstorm these:** these are Svelte components, not markdown, so the
> directive vocabulary doesn't apply directly — decide how the kit's look is expressed
> in `.svelte` (shared components? CSS classes? a few Svelte equivalents of the
> primitives?). Settle the per-surface treatment before coding.
>
> **Approach.** Invoke cairn-pass to start. Brainstorm the component approach, then
> write a plan. Standard pass-end checklist applies.

**Deploy:** Live at **https://ecnordic.ski** — push to `main` → GitHub Actions (build + pagefind + wrangler deploy). Secrets set.
