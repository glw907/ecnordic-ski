# BACKLOG

> Project issue tracker. Managed by `/log-issue`.

## Medium

- [ ] **#6** Replace placeholder page content (about, resources) `#improvement` `#ecnordic` *(2026-05-20)*
- [ ] **#1** Flip prerender options back to `'fail'` once content is real `#improvement` `#ecnordic` *(2026-05-20)*
  `svelte.config.js` sets handleUnseenRoutes, handleHttpError, and handleMissingId to `'warn'` to allow building with no content. Flip to `'fail'` so CI catches broken links.

## Low

- [ ] **#9** Remove unused font files from `static/fonts/` `#improvement` `#ecnordic` *(2026-05-20)*
  ~1.6 MB across ~20 woff2 files (Cormorant, ETBook, iA Quattro, Iosevka, Karla, Lora, Monaspace, Spectral) — leftovers from an earlier font exploration, referenced by no `@font-face`. Only Alegreya Sans, Nunito (Google), and iA Writer Mono S are loaded. They ship to the Worker as static assets for no reason. Delete; keep only the declared families.
- [ ] **#8** Replace regex-based HTML rewriting with a remark plugin `#improvement` `#ecnordic` *(2026-05-20)*
  `decorateAbout`/`wrapSections` in `src/routes/[slug]/+page.svelte` mutate rendered HTML with regexes (`<li>`/`<ul>` class injection, `<p>` panel splitting, `class="download-link"` surgery), which silently no-op if remark's output changes. A remark plugin operates on the AST and is far less fragile.
- [ ] **#7** Move the static-page HTML transform into the load/build layer `#improvement` `#ecnordic` *(2026-05-20)*
  `decorateAbout`/`wrapSections` in `src/routes/[slug]/+page.svelte` are pure functions of `page.html` (which never changes after load), so they can run once in `getPage()` (`src/lib/pages.ts`) or `+page.server.ts` and be serialized as data instead of recomputing on every client render.
- [ ] **#5** Replace @schedule-x with a custom Svelte calendar component `#improvement` `#ecnordic` *(2026-05-20)*
  Do this when migrating to cairn-cms.
- [ ] **#4** Add Sveltia CMS config for web-based editing by volunteers `#feature` `#ecnordic` *(2026-05-20)*

## Done

- [x] **#3** Set real Turnstile site key after domain is live `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-20)*
- [x] **#2** Full visual design pass (Pass 3: Nunito font, crimson/cobalt palette, hero grid, nav, news cards) `#improvement` `#ecnordic` *(2026-05-20)*
