# 907.life Architecture

Design decisions for the SvelteKit rebuild.

> **Pattern intent:** This site is a testbed. Architecture is documented as a
> reusable pattern for future personal blog sites, not just "how this site works."

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | SvelteKit + TypeScript | Modern, first-class Cloudflare support, Svelte 5 runes |
| Styling | Tailwind CSS v4 + DaisyUI v5 | CSS-first config, no tailwind.config.js needed |
| Markdown (posts) | remark + remark-gfm | Pure data pipeline, GFM support, no magic |
| Markdown (special pages) | mdsvex | Svelte components inside markdown for pages with interactive sections |
| Search | Pagefind | Post-build static index, zero runtime JS cost |
| CMS | Sveltia CMS | Git-based, modern Decap replacement, reusable config schema |
| Adapter | @sveltejs/adapter-cloudflare | First-class Workers support, form actions work natively |
| Contact form | Cloudflare Email Workers | Native Cloudflare, free tier, replaces Resend |
| Spam protection | Cloudflare Turnstile | Carried over from Hugo site |
| Fonts | Spectral + Karla + Monaspace Neon (woff2, self-hosted) | Scholar's study aesthetic: Spectral for prose warmth, Monaspace Neon for terminal-precise code |

**Reusable core (the pattern):**
SvelteKit + TS + adapter-cloudflare · Tailwind v4 + DaisyUI v5 · remark/mdsvex pipeline
· Pagefind · Sveltia CMS config schema · Cloudflare Email Workers contact form
· GitHub Actions → Cloudflare Workers deployment

**Site-specific:** domain, content, fonts, Cloudflare secrets

---

## Routing

URL structure preserved from Hugo: `/:year/:month/:day/:slug/`

SvelteKit route: `src/routes/[year]/[month]/[day]/[slug]/+page.svelte`

Slug derived from filename: `2026-03-06-early-march.md` → `/2026/03/06/early-march/`

---

## Content Pipeline

### Posts — remark + remark-gfm

`src/content/posts/*.md` — loaded at build time via `import.meta.glob` with `?raw` +
`eager: true`. All markdown is bundled as string constants at build time (required:
Cloudflare Workers has no filesystem). Parsed at request time by gray-matter + remark.

Frontmatter: `title`, `date`, `draft`, `tags`, `description`

**Type split:** `PostSummary` (metadata only, returned by `getAllPosts`) vs `PostDetail`
(adds `html: string`, returned by `getPost`). Prevents callers from accidentally
accessing `.html` on list results — it's a type error, not a runtime undefined.

**`getAllPosts` is synchronous and memoized** — rawFiles is eagerly loaded, gray-matter
is sync, no awaits. The parsed+sorted result is cached in `_cachedPosts` (module-level)
so repeated calls within a build/request don't re-parse. Only `getPost` is async
(remark `.process()` returns a Promise).

**Tagging:** `getAllTags()` derives tag counts from `getAllPosts()`. `getPostsByTag(tag)`
filters `getAllPosts()`. Both benefit from the `_cachedPosts` memo — the underlying
parse work only happens once even when both are called in the same load function.

**Tag routes:** `/tags/` index and `/tags/[tag]/` detail pages are fully pre-rendered.
`entries()` in `[tag]/+page.server.ts` drives static generation of all tag pages at
build time. Tags not present in any post return 404.

### Special Pages — mdsvex

About and archives pages use mdsvex. A `.md` file holds editable prose (managed via
Sveltia CMS); embedded Svelte components handle dynamic behavior (archive listing,
contact form).

---

## About + Contact

No separate `/contact/` route. Contact form lives at the bottom of the about page,
accessible via `#contact` anchor. Nav "Contact" link → `/about/#contact`.

Form action: `src/routes/about/+page.server.ts`

Flow: validate Turnstile → send via Cloudflare Email Workers `send_email` binding.

Secrets: `TURNSTILE_SECRET_KEY`, `CONTACT_EMAIL`

---

## Search

`npx pagefind --site .svelte-kit/cloudflare` runs post-build. Generates static index in
`.svelte-kit/cloudflare/pagefind/`. Search UI is a Svelte component wrapping the Pagefind
JS API.

---

## CMS — Sveltia

Mounted at `/admin/`. Config at `static/admin/config.yml`. Two collections:

- **posts** — `src/content/posts/`, fields: title, date, draft, description, tags, body
- **pages** — about and archives prose (title + body only, not form/archive components)

Primary workflow is local editing + git push. CMS is wired in for the pattern.

---

## Deployment

Push to `main` → GitHub Actions → `npm run build` + `npx pagefind --site
.svelte-kit/cloudflare` + `npx wrangler deploy` → live in ~2 min.

**Build output path:** adapter-cloudflare v5 outputs to `.svelte-kit/cloudflare/`, not
`build/`. `wrangler.toml` `main` and `[assets] directory` both point there. Pagefind
indexes prerendered HTML from the same directory. GitHub Actions secrets:
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

---

## Design System

