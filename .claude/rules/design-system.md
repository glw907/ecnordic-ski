---
description: Design system binding facts for cairn-cms
paths:
  - "src/**/*.svelte"
  - "src/**/*.css"
  - "src/app.css"
---

# Cairn CMS Design System

Binding facts for the cairn-cms design system. Auto-loads when
editing Svelte components or CSS.

## Color tokens

Semantic tokens in the `--color-*` namespace defined in `@theme` in
`src/app.css`. Dark overrides via `@plugin "daisyui/theme"`.

## The three brand colors (binding usage rule)

Fireweed pink, mid spruce, black spruce. The rule is salience; the
full rationale lives in `docs/design-language.md`:

- **Pink = act.** Fireweed marks actions and the brand, nothing else:
  prose links, buttons, the CTA card, active nav states, focus ring,
  selection, the logo, the band rules. Two cuts, picked by surface:
  `--color-fireweed` (display, 66%) on dark spruce surfaces only;
  `--color-primary` / `--color-link` (deep, 52%) on light surfaces,
  where the display cut fails text contrast.
- **Green = ambient.** `--color-spruce-accent` is the working green
  for every non-action accent: icons, chips, band eyebrows, card hover
  edges, tags, quiet wayfinding links.
- **Black spruce = ground.** `--color-secondary` / `--color-header`
  carry the header and footer bands and dark-theme surfaces. Never use
  black spruce as an accent on a light page; it reads as plain black.

A new accent surface defaults to the working green. Reach for fireweed
only when the surface is a click-me or the brand mark itself. Don't
re-introduce a pink/green role split per section; `role="secondary"`
in content markup is a no-op kept for compat.

**Mix in `oklab`, never `oklch`** (`color-mix(in oklab, ...)`).
Cylindrical mixes walk the hue arc: green toward a warm base lands on
khaki; cobalt toward a warm border landed on magenta.

**Never use DaisyUI v4 short vars** (`--bc`, `--p`, `--b1`, etc.).
They were renamed in v5 and silently resolve to nothing.

**Never hardcode `oklch()` values** in component styles. Define new
tokens in the `@theme` block in `src/app.css` and reference via
`var(--color-*)`.

**Never use hex or `rgb()` colors.** Use `oklch()` throughout.

## DaisyUI themes

- Light: `ecxc` (default)
- Dark: `ecxc-dark` (prefers-dark)

Theme names are referenced in `@plugin "daisyui"` in `src/app.css`.
Overrides use `@plugin "daisyui/theme"`, not raw `[data-theme]` blocks.

## Typography

| Role | Font | Usage |
|---|---|---|
| Body | Alegreya Sans 400/500/700 | Prose, post content |
| Display | Nunito 600/700/800 | Headings, nav, labels |
| Mono | iA Writer Mono S 400/700 | Code blocks |

Body and mono are self-hosted woff2 in `static/fonts/`, declared in
`src/app.css`. Display (Nunito) is loaded from Google Fonts in
`src/app.html`. Font roles are referenced via `--font-body`,
`--font-display`, `--font-mono`. Never hardcode family names.

## Shared CSS classes

Defined globally in `src/app.css`. Use these; don't re-declare:
`.post-body`, `.post-date`, `.post-tags`, `.post-tag`, `.page-title`,
`.back-link`

Everything else: scoped `<style>` per component.

## Site constants

All site-specific values live in `src/lib/config.ts` (and per-site
configs once multi-site is wired). Never hardcode `SITE_URL`,
`SITE_TITLE`, etc. in components.
