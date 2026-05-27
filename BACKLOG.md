# BACKLOG

> Project issue tracker. Managed by `/log-issue`.

## Medium

- [ ] **#12** Tokenize the waiver page's hardcoded `--w-*` color palette `#improvement` `#ecnordic` *(2026-05-24)*
  `src/routes/waiver/+page.svelte` defines a self-contained print/paper palette in raw hex + `rgba()` (`--w-red`, `--w-blue`, `--w-ink`, etc.), which violates the design system (`rules/design-system.md`: oklch + `--color-*` tokens only). Surfaced by the Pass 7 Tailwind/DaisyUI audit. Deferred from Pass 7 because faithfully porting sRGB hex to `oklch()` shifts rendered pixels, and the pass's contract was zero visual change. Do it as a deliberate, visually-reviewed migration (adopt site tokens, or keep a distinct waiver palette expressed as oklch `@theme` tokens).
- [ ] **#6** Replace placeholder page content (about, resources) `#improvement` `#ecnordic` *(2026-05-20)*
- [ ] **#1** Flip prerender options back to `'fail'` once content is real `#improvement` `#ecnordic` *(2026-05-20)*
  `svelte.config.js` sets handleUnseenRoutes, handleHttpError, and handleMissingId to `'warn'` to allow building with no content. Flip to `'fail'` so CI catches broken links.

## Low

- [ ] **#14** Dedup `[slug]` cascade keyframes against the global ones `#cleanup` `#ecnordic` *(2026-05-24)*
  `page-rise`/`module-rise` now live globally in `app.css` (Pass 8). `src/routes/[slug]/+page.svelte` still defines its own scoped copies; remove them and reference the globals when the frozen directive pages are next unfrozen. Zero-output-change refactor (CSS-only).
- [ ] **#5** Replace @schedule-x with a custom Svelte calendar component `#improvement` `#ecnordic` *(2026-05-20)*
  Do this when migrating to cairn-cms.
## Done

- [x] **#4** Add Sveltia CMS config for web-based editing by volunteers `#feature` `#ecnordic` *(2026-05-20 → 2026-05-25)*
  Superseded by cairn-cms. Sveltia was never wired in; the dead `static/admin/` was removed
  in cairn Pass A (it shadowed the new `/admin` route as a static asset), and the magic-link
  cairn admin (passes A–C) is the web-editing surface now. Resolved by removal, not wiring.

- [x] **#11** Rename the welcome post file to drop the day `#improvement` `#ecnordic` *(2026-05-24 → 2026-05-24)*
  Renamed `2026-05-14-welcome.md` → `2026-05-welcome.md` (URL `/2026/05/14-welcome` → `/2026/05/welcome`). Reconciled the filename convention: code (`posts.ts` `parseFilepath`) and CLAUDE.md use `YYYY-MM-slug`; fixed the contradicting `YYYY-MM-DD-slug` in `.claude/rules/content.md`.
- [x] **#10** Sveltia CMS config points at the wrong repo `#bug` `#ecnordic` *(2026-05-24 → 2026-05-24)*
  Fixed `backend.repo` → `glw907/ecnordic-ski` and the `slug` template → `{{year}}-{{month}}-{{slug}}` (was the wrong day-bearing form). CMS still unwired; that's #4.
- [x] **#9** Remove unused font files from `static/fonts/` `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-24)*
  Deleted 22 unreferenced woff2 files (Cormorant, ETBook, iA Quattro, Iosevka, Karla, Lora, Monaspace, Spectral, + stray iA Mono italics). Kept only the 6 `@font-face`'d files: AlegreyaSans ×4, iAWriterMonoS Bold/Regular. (Nunito loads from Google.)

- [x] **#13** Remote-functions spike (`form()`) `#feature` `#ecnordic` *(2026-05-24 → 2026-05-24)*
  Pass 9. Converted the contact form to a `form()` remote function (`src/lib/contact.remote.ts`, Valibot schema, Turnstile + Email Workers intact). Verified end-to-end on adapter-cloudflare (JS + no-JS paths) via `wrangler dev`. **Verdict: DEFER.** Works and ergonomically wins, but the API is experimental ("subject to change", no stable date) and additive per the core team. Contact stays the proving ground; don't migrate other surfaces until stable. See `docs/architecture.md`.

- [x] **#8** Replace regex-based HTML rewriting with a remark plugin `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-24)*
  Resolved by the Pass 5/6 directive pipeline: the `decorateAbout`/`wrapSections` regex surgery is deleted; rendering is now a remark/rehype AST pipeline (`src/lib/markdown/`).
- [x] **#7** Move the static-page HTML transform into the load/build layer `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-24)*
  Resolved by the Pass 5/6 directive pipeline: the transform runs at build inside `renderMarkdown` (called from `getPage`), not on client render. The old per-render `decorate*` functions are gone.
- [x] **#3** Set real Turnstile site key after domain is live `#improvement` `#ecnordic` *(2026-05-20 → 2026-05-20)*
- [x] **#2** Full visual design pass (Pass 3: Nunito font, crimson/cobalt palette, hero grid, nav, news cards) `#improvement` `#ecnordic` *(2026-05-20)*