**Color tokens:** 17 semantic tokens defined in `@theme` (generates both CSS vars and
Tailwind utilities). Light (silk) values are defaults; `@plugin "daisyui/theme"` extends
the built-in dim theme with dark overrides. Tokens use `--color-*` namespace to avoid
collision with DaisyUI slots. Full token table in
`docs/superpowers/specs/2026-04-07-css-token-system-design.md`.

**Color:** `oklch()` throughout — no hex, no `rgb()`. Two hue anchors:
- Hue 230 (cool blue-grey) — UI chrome: nav, borders, code blocks, date labels
- Hue 61 (warm content) — body text via DaisyUI theme (`--color-base-content`)

**Theme persistence:** Cookie-based (`theme` cookie) with `hooks.server.ts` SSR injection.
Inline `<script>` in app.html reads cookie → localStorage → prefers-color-scheme as
fallback chain. No flash on any path. Toggle in nav writes cookie + localStorage.

**DaisyUI theme config:** `@plugin "daisyui" { themes: silk --default, dim --prefersdark }`
enables both themes. Custom overrides use `@plugin "daisyui/theme"` (NOT raw
`[data-theme]` blocks) to inherit built-in theme variables like `base-100`.

**Typography hierarchy:**
- Body: Spectral 400/700 — warm serif, handles technical density without feeling clinical
- Display: Karla 400–700 — used in nav logo only; provides sans contrast
- Mono: Monaspace Neon — tight line-height (1.35) for terminal character

**Homepage layout:** Featured post shown in full (most recent), followed by summary list
("Earlier"). Rationale: the blog is read top-to-bottom — the newest thing is the point.

**Shared CSS in `app.css`:** `.post-body`, `.post-date`, `.post-tags`/`.post-tag`,
`.page-title`, and `.back-link` are global classes used across multiple routes.
Everything else is scoped per route.

**Site constants in `src/lib/config.ts`:** All site-specific values (`SITE_URL`,
`SITE_TITLE`, `SITE_DESCRIPTION`, `SITE_AUTHOR`, `SITE_LOCALE`, `FEED_MAX_ITEMS`,
`HOMEPAGE_FEATURED_COUNT`) live here. A hookify rule (`site-constants`) catches
hardcoded drift in `.svelte` and `.ts` files. Adapting for a new site = update
`config.ts` + hookify pattern.

**URL helpers in `src/lib/utils.ts`:** `postUrl(post)` and `tagUrl(tag)` produce
canonical relative URLs. `toRFC822(iso)` and `toISODateTime(iso)` produce feed-format
dates. All date parsing uses a private `parseUtcDate(iso)` helper to avoid
timezone-shift on bare YYYY-MM-DD strings.

**Feeds:** RSS 2.0 at `/feed.xml`, JSON Feed 1.1 at `/feed.json`. Both use a shared
`getFeedItems()` data layer in `src/lib/feed.ts`. The feed result is memoized at module
level — post content is bundled at build time and never changes within a Worker isolate.
Autodiscovery `<link rel="alternate">` tags in `+layout.svelte` cover both formats.

**Hookify quality rules:** Ten rules in `.claude/hookify.*.local.md` enforce Svelte 5
runes, oklch colors, color token usage, DaisyUI v5 class names, Tailwind v4 APIs, and
SvelteKit patterns. Research-backed against official migration guides and community best
practices.

**Content style guard:** `.claude/hooks/content-style-guard.py` (PreToolUse, wired
in `.claude/settings.json`) blocks Write/Edit of `src/content/**/*.md` containing
high-confidence AI-writing tells — the em-dash appendage, em-dash spray (3+), and
the banned word/phrase/opener lists from `docs/content-guide.md`. It's a
deterministic backstop to the mandatory self-critique pass, not a replacement.

**Turnstile in dev:** Skipped gracefully — `verifyTurnstile` only runs when
`platform.env.TURNSTILE_SECRET_KEY` is present. Always-pass test key
(`1x00000000000000000000AA`) used for the widget in dev.

**Design language:** Canonical living reference at `docs/design-language.md` (not a
dated spec). Reusable primitives live globally in `src/app.css`: `.ec-icon` (bare
role-coloured glyph, the default; the `.ec-chip` tile is reserved for one focal accent
per page), `.ec-alert` (subtle alert card; role set by a modifier like
`.ec-alert-caution`), and `.ec-grid` (card body of parallel titled points on
`base-200` tiles; the last cell of an odd-count grid spans full width as an orphan
fix and featured slot). Role colours needing a contrast-safe, theme-flipping variant get a
derived token, e.g. `--color-caution-accent`. Icon use is governed by a meaning matrix
+ usage checklist in the design-language doc.

