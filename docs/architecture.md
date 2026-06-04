# ecnordic.ski Architecture

System architecture for the East Community Nordic site. Design decisions (color,
type, the kit primitives) live in `docs/design-language.md`; current build state and
the pass log live in `docs/STATUS.md`. This file covers the stack, routing, content
pipeline, and deployment.

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | SvelteKit + TypeScript (Svelte 5 runes) | First-class Cloudflare support |
| Styling | Tailwind CSS v4 + DaisyUI v5 | CSS-first config, no `tailwind.config.js` |
| Markdown | cairn-cms `createRenderer` (remark + rehype) | Inline container directives → kit HTML, engine sanitize floor (see below) |
| Search | Pagefind | Post-build static index, zero runtime JS cost |
| Adapter | `@sveltejs/adapter-cloudflare` v7 | Workers output, form actions work natively |
| Contact form | SvelteKit remote function (`form()`) + Cloudflare Email Workers (`send_email`) | Type-safe boundary, declarative validation; experimental (Pass 9) |
| Spam protection | Cloudflare Turnstile | Server-verified on form submit |
| Fonts | Alegreya Sans + iA Writer Mono S (woff2, self-hosted) | Set in `src/app.css` `@font-face` + `@theme` |

There is **no mdsvex**: content `.md` is read as raw strings and rendered by the
custom pipeline, not compiled as Svelte components. There is **no calendar**; that
feature (the `/calendar` route, `events` content, `@schedule-x/*`) was removed.
Scheduling lives in CrewLAB and the site has a `/crewlab` content page instead.

---

## Routing

| Route | Source | Notes |
|---|---|---|
| `/` | `+page.svelte` | Featured (most recent) post in full, then a recent-posts list |
| `/:year/:month/:slug` | `[...path]/` | Post detail, resolved through the content layer |
| `/<slug>` | `[...path]/` | Static content page (about, training, volunteers, crewlab, resources) |
| `/contact` | `contact/` | Contact form (the only non-prerendered route) |
| `/waiver` | `waiver/` | Static Svelte page |
| `/tags`, `/tags/:tag` | `tags/`, `tags/[tag]/` | Tag index + per-tag listing |
| `/feed.xml`, `/feed.json` | `feed.xml/`, `feed.json/` | RSS 2.0 + JSON Feed 1.1, built by the engine |
| `/sitemap.xml`, `/robots.txt` | `sitemap.xml/`, `robots.txt/` | Engine-built sitemap and robots |

Nav links live in `src/lib/components/Nav.svelte`.

**Post and page URLs** come from the cairn-cms content layer, not a route folder. One
catch-all `[...path]` route resolves an incoming path to a post or page through the engine's
`createPublicRoutes`, which reads the `site` index built in `src/lib/content.ts`. The engine
computes each entry's permalink from the YAML URL policy in `src/lib/site.config.yaml`: posts
carry a `month` date prefix, so `2026-05-welcome.md` (frontmatter `date: 2026-05-14`) serves
at `/2026/05/welcome`; pages serve at `/<slug>`. Canonical URLs carry no trailing slash. The
`url-inventory` test pins this set against the old filename-derived URLs, so neither the Pass 1b
cutover nor the 0.21 migration moved a live URL. SvelteKit ranks the explicit routes above the
catch-all, so `/tags`, `/contact`, the feeds, and the rest keep their own routes; the catch-all
serves only posts and pages.

---

## Content Pipeline

### Content layer: `src/lib/content.ts`

As of the cairn-cms 0.21 migration, the content layer is the engine's idiomatic surface, not
a hand-rolled set of helpers. It globs each concept's markdown with `import.meta.glob` (`?raw`,
`eager: true`), because Cloudflare Workers has no filesystem and all markdown ships as string
constants, then hands the raw globs to `createSiteIndexes(cairn, siteConfig, { posts, pages })`.
That returns `{ site, posts, pages }`: one typed index per concept plus a `site` resolver that
maps a permalink to its entry across both concepts. The module exports `site`, `ORIGIN`, and
`SITE_DESCRIPTION`. The same `cairn`, `siteConfig`, `postsRaw`, and `pagesRaw` bindings also feed
the manifest backstop (see Content graph below). `createSiteIndexes` hard-fails on a missing glob
key for a declared concept, so every concept the adapter declares must be globbed here.

