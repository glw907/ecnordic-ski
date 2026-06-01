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
| `/:year/:month/:slug` | `[...path]/` | Post detail, resolved through the content layer |
| `/<slug>` | `[...path]/` | Static content page (about, training, volunteers, crewlab, resources) |
| `/contact` | `contact/` | Contact form (the only non-prerendered route) |
| `/waiver` | `waiver/` | Static Svelte page |
| `/tags`, `/tags/:tag` | `tags/`, `tags/[tag]/` | Tag index + per-tag listing |
| `/feed.xml`, `/feed.json` | `feed.xml/`, `feed.json/` | RSS 2.0 + JSON Feed 1.1, built by the engine |
| `/sitemap.xml`, `/robots.txt` | `sitemap.xml/`, `robots.txt/` | Engine-built sitemap and robots |

Nav links live in `src/lib/components/Nav.svelte`.

**Post and page URLs** come from the cairn-cms content layer, not a route folder. One
catch-all `[...path]` route resolves an incoming path to a post or page through the
byPermalink map in `src/lib/content.ts`. The engine computes each entry's permalink from
the YAML URL policy in `src/lib/site.config.yaml`: posts carry a `month` date prefix, so
`2026-05-welcome.md` (frontmatter `date: 2026-05-14`) serves at `/2026/05/welcome`; pages
serve at `/<slug>`. Canonical URLs carry no trailing slash. The `url-inventory` test pins
this set against the old filename-derived URLs, so the Pass 1b cutover moved no live URL.
SvelteKit ranks the explicit routes above the catch-all, so `/tags`, `/contact`, the feeds,
and the rest keep their own routes; the catch-all serves only posts and pages.

---

## Content Pipeline

### Content layer: `src/lib/content.ts`

As of the cairn-cms 0.10 migration (Pass 1b), one module reads all content off disk and
every public surface goes through it. It globs each concept's markdown with
`import.meta.glob` (`?raw`, `eager: true`), because Cloudflare Workers has no filesystem
and all markdown ships as string constants, then hands the raw files to the engine.
`createContentIndex` parses frontmatter, computes each summary (permalink, excerpt, word
count, tags, draft flag), and sorts newest-first. The per-concept descriptors come from
`normalizeConcepts(cairn.content, urlPolicyFrom(siteConfig))`, the same inputs the admin
runtime uses, so the delivery index and the editor agree on every URL.

The home and tag routes read it through `allPosts`/`allTags`/`postsByTag`, the feeds
through `feedItems`, the sitemap through `contentPermalinks`, and the catch-all through
`resolvePermalink`. `resolvePermalink` builds a `Map<permalink, {concept, id}>` once across
both concepts; it is the single unit the catch-all depends on, and a path with no entry
returns `undefined`, which the route turns into a 404. `/tags/[tag]/` stays explicit and
fully prerendered: its `entries()` enumerates every tag, and a tag with no posts 404s.

### Catch-all presentation: `src/routes/[...path]/`

`+page.server.ts` resolves the path, renders the entry body through the site renderer, and
builds the SEO head with the engine's `buildSeoMeta` (title, description, canonical URL,
`og`/`article` tags, JSON-LD, feed links). Its `entries()` enumerates `contentPermalinks()`,
so prerender stays exhaustive. `+page.svelte` branches on `data.concept`: the post branch
reproduces the old post markup, the page branch the old page markup with
`data-page={data.slug}`. The post and page markup and the page route's scoped `<style>`
block were carried over verbatim from the deleted `[year]/[month]/[slug]/` and `[slug]/`
routes, so rendering and the animation cascade did not change. The inlined JSON-LD escapes
`< > &` before `{@html}`, so an author-controlled title or description cannot break out of
the script element.

### Frontmatter validation

`src/lib/content-schema.ts` holds `validatePostFrontmatter` and `validatePageFrontmatter`,
registered on the adapter concepts in `src/lib/cairn.config.ts`. `validatePostFrontmatter`
requires `title`, a real `YYYY-MM-DD` `date`, a `description`, and at least one `tag` from
the controlled vocabulary (`POST_TAGS` in `src/lib/config.ts`); `draft` must be boolean if
present. `validatePageFrontmatter` requires `title`. Covered by
`src/tests/content-schema.test.ts`.

These validators run on the admin **save** path, where the engine checks a form submission
before committing. The delivery read path (`createContentIndex`) parses frontmatter but
does not run them, so this is no longer a build-time gate the way the old `posts.ts`/
`pages.ts` were. The `url-inventory` test still catches a post whose frontmatter date
disagrees with its filename. A missing `title` or `description` on hand-committed content
would no longer fail the build (tracked in `BACKLOG.md`).

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

---

## Known cruft

- `static/admin/config.yml` (Sveltia/Decap CMS) now points at `glw907/ecnordic-ski` with a
  matching `YYYY-MM-slug` post template, but the CMS is still not wired into the editorial
  workflow (local editing + git push). Finish wiring it or remove the admin surface;
  tracked as BACKLOG #4.