**Markdown-page decoration:** Page styling is selected by **inline container
directives** authored in `src/content/pages/*.md` (see the pipeline below), not by
slug inference. `src/routes/[slug]/+page.svelte` renders `page.html` directly via
`{@html}` — its old `<script module>` decorate machinery (`decoratePage`,
`decorateAbout/Training/Crewlab`, `wrapSections`, `boldParasToGrid`, the inline icon
maps) was deleted in Pass 6. The per-page module CSS (entrance cascade, `.ec-head`,
`.ec-cta`, reduced-motion) is unchanged, still scoped with
`:is([data-page="about"], [data-page="training"], [data-page="crewlab"])`, because
the pipeline emits the same classes the builders did. **Body type is one sitewide
standard:** `.post-body` is 0.92rem and `.card-body` inherits it (DaisyUI's 0.875rem
is overridden), so text is one size in or out of a card; only the lede (1.0rem, the
first paragraph of a static page) and grid cells (0.85rem) deviate, uniformly —
there is no per-page font sizing.

### Directive render pipeline (Pass 5 built, Pass 6 wired)

`src/lib/markdown/render.ts` exports `renderMarkdown(content)`, a unified pipeline
that renders inline container directives into the same HTML the old `decorate*`
builders emitted. As of Pass 6 it **is the site's renderer**: `markdownToHtml` in
`src/lib/utils.ts` is a thin delegate to it (the old `remark-html` bundle is gone),
serving both posts (no directives) and pages. The cutover was verified
pixel-identical (headless screenshots, AE=0) and HTML-identical modulo two
documented invisibles: `data-section` attributes are dropped (no consumer) and
heading `id`s now come from `rehype-slug`.

Pipeline order: `remark-parse → remark-gfm → remark-directive → remark-ec-directives
(mark) → remark-rehype(allowDangerousHtml) → rehype-raw → **rehype-ec-primitives
(restructure) → rehype-slug** → rehype-stringify`. The restructure step runs
*before* `rehype-slug` (a deliberate deviation from the original plan ordering): it
retags the section `<h2>` as `.card-title` first, so the class serializes ahead of
the slug `id`; slug then stamps ids onto the final element structure.

- **`remark-ec-directives.ts`** (mdast) stamps each known directive
  (`card/grid/alert/cta/split/panel/passage`) with `data-primitive`/`data-icon`/
  `data-role` markers via `hProperties`; it builds no structure. A caution alert
  with no explicit icon defaults to the `warning` glyph. Because the vocabulary is
  container-only (`:::name`), the step also reconstructs any text/leaf directive
  (`:name` / `::name`) back to literal text — these only arise from accidental
  colons in prose (clock times like `4:00–6:00 PM`), which would otherwise collapse
  to empty `<div>`s.
- **`rehype-ec-primitives.ts`** (hast) rewrites the marked elements into the kit's
  markup, dispatching on `data-primitive` in `transform()`. Nested directives are
  converted by `transformChildren` before their parent builds, so by the time
  `buildSplit` runs its panels are already `.ec-panel` divs. Top-level primitives
  get a document-order `--rise` stagger (0.16s + 0.04s each); nested ones get none.
  A grid with an `h2` becomes a grid card; a grid without one (nested use) is lifted
  to a bare `ul.ec-grid`.
- **`icons.ts`** holds the Phosphor path data (copied byte-for-byte from the
  pre-Pass-5 `ICON`/`PANEL_ICONS` maps) and `glyph(name)`, which returns the inline
  SVG as a real `hastscript` node — no raw-string injection.

The whole pipeline is pinned by unit tests (`src/tests/markdown/`, 18 tests); the
emitted HTML was the contract for the Pass 6 regression sweep, which confirmed it.

---

## Build Toolchain & Version Notes

- **Node 24** is the build runtime, pinned via `.nvmrc` (`24`) and `engines.node`
  (`>=22`); CI (`deploy.yml`) runs Node 24. wrangler ≥4.93 requires Node ≥22, so
  Node 20 is no longer supported here.
- **Vite 8 uses the Rolldown bundler**, which resolves absolute dynamic imports
  eagerly. Pagefind's UI bundle (`/pagefind/pagefind-ui.js`) is generated *after*
  the build by `npx pagefind`, so it must be listed in `build.rollupOptions.external`
  in `vite.config.ts` (alongside `cloudflare:email`) or the build fails with
  `UNRESOLVED_IMPORT`.
- **The calendar feature was removed** — the `/calendar` route, `/calendar.ics`,
  the `src/content/events/` pipeline (`events.ts`/`ics.ts`), and the `@schedule-x/*`
  + `temporal-polyfill` dependencies. Scheduling now lives in CrewLAB; the site has
  a `/crewlab` content page instead, and the homepage's old "this week" card became
  a recent-posts card.

---

## What Replaced What

| Hugo | SvelteKit |
|---|---|
| `themes/PaperMod` + layout overrides | Own components, no theme |
| `build.sh` to pin Hugo version | `package.json` lockfile |
| `src/worker.js` separate Worker | SvelteKit form action in `+page.server.ts` |
| Resend + `RESEND_API_KEY` | Cloudflare Email Workers (native) |
| Page bundles (`posts/slug/index.md`) | Flat files (`src/content/posts/slug.md`) |
| lunr.js search | Pagefind |
