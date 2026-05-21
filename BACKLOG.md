# ecnordic.ski Backlog

## Known Issues

- `svelte.config.js` has all prerender options set to `'warn'` (handleUnseenRoutes, handleHttpError, handleMissingId) to allow building with no content. Flip back to `'fail'` once the site has real content to catch broken links in CI.

## Future Work

- [ ] Full visual design pass (Pass 3 — run /frontend-design)
- [ ] Real Turnstile site key after domain is live
- [ ] Sveltia CMS config for web-based editing by coaches/volunteers
- [ ] Replace @schedule-x with custom Svelte calendar component when migrating to cairn-cms
- [ ] Replace placeholder page content (about, talkeetna-camp, resources)
- [ ] Move the static-page HTML transform out of the client-side `$derived` into the load/build layer. `decorateAbout`/`wrapSections` in `src/routes/[slug]/+page.svelte` are pure functions of `page.html` (which never changes after load), so they can run once in `getPage()` (`src/lib/pages.ts`) or `+page.server.ts` and be serialized as data instead of recomputing on every client render.
- [ ] Replace the regex-based HTML rewriting in `src/routes/[slug]/+page.svelte` with a remark plugin. The current approach mutates rendered HTML with regexes (`<li>`/`<ul>` class injection, `<p>` panel splitting, `class="download-link"` surgery), which silently no-ops if remark's output changes. A remark plugin operates on the AST and is far less fragile.