The catch-all reads `site` through `createPublicRoutes`; the home, tags-index, and tag routes read
`site.concept('posts')` (`.all()`, `.allTags()`, `.byTag()`, `.byId()`); the feeds map the same
concept index and thread `buildLinkResolver(site)`; the sitemap and robots use the engine response
helpers. The home and archive lists show the authored `description`, which the engine `ContentSummary`
does not carry (it carries a derived `excerpt`), so a small site-local mapper re-reads
`posts.byId(id).frontmatter.description`; the schema makes that a required `string`, so the read needs
no cast. `/tags/[tag]/` stays explicit and fully prerendered: its `entries()` enumerates every tag,
and a tag with no posts 404s.

### Catch-all presentation: `src/routes/[...path]/`

`+page.server.ts` builds `createPublicRoutes({ site, render, origin, siteName, description, feeds })`
once at module level and exports `entries` and `load` from it. `entryLoad({ url })` resolves the path
through the `site` index, renders the body (resolving any `cairn:` link), and builds the SEO model
internally, so the old inline `buildSeoMeta` is gone. `EntryData` carries no concept, so the load
re-derives it as `data.entry.date ? 'posts' : 'pages'` (posts are the only dated concept). `+page.svelte`
renders `<CairnHead seo={data.seo} />` for the head and branches on the derived concept: the post branch
reproduces the post markup, the page branch the page markup with `data-page={data.slug}`. The post and
page markup and the page route's scoped `<style>` block carried over verbatim, so rendering and the
animation cascade did not change.

### Frontmatter validation: the schema contract

As of 0.21, validation lives in the adapter's schema, not in a hand-written validator. Each concept in
`src/lib/cairn.config.ts` carries one `schema: defineFields([...])` (wrapped by `defineAdapter`), which
is the single source of truth for the editor form, the validator, and the inferred frontmatter type. The
posts schema declares `title` (required), `date` (required), `description` (required), `tags` (with the
controlled `POST_TAGS` as `options`), and `draft` (boolean); pages declare `title` (required). The old
`validatePostFrontmatter`/`validatePageFrontmatter` functions are deleted.

