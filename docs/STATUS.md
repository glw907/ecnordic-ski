# ecnordic.ski: Project Status

## Shipped: cairn-cms 0.34.0 + dependency prune, 2026-06-08

ecnordic moved from `^0.33.0` to `^0.34.0` as a `site-pass`. 0.34.0 needs no consumer code change: it adds
a branded "admin needs HTTPS" page for a deployed http request that would otherwise hit the opaque CSRF
403, plus a cairn-internal prose gate. The consumer action is to force HTTPS at the Cloudflare edge (Always
Use HTTPS), now required by the deploy guide; it fixes ecnordic's own 0.33 login CSRF failure (checklist below).

A dependency audit then cut the surface. better-auth and drizzle-orm were dead once cairn took over auth.
The markdown-pipeline packages (remark-*, rehype-*, unified, unist-util-visit, mdast-util-directive) were
unused because `createRenderer` bundles them, and @phosphor-icons/core because `icons.ts` inlines the path
data; @types/mdast went too. hast-util-sanitize, imported but resolving only through cairn, became a direct
dep. The stale `drizzle/migrations/` and `scripts/mint-session.mjs` (both better-auth relics) were deleted.
Gate green: check 0/0, test 54, build exit 0.

**Current state.** Public delivery and the admin run on cairn-cms `^0.34.0`; see `docs/architecture.md`.
No engineering pass is queued. The next work is the pre-publish checklist below, mostly human and external.

---

## History

- **cairn-cms 0.33 upgrade (2026-06-07).** `^0.24.0` to `^0.33.0`; admin isolated via a `(site)` route
  group + bare root layout, manifest verified by the `cairnManifest()` Vite plugin (drift now fatal).
- **Web-content authoring (2026-06-06).** Audience-first `content-draft`/`content-review` skills, the
  shared method doc, the widened `prose-guard` general tier, and the ecnordic routing.
- **Global component layer (2026-06-06).** `.ec-*` styles moved to the global stylesheet, Volunteers
  fixed, the entrance cascade covers every static page, gloss footnotes added.
- **Site refresh (2026-06-04).** Full content rebuild to the six-page IA across three subagent-driven plans.
- **cairn-cms 0.21/0.24 (2026-06-02/04).** `^0.10.0` to `^0.24.0`; became a fully idiomatic cairn site
  (schema contract, slot model, engine surface, content graph), then the `CairnHead` import split.

---

## Passes

| Pass | Goal | Status |
|------|------|--------|
| 1–8 | Scaffold, design language, directive pipeline, kit rollout | ✓ Done |
| 9 | Remote-functions spike (contact on `form()`) | ✓ Done (DEFER) |
| 0.10–0.21 | Version catch-up, breaking floor, content graph | ✓ Done |
| Refresh 1–3 | Six-page content rebuild | ✓ Done |
| 0.33 | cairn-cms 0.33.0 upgrade (admin stands alone) | ✓ Done |
| 0.34 | cairn-cms 0.34.0 upgrade + dependency prune | ✓ Done |

---

### Remaining before the public launch

The pre-publish checklist is the gate before announcing the site:

- **Force HTTPS at the Cloudflare edge** (Always Use HTTPS), now required by cairn for the magic-link login.
- Attorney review of the waiver.
- CrewLAB confirmations: join link and signing flow (#22), collection model (#21, live `PLACEHOLDER` on page).
- Launch-time redirects: `/resources` and `/waiver` to CrewLAB (#18), `/home` to `/` (#17).
- Real photos in place of the placeholders.

**Deploy:** Live at **https://ecnordic.ski**. Push to `main` triggers GitHub Actions (build + pagefind + wrangler deploy).
