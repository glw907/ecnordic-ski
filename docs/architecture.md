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
| Markdown | remark + rehype, custom unified pipeline | Inline container directives → kit HTML (see below) |
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
| `/:year/:month/:slug/` | `[year]/[month]/[slug]/` | Post detail |
| `/<slug>` | `[slug]/` | Static content page (about, training, volunteers, crewlab, resources) |
| `/contact` | `contact/` | Contact form (the only non-prerendered route) |
| `/waiver` | `waiver/` | Static Svelte page |
| `/tags`, `/tags/:tag` | `tags/`, `tags/[tag]/` | Tag index + per-tag listing |
| `/feed.xml`, `/feed.json` | `feed.xml/`, `feed.json/` | RSS 2.0 + JSON Feed 1.1 |

Nav links live in `src/lib/components/Nav.svelte`.

**Post URLs** derive from the filename. `parseFilepath` splits `posts/<name>.md` on
`-`: first segment → year, second → month, the rest → slug. So the convention is
`YYYY-MM-slug.md` → `/YYYY/MM/slug/`. A filename carrying a day (e.g. `2026-05-14-welcome.md`)
would fold the day into the slug (`/2026/05/14-welcome/`), so name post files without a
day. The Sveltia CMS `slug` template in `static/admin/config.yml` matches this convention.

---

## Content Pipeline

Both posts and pages are bundled at build time via `import.meta.glob` with `?raw` +
`eager: true`. Cloudflare Workers has no filesystem, so all markdown ships as string
constants. Frontmatter is parsed by `gray-matter`; bodies are rendered by the directive
pipeline.

### Frontmatter validation (build gate)

`src/lib/content-schema.ts` validates frontmatter and **throws on the first problem**,
so malformed content fails the build instead of shipping:

- `validatePostFrontmatter` requires `title`, a real `YYYY-MM-DD` `date`, a
  `description`, and at least one `tag` drawn from the controlled vocabulary
  (`POST_TAGS` in `src/lib/config.ts`); `draft` must be boolean if present. Every error
  names the source file.
- `validatePageFrontmatter` requires `title`.

Covered by `src/tests/content-schema.test.ts`.

### Posts: `src/lib/posts.ts`

`getAllPosts` is synchronous and memoized (`_cachedPosts`): rawFiles is eager,
`gray-matter` is sync, the parsed+sorted result is cached so repeated calls within a
build don't re-parse. Only `getPost` is async (the remark pipeline returns a Promise).

**Type split:** `PostSummary` (metadata, from `getAllPosts`) vs `PostDetail` (adds
`html`, from `getPost`). Accessing `.html` on a list result is a type error, not a
runtime undefined.

**Tags:** `getAllTags()` derives counts from `getAllPosts()`; `getPostsByTag(tag)`
filters it; both benefit from the memo. `/tags/[tag]/` is fully prerendered: its
`entries()` enumerates every tag, and a tag with no posts 404s.

### Pages: `src/lib/pages.ts`

`getPage(slug)` reads, validates, and renders one page, memoized in `_cachedPages`.
`getPageSlugs()` lists the bundled page slugs and drives prerendering: `[slug]`
declares `export const prerender = true` and an `entries()` that maps `getPageSlugs()`,
so the static surface is enumerated explicitly rather than discovered by link-crawl.

### Directive render pipeline: `src/lib/markdown/`

`renderMarkdown(content)` in `render.ts` is the site's single renderer; `markdownToHtml`
in `utils.ts` is a thin delegate. The unified processor is built once at module level.

Pipeline order: `remark-parse → remark-gfm → remark-directive → remark-ec-directives
(mark) → remark-rehype(allowDangerousHtml) → rehype-raw → rehype-ec-primitives
(restructure) → rehype-slug → rehype-stringify`. The restructure step runs before
`rehype-slug` so the retagged `.card-title` `<h2>` class serializes ahead of the slug id.

- **`remark-ec-directives.ts`** (mdast) stamps each known container directive
  (`card/grid/alert/cta/split/panel/passage`) with `data-primitive`/`data-icon`/
  `data-role` markers; it builds no structure. A caution alert with no icon defaults to
  the `warning` glyph. Because the vocabulary is container-only (`:::name`), the step
  reconstructs any text/leaf directive (`:name`/`::name`) back to literal text. These
  only arise from accidental prose colons (clock times like `4:00–6:00 PM`) that would
  otherwise collapse to empty `<div>`s.
- **`rehype-ec-primitives.ts`** (hast) rewrites the marked elements into kit markup,
  dispatching on `data-primitive`. Nested directives convert before their parent builds.
  Top-level primitives get a document-order `--rise` stagger; nested ones get none. The
  `data-*` markers are read back through a `strProp(node, name)` accessor that narrows
  hast's `PropertyValue` to `string`, rather than casting at each call site.
- **`icons.ts`** holds the Phosphor path data and `glyph(name)`, returning the inline
  SVG as a real `hastscript` node (no raw-string injection).

The directive vocabulary is documented in `docs/design-language.md`; the pipeline is
pinned by tests in `src/tests/markdown/`.

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
intentional: only the scope selector differs. The frozen `[slug]` page keeps its older
private copies of the keyframes (deferred dedup, `BACKLOG.md`).

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

---

## Known cruft

- `static/admin/config.yml` (Sveltia/Decap CMS) now points at `glw907/ecnordic-ski` with a
  matching `YYYY-MM-slug` post template, but the CMS is still not wired into the editorial
  workflow (local editing + git push). Finish wiring it or remove the admin surface;
  tracked as BACKLOG #4.
