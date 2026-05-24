# BACKLOG

> Project issue tracker. Managed by `/log-issue`.

## Medium

- [ ] **#6** Replace placeholder page content (about, resources) `#improvement` `#ecnordic` *(2026-05-20)*
- [ ] **#1** Flip prerender options back to `'fail'` once content is real `#improvement` `#ecnordic` *(2026-05-20)*
  `svelte.config.js` sets handleUnseenRoutes, handleHttpError, and handleMissingId to `'warn'` to allow building with no content. Flip to `'fail'` so CI catches broken links.

## Low

- [ ] **#11** Rename the welcome post file to drop the day `#improvement` `#ecnordic` *(2026-05-24)*
  `src/content/posts/2026-05-14-welcome.md` resolves to `/2026/05/14-welcome/` — the post route is `[year]/[month]/[slug]`, so the day folds into the slug. The convention is `YYYY-MM-slug.md`. Renaming changes a (likely-unindexed) live URL; do it deliberately. CLAUDE.md and `docs/content-guide.md` also disagree on the filename convention (`YYYY-MM-slug` vs `YYYY-MM-DD-slug`) — reconcile them.
- [ ] **#10** Sveltia CMS config points at the wrong repo `#bug` `#ecnordic` *(2026-05-24)*
  `static/admin/config.yml` has `backend.repo: glw907/907-life` — a leftover from the template project, so the admin surface targets the wrong GitHub repo. Either fix the repo (and finish wiring CMS, see #4) or remove `static/admin/`. Noted in `docs/architecture.md` "Known cruft".
- [ ] **#9** Remove unused font files from `static/fonts/` `#improvement` `#ecnordic` *(2026-05-20)*
  ~1.6 MB across ~20 woff2 files (Cormorant, ETBook, iA Quattro, Iosevka, Karla, Lora, Monaspace, Spectral) — leftovers from an earlier font exploration, referenced by no `@font-face`. Only Alegreya Sans, Nunito (Google), and iA Writer Mono S are loaded. They ship to the Worker as static assets for no reason. Delete; keep only the declared families.
- [ ] **#5** Replace @schedule-x with a custom Svelte calendar component `#improvement` `#ecnordic` *(2026-05-20)*
  Do this when migrating to cairn-cms.
- [ ] **#4** Add Sveltia CMS config for web-based editing by volunteers `#feature` `#ecnordic` *(2026-05-20)*

## Done

- [x] **#8** Replace regex-based HTML rewriting with a remark plugin `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-24)*
  Resolved by the Pass 5/6 directive pipeline: the `decorateAbout`/`wrapSections` regex surgery is deleted; rendering is now a remark/rehype AST pipeline (`src/lib/markdown/`).
- [x] **#7** Move the static-page HTML transform into the load/build layer `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-24)*
  Resolved by the Pass 5/6 directive pipeline: the transform runs at build inside `renderMarkdown` (called from `getPage`), not on client render. The old per-render `decorate*` functions are gone.
- [x] **#3** Set real Turnstile site key after domain is live `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-20)*
- [x] **#2** Full visual design pass (Pass 3: Nunito font, crimson/cobalt palette, hero grid, nav, news cards) `#improvement` `#ecnordic` *(2026-05-20)*