This validate-once contract is thinner than the old validators: it enforces required-and-coerce on the
declared fields and omits empty optional values, but it does not check a real calendar date, a date
format, the closed `tags` vocabulary as a hard constraint (the `options` drive the editor pick list, not
a commit-time rejection), or an at-least-one-tag minimum. Those four dropped rules are recorded in the DX
findings (`docs/cairn-dx-findings.md`) and the cairn-cms backlog; restoring them is an engine change
(declarative field options), not a site-local re-add. The validator runs on the admin **save** path. The
delivery read path parses frontmatter but does not re-validate, so a hand-committed post with a missing
declared field is not a build-time failure (BACKLOG #16); the `url-inventory` test still catches a date
that disagrees with its filename.

### Content graph: the manifest and `cairn:` links

A committed manifest at `src/content/.cairn/index.json` is a build-verified projection of the corpus: one
entry per post and page with its id, concept, title, permalink, draft flag, and outbound `cairn:` links.
`scripts/build-manifest.mjs` (run as `npm run cairn:manifest`) regenerates it. `src/lib/content.ts` calls
`verifyManifest(buildSiteManifest(...), manifestRaw)` at module load, so a build fails if the committed
manifest drifted from the corpus (a raw-git content edit cannot ship a stale graph).

Internal links between content use the `cairn:<concept>/<id>` token rather than a hardcoded path, so a link
survives a future slug change. The welcome post links to the CrewLAB page as `cairn:pages/crewlab`, which
the render resolver rewrites to the live `/crewlab` permalink on the page and to the absolute URL in the
feeds. The token resolves content concepts only (posts and pages), not `+page.svelte` routes, so the
post's `/waiver` link stays an absolute path (the waiver is a hand-built route, not a content page). A
dangling token throws `cairn link target not found` at prerender. The build does not currently go red on
it, because `svelte.config.js` carries `prerender.handleHttpError: 'warn'` (inherited from the scaffold),
which downgrades the prerender 500 to a warning; the broken link still never ships (the page 500s), but the
build exits 0. Tightening this to a fatal build error is a recorded follow-up (DX finding 16, BACKLOG).

The admin edit route (`src/routes/admin/(app)/[concept]/[id]/+page.server.ts`) registers `save`, `delete`,
and `rename` actions off the engine runtime, and `editLoad` ships the editor link picker's targets from the
manifest.

### Directive render pipeline: `src/lib/markdown/`

As of 0.21, the render pipeline is the engine's `createRenderer`, not a site-owned unified
processor. `render.ts` calls `createRenderer(ecnordicRegistry, { stagger: true, sanitizeSchema:
ecSanitizeSchema })` once and re-exports its `renderMarkdown`; `markdownToHtml(md, opts)` in
`utils.ts` is a thin delegate that threads the optional `resolve` (the `cairn:` link resolver)
through. The seven directive components (`card/grid/alert/cta/split/panel/passage`) live in
`components.ts` as `ComponentDef`s with the `build(ctx)` slot model: each reads `ctx.slot('title')`,
`ctx.slot('body')`, and declared `ctx.attributes` (an `icon` attribute of `type: 'icon'`, a `role`
select), and arranges kit markup with `hastscript`. A local `head(ctx)` helper rebuilds the
icon-plus-heading row the removed `splitHead` used to return. A caution alert with no explicit icon
defaults to the `warning` glyph inside `buildAlert`. The icon path data is the adapter's
`icons: ICON_PATHS` (`icons.ts`), an `IconSet`.

**Sanitize: one engine floor, extended.** The engine applies `rehype-sanitize` by default inside
`createRenderer`, after `rehype-raw` and before the component dispatch, so the built directive markup
(`<section>`, `<svg>`, `<path>`, `role="alert"`, `data-rise`) is injected by trusted build code after
the floor and never needs an allowlist entry. The site's old post-render second sanitize pass was pure
duplication and is gone; `sanitize.ts` now exports `ecSanitizeSchema(defaults)`, a 13-line extend-only
hook that adds only what authored raw HTML uses (an `aria-label` on `*`, for the page-toc `<nav>`). The
directive vocabulary is documented in `docs/design-language.md`; the pipeline is pinned by tests in
`src/tests/markdown/`, including the characterization snapshots that render each content file.

---

## Kit as CSS contract (markdown pages + Svelte component pages)

The design-language kit is two layers, and only one is markdown-coupled: **style**
lives once in `src/app.css` (`@theme` tokens + global classes like `.page-title`,
`.post-body`, `.post-tags`, `.back-link`), and **markup** is built by whichever tool
fits the surface. Markdown prose gets kit markup from `rehype-ec-primitives.ts`
(`{@html}`, prerendered); the interactive/data-driven shells (contact form, tag cloud,
archive list, post chrome) are Svelte components. The two markup builders are not unified: Svelte can't mount inside `{@html}`, and
recompiling markdown→Svelte would add client JS for no gain. **The class-name contract
is the shared interface**; Svelte pages consume the global CSS directly rather than
re-implementing primitives as `<Card>`/etc. components (that path was rejected, because
it would create two definitions of one primitive and invite drift).

**Shared entrance cascade.** The per-module rise delay is one function, `riseStyle(idx)`
in `src/lib/motion.ts` (`0.16 + idx*0.04s`, two decimals), imported by both the rehype
builder and every component page. Its keyframes (`page-rise`, `module-rise`) live
globally in `app.css`. Each page scopes its own `.X` / `.X-module` animation rules and
its own `prefers-reduced-motion` reset (no global animation-disabling rule, to avoid
reaching into unrelated components); the duplication of that small per-surface block is
intentional: only the scope selector differs. The catch-all `[...path]` page carries the
private copies of the keyframes it inherited verbatim from the old `[slug]` route (deferred
dedup, `BACKLOG.md`).

---

## Contact Form

`/contact` is the only non-prerendered route. As of Pass 9 the form is a **SvelteKit
remote function** (`form()`), not a `+page.server.ts` action. See the verdict below.

`src/lib/contact.remote.ts` exports `sendMessage = form(schema, handler)`. The Valibot
schema validates `name`/`email`/`message` (plus `cf-turnstile-response`, injected by the
widget); on a schema miss the handler never runs and `fields.allIssues()` carries the
messages back. The handler uses `getRequestEvent()` for `platform.env` +
`getClientAddress()`, then: validate Turnstile → build a message with `mimetext` → send
via the Email Workers `send_email` binding to `contact@ecnordic.ski`. Turnstile/mail
failures surface inline via `invalid(...)` (a form-level issue) rather than throwing to
`+error.svelte`. `verifyTurnstile` only runs when `platform.env.TURNSTILE_SECRET_KEY` is
present, so dev skips it gracefully. Secrets: `TURNSTILE_SECRET_KEY`, `CONTACT_EMAIL`.

`ContactForm.svelte` spreads `{...sendMessage}` and reads `fields.*.as(...)`, `pending`,
and `result`, with no hand-written `use:enhance` or `FormState` interface. `prerender = false`
lives in `src/routes/contact/+page.ts` and is **load-bearing**: a prerendered static page
405s on the no-JS POST fallback.

### Remote-functions verdict (Pass 9 spike): **DEFER (adopt later)**

The spike works end-to-end on adapter-cloudflare: build generates the
`/_app/remote/<hash>/sendMessage` endpoint, CSRF origin-checks it, schema validation +
inline issues + value repopulation work, and **both** the JS-enhanced path (single-flight
result) and the no-JS full-reload fallback succeed (verified locally via `wrangler dev`).
The ergonomics are a real win over the action: one source of truth for field
types/validation, declarative Valibot schema replacing hand-rolled checks, and built-in
progressive enhancement.

**Why DEFER, not ADOPT site-wide:** the feature requires `kit.experimental.remoteFunctions`
and is officially "subject to change without notice" (no stable date as of 2026-05). The
core team frames it as *additive*; `load`/form actions are not deprecated. Keep the
contact form on remote functions as the live proving ground (low blast radius, degrades
cleanly), but do **not** migrate other surfaces until the API stabilizes. Re-evaluate when
SvelteKit ships the feature stable (tracked: BACKLOG #13).

---

## Search

`npx pagefind --site .svelte-kit/cloudflare` runs post-build, generating a static index
under `.svelte-kit/cloudflare/pagefind/`. `SearchModal.svelte` wraps the Pagefind JS API.
The bundle does not exist at compile time, so it is imported dynamically and kept external
(listed in `vite.config.ts`); a local `PagefindUIModule` interface types the import without
`@ts-ignore`.

---

## Theme

Cookie-based (`theme` cookie). `hooks.server.ts` injects `data-theme` into the SSR HTML;
an inline script in `app.html` resolves cookie → localStorage → `prefers-color-scheme`
so there's no flash. The nav toggle writes both cookie and localStorage. DaisyUI is
configured with `silk --default` and `dim --prefersdark`. See `docs/design-language.md`.

---

## Deployment

Push to `main` → GitHub Actions (`.github/workflows`) → `npm run build` + `npx pagefind
--site .svelte-kit/cloudflare` + `npx wrangler deploy` → live in ~2 min.

`wrangler.toml` `main` and `[assets] directory` both point at `.svelte-kit/cloudflare/`
(adapter-cloudflare v7 output path); Pagefind indexes the prerendered HTML there.
GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### Build toolchain notes

- **Node 24** is the build runtime (`.nvmrc`, `engines.node >=22`, CI). wrangler ≥4.93
  requires Node ≥22.
- **Vite 8 uses the Rolldown bundler**, which resolves absolute dynamic imports eagerly.
  Pagefind's UI bundle (`/pagefind/pagefind-ui.js`) is generated *after* the build, so it
  must stay in `build.rollupOptions.external` in `vite.config.ts` (with `cloudflare:email`)
  or the build fails with `UNRESOLVED_IMPORT`.
