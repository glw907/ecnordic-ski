# ecnordic.ski Backlog

## Known Issues

- `svelte.config.js` has all prerender options set to `'warn'` (handleUnseenRoutes, handleHttpError, handleMissingId) to allow building with no content. Flip back to `'fail'` once the site has real content to catch broken links in CI.

## Future Work

- [ ] Full visual design pass (Pass 3 — run /frontend-design)
- [ ] Real Turnstile site key after domain is live
- [ ] Sveltia CMS config for web-based editing by coaches/volunteers
- [ ] Replace @schedule-x with custom Svelte calendar component when migrating to cairn-cms
- [ ] Replace placeholder page content (about, talkeetna-camp, resources)
