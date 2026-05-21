<script module lang="ts">
  function slugify(s: string): string {
    return s
      .replace(/<[^>]*>/g, '')      // strip tags
      .replace(/&#?[a-z0-9]+;/gi, ' ')   // strip HTML entities (named or numeric, e.g. &amp; / &#x26;)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  type Section = { h2: string; title: string; slug: string; rest: string };

  // Split rendered HTML on H2 boundaries: `intro` is everything before the
  // first H2 (lede, page-toc); each section carries its heading tag, the
  // heading text, its slug, and the body after the heading. Sections with no
  // parseable H2 keep the raw chunk in `rest` (h2 empty) so callers can pass
  // it through unchanged.
  function parseSections(html: string): { intro: string; sections: Section[] } {
    const parts = html.split(/(?=<h2)/);
    const intro = parts[0] ?? '';
    const sections = parts.slice(1).map((chunk): Section => {
      const m = chunk.match(/^(<h2[^>]*>([\s\S]*?)<\/h2>)([\s\S]*)$/);
      if (!m) return { h2: '', title: '', slug: '', rest: chunk };
      const [, h2, title, rest] = m;
      return { h2, title, slug: slugify(title), rest };
    });
    return { intro, sections };
  }

  // Wrap each H2-led run of content into its own <section> card, with the body
  // in a .section-body wrapper. Anything before the first H2 stays outside.
  function wrapSections(html: string): string {
    const { intro, sections } = parseSections(html);
    if (!sections.length) return html;
    const body = sections
      .map(({ h2, slug, rest }) => {
        if (!h2) return `<section class="page-section">${rest}</section>`;
        const attr = slug ? ` data-section="${slug}"` : '';
        return `<section class="page-section"${attr}>${h2}<div class="section-body">${rest}</div></section>`;
      })
      .join('');
    return intro + body;
  }

  // ── Phosphor icons (regular weight, inlined as SVG so there's no icon-font
  // request). One icon per section header for wayfinding; inside a section,
  // icons appear only to label genuinely distinct parallel items (the two
  // cost/volunteer panels). No icon repeats — each meaning is its own glyph.
  const svg = (path: string) =>
    `<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg>`;

  const ICON: Record<string, string> = {
    'what-we-do': svg('M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z'),
    risks: svg('M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z'),
    'who-can-join': svg('M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z'),
    'program-philosophy': svg('M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z'),
    'getting-started': svg('M42.76,50A8,8,0,0,0,40,56V224a8,8,0,0,0,16,0V179.77c26.79-21.16,49.87-9.75,76.45,3.41,16.4,8.11,34.06,16.85,53,16.85,13.93,0,28.54-4.75,43.82-18a8,8,0,0,0,2.76-6V56A8,8,0,0,0,218.76,50c-28,24.23-51.72,12.49-79.21-1.12C111.07,34.76,78.78,18.79,42.76,50ZM216,172.25c-26.79,21.16-49.87,9.74-76.45-3.41-25-12.35-52.81-26.13-83.55-8.4V59.79c26.79-21.16,49.87-9.75,76.45,3.4,25,12.35,52.82,26.13,83.55,8.4Z'),

    // ── Training-page sections. `what-we-do` and `who-can-join` reuse the
    // shared meanings above (the work / people); `sign-up` reuses the flag
    // (start) glyph keyed under `getting-started`.
    schedule: svg('M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z'),
    'what-to-bring': svg('M168,40.58V32A24,24,0,0,0,144,8H112A24,24,0,0,0,88,32v8.58A56.09,56.09,0,0,0,40,96V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V96A56.09,56.09,0,0,0,168,40.58ZM112,24h32a8,8,0,0,1,8,8v8H104V32A8,8,0,0,1,112,24Zm56,136H88v-8a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8ZM88,176h48v8a8,8,0,0,0,16,0v-8h16v40H88Zm112,40H184V152a24,24,0,0,0-24-24H96a24,24,0,0,0-24,24v64H56V96A40,40,0,0,1,96,56h64a40,40,0,0,1,40,40V216ZM152,88a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,88Z'),
    'talkeetna-camp': svg('M255.31,188.75l-64-144A8,8,0,0,0,184,40H72a8,8,0,0,0-7.27,4.69.21.21,0,0,0,0,.06l0,.12,0,0L.69,188.75A8,8,0,0,0,8,200H248a8,8,0,0,0,7.31-11.25ZM64,184H20.31L64,85.7Zm16,0V85.7L123.69,184Zm61.2,0L84.31,56H178.8l56.89,128Z'),
  };

  // Distinct icons for the two cost/volunteer panels: hand-coins (give money)
  // vs handshake (give time) — neither repeats the section header's hand-heart.
  const PANEL_ICONS = [
    svg('M230.33,141.06a24.43,24.43,0,0,0-21.24-4.23l-41.84,9.62A28,28,0,0,0,140,112H89.94a31.82,31.82,0,0,0-22.63,9.37L44.69,144H16A16,16,0,0,0,0,160v40a16,16,0,0,0,16,16H120a7.93,7.93,0,0,0,1.94-.24l64-16a6.94,6.94,0,0,0,1.19-.4L226,182.82l.44-.2a24.6,24.6,0,0,0,3.93-41.56ZM16,160H40v40H16Zm203.43,8.21-38,16.18L119,200H56V155.31l22.63-22.62A15.86,15.86,0,0,1,89.94,128H140a12,12,0,0,1,0,24H112a8,8,0,0,0,0,16h32a8.32,8.32,0,0,0,1.79-.2l67-15.41.31-.08a8.6,8.6,0,0,1,6.3,15.9ZM164,96a36,36,0,0,0,5.9-.48,36,36,0,1,0,28.22-47A36,36,0,1,0,164,96Zm60-12a20,20,0,1,1-20-20A20,20,0,0,1,224,84ZM164,40a20,20,0,0,1,19.25,14.61,36,36,0,0,0-15,24.93A20.42,20.42,0,0,1,164,80a20,20,0,0,1,0-40Z'),
    svg('M254.3,107.91,228.78,56.85a16,16,0,0,0-21.47-7.15L182.44,62.13,130.05,48.27a8.14,8.14,0,0,0-4.1,0L73.56,62.13,48.69,49.7a16,16,0,0,0-21.47,7.15L1.7,107.9a16,16,0,0,0,7.15,21.47l27,13.51,55.49,39.63a8.06,8.06,0,0,0,2.71,1.25l64,16a8,8,0,0,0,7.6-2.1l55.07-55.08,26.42-13.21a16,16,0,0,0,7.15-21.46Zm-54.89,33.37L165,113.72a8,8,0,0,0-10.68.61C136.51,132.27,116.66,130,104,122L147.24,80h31.81l27.21,54.41ZM41.53,64,62,74.22,36.43,125.27,16,115.06Zm116,119.13L99.42,168.61l-49.2-35.14,28-56L128,64.28l9.8,2.59-45,43.68-.08.09a16,16,0,0,0,2.72,24.81c20.56,13.13,45.37,11,64.91-5L188,152.66Zm62-57.87-25.52-51L214.47,64,240,115.06Zm-87.75,92.67a8,8,0,0,1-7.75,6.06,8.13,8.13,0,0,1-1.95-.24L80.41,213.33a7.89,7.89,0,0,1-2.71-1.25L51.35,193.26a8,8,0,0,1,9.3-13l25.11,17.94L126,208.24A8,8,0,0,1,131.82,217.94Z'),
  ];

  // Cobalt (people) for the community sections; crimson (program) elsewhere.
  const SECONDARY_SECTIONS = new Set(['who-can-join']);

  function ecCard(slug: string, head: string, body: string, style = ''): string {
    return `<section class="card ec-card bg-base-100 border border-base-300 shadow-sm" data-section="${slug}"${style}>`
      + `<div class="card-body">${head}<div class="section-body">${body}</div></div></section>`;
  }

  // Each module enters on a staggered delay so the page resolves as one
  // top-to-bottom cascade (title → lede → modules in reading order) rather
  // than appearing all at once. The cascade continues the title/lede timing;
  // CSS turns it off under prefers-reduced-motion.
  function riseStyle(idx: number): string {
    return ` style="--rise:${(0.16 + idx * 0.04).toFixed(2)}s"`;
  }

  // Single call to act → centered card; the icon earns a tinted tile here
  // as the page's one focal accent, and the action link becomes a button.
  function ecCta(slug: string, icon: string, title: string, rest: string, rise: string): string {
    const body = rest.replace('class="download-link"', 'class="download-link btn btn-primary"');
    return `<section class="card ec-card ec-cta bg-base-100 border border-primary/30 shadow-sm" data-section="${slug}"${rise}>`
      + `<div class="card-body items-center text-center"><span class="ec-chip">${icon}</span><h2 class="card-title">${title}</h2>`
      + `<div class="section-body">${body}</div></div></section>`;
  }

  // Shared skeleton for decorated pages: parse into sections, run each through
  // a per-page mapper, and reassemble. The mapper receives the parsed section
  // plus pre-built `rise`, `icon`, `headIcon`, and `head` strings so each page
  // function only needs to express its meaningful branch conditions.
  function decoratePage(
    html: string,
    iconFor: (slug: string) => string,
    mapSection: (s: Section, idx: number, rise: string, icon: string, head: string) => string,
  ): string {
    const { intro, sections } = parseSections(html);
    if (!sections.length) return html;
    const decorated = sections.map((section, idx) => {
      const { h2, title, slug, rest } = section;
      if (!h2) return rest;
      const rise = riseStyle(idx);
      const icon = iconFor(slug);
      const tone = SECONDARY_SECTIONS.has(slug) ? ' ec-icon-secondary' : '';
      const headIcon = icon ? `<span class="ec-icon${tone}">${icon}</span>` : '';
      const head = `<div class="ec-head">${headIcon}<h2 class="card-title">${title}</h2></div>`;
      return mapSection(section, idx, rise, icon, head);
    }).join('');
    return intro + decorated;
  }

  // About is the worked example of the design language: each H2 section
  // becomes a DaisyUI module whose treatment fits its job, with a Phosphor
  // icon carrying the meaning and color carrying the role.
  function decorateAbout(html: string): string {
    return decoratePage(
      html,
      (slug) => ICON[slug] ?? '',
      ({ title, slug, rest }, _idx, rise, icon, head) => {
        // Caution → the subtle alert card: an aside that still matters. Amber
        // lives in the chrome (edge/icon/label); text stays full-contrast.
        if (slug === 'risks') {
          return `<div role="alert" class="ec-alert ec-alert-caution" data-section="risks"${rise}>`
            + `<div class="ec-alert-body"><h2>${icon}${title}</h2>${rest}</div></div>`;
        }

        // Values → a compact two-column set. These are parallel convictions,
        // not a sequence, so no numbering; the grid keeps them from running down.
        if (slug === 'program-philosophy') {
          const body = rest.replace('<ul>', '<ul class="ec-grid">');
          return ecCard('program-philosophy', head, body, rise);
        }

        // Paired info → two labelled panels, each with its own distinct icon.
        // No section-header icon: the panels already lead with parallel-choice
        // icons, and a third hand-* glyph at the head would echo them.
        if (slug === 'costs-volunteers') {
          const plainHead = `<div class="ec-head"><h2 class="card-title">${title}</h2></div>`;
          let i = 0;
          const body = '<div class="ec-split">'
            + rest.replace(/<p>([\s\S]*?)<\/p>/g, (_full, p) => {
                const ic = PANEL_ICONS[i] ?? '';
                const toneClass = i === 1 ? ' ec-icon-secondary' : '';
                i += 1;
                return `<div class="ec-panel"><span class="ec-icon${toneClass}">${ic}</span><p>${p}</p></div>`;
              })
            + '</div>';
          return ecCard('costs-volunteers', plainHead, body, rise);
        }

        // Single call to act → centered CTA card; icon tile is the one focal accent.
        if (slug === 'getting-started') {
          return ecCta('getting-started', icon, title, rest, rise);
        }

        return ecCard(slug, head, rest, rise);
      },
    );
  }

  // Training applies the same kit as About. Most sections are plain module
  // cards (schedule, who-can-join, what-to-bring, the camp); the parallel
  // activity list becomes a grid, and sign-up is the page's one CTA.
  function decorateTraining(html: string): string {
    return decoratePage(
      html,
      // sign-up reuses the flag (start) glyph; all other slugs look up directly.
      (slug) => slug === 'sign-up' ? (ICON['getting-started'] ?? '') : (ICON[slug] ?? ''),
      ({ title, slug, rest }, _idx, rise, icon, head) => {
        // The training activities are parallel peers (each a bold term + note),
        // not a sequence → the grid card, same as About's philosophy values.
        if (slug === 'what-we-do') {
          const body = rest.replace('<ul>', '<ul class="ec-grid">');
          return ecCard('what-we-do', head, body, rise);
        }

        // Single call to act → centered CTA, flag tile as the one focal accent.
        if (slug === 'sign-up') {
          return ecCta('sign-up', icon, title, rest, rise);
        }

        return ecCard(slug, head, rest, rise);
      },
    );
  }
</script>

<script lang="ts">
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';

  let { data }: { data: PageData } = $props();
  let { page } = $derived(data);

  let bodyHtml = $derived.by(() => {
    if (page.slug === 'about') return decorateAbout(page.html);
    if (page.slug === 'training') return decorateTraining(page.html);
    return wrapSections(page.html);
  });
</script>

<svelte:head>
  <title>{page.title} — {SITE_TITLE}</title>
</svelte:head>

<article class="static-page" data-page={page.slug}>
  <h1 class="page-title">{page.title}</h1>

  <div class="post-body">
    {@html bodyHtml}
  </div>
</article>

<style>
  /* ─── Static content page shell ─────────────────────────── */
  .static-page {
    max-width: 46rem;
    animation: page-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* Intro (lede + opening paragraph) sits above the cards at a tight measure */
  .static-page :global(.post-body > p) {
    max-width: 42rem;
  }

  .static-page :global(.page-title) {
    position: relative;
    margin-block-end: 1.6rem;
    padding-block-end: 0.9rem;
    animation: page-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .static-page :global(.page-title)::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    inset-block-end: 0;
    inline-size: 2.5rem;
    block-size: 3px;
    border-radius: 2px;
    background: var(--color-primary);
  }

  /* Lede: the page thesis. A measured step above body — larger and a touch
     heavier in heading colour — not a headline. Size + weight carry it, so it
     doesn't need to shout. */
  .static-page :global(.post-body > p:first-child) {
    font-size: 1.15rem;
    line-height: 1.55;
    font-weight: 500;
    color: var(--color-heading);
    margin-block-end: 1.4rem;
    animation: page-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.06s both;
  }

  /* ─── Base card (used as-is on training, volunteers, resources) ─── */
  .static-page :global(.page-section) {
    margin-block-start: 1rem;
    padding: 1.5rem 1.75rem;
    background: var(--color-base-100);
    border: 1px solid var(--color-border-subtle);
    border-radius: 12px;
    box-shadow: 0 1px 4px oklch(0% 0 0 / 0.05);
  }
  .static-page :global(.page-section h2) {
    font-size: 1.25rem;
    margin-block: 0 0.75rem;
  }
  .static-page :global(.section-body > :first-child) {
    margin-block-start: 0;
  }
  .static-page :global(.page-section h3) {
    font-size: 1.02rem;
    margin-block: 1.2rem 0.2rem;
    color: var(--color-heading);
  }

  /* ─── About — worked example of the EC Nordic design language ──────
     The page is built from a small, reusable kit (see the Pass-4 design
     spec). Each primitive maps to a DaisyUI component so it's idiomatic
     and portable; the scoped CSS here only tunes spacing and the one
     custom primitive (the icon chip):

       module   → DaisyUI .card (subtle: border + shadow-sm)
       caution  → .ec-alert.ec-alert-caution — subtle alert, amber chrome
       grid     → .ec-grid (global) — card body of parallel titled points
       action   → DaisyUI .btn.btn-primary
       icon     → .ec-icon bare glyph (default); .ec-chip tile = one focal accent

     Color encodes role, never decoration:
       primary  (crimson) = the program and the one action
       secondary(cobalt)  = people / community
       warning  (amber)   = caution  ─────────────────────────────────── */

  /* Intro context after the lede: preamble that bridges the thesis to the
     section cards. A reasoned step down — slightly smaller, in supporting
     colour — so it stays legible but doesn't compete with the cards below.
     (Not muted: that read as caption-light for a substantive paragraph.) */
  .static-page[data-page="about"] :global(.post-body > p:not(:first-child)) {
    font-size: 0.95rem;
    color: var(--color-body-soft);
  }

  /* A decorated page orchestrates its own entrance per module (below), so the
     shared whole-page rise would double the transform — let the cascade carry
     it. (About and training both decorate; plain pages keep the page rise.) */
  .static-page:is([data-page="about"], [data-page="training"]) {
    animation: none;
  }

  /* Rhythm between modules, and the staggered entrance: each module rises in
     on its own --rise delay so the page resolves as one top-to-bottom cascade
     continuing the title (0s) and lede (0.06s) above it. */
  .static-page:is([data-page="about"], [data-page="training"]) :global(.ec-card),
  .static-page[data-page="about"] :global(.ec-alert) {
    margin-block-start: 1.4rem;
    animation: module-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: var(--rise, 0s);
  }
  @keyframes module-rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }

  /* Heading row: icon chip + title (DaisyUI .card-title), margins reset */
  .static-page:is([data-page="about"], [data-page="training"]) :global(.ec-head) {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    /* heading breathes from its body — the innermost step of the page's
       vertical rhythm (0.5 → 0.9 → 1.4rem, each ~1.5× the last) */
    margin-block-end: 0.5rem;
  }
  .static-page:is([data-page="about"], [data-page="training"]) :global(.ec-head h2),
  .static-page:is([data-page="about"], [data-page="training"]) :global(.ec-cta h2) {
    margin: 0;
    font-size: 1.3rem;
  }
  /* Bare header glyph: a touch larger than inline so it anchors the title */
  .static-page:is([data-page="about"], [data-page="training"]) :global(.ec-head .ec-glyph) {
    inline-size: 1.6rem;
    block-size: 1.6rem;
  }
  .static-page:is([data-page="about"], [data-page="training"]) :global(.section-body > :first-child) {
    margin-block-start: 0;
  }

  /* The icon primitives (.ec-icon bare glyph, .ec-chip tile) and the caution
     subtle alert (.ec-alert) live globally in app.css. Below: About-only tuning. */

  /* Paired info: two labelled panels, each with its own icon */
  .static-page[data-page="about"] :global(.ec-split) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
    margin-block-start: 0.25rem;
  }
  .static-page[data-page="about"] :global(.ec-panel) {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background: var(--color-base-200);
    border-radius: 0.75rem;
    padding: 1.1rem 1.2rem;
  }
  .static-page[data-page="about"] :global(.ec-panel .ec-icon) {
    margin-block-start: 0.1rem;
  }
  .static-page[data-page="about"] :global(.ec-panel .ec-glyph) {
    inline-size: 1.5rem;
    block-size: 1.5rem;
  }
  .static-page[data-page="about"] :global(.ec-panel p) {
    margin: 0;
  }
  .static-page[data-page="about"] :global(.ec-panel strong) {
    display: block;
    font-family: var(--font-display);
    font-size: 1.02rem;
    margin-block-end: 0.3rem;
    color: var(--color-heading);
  }

  /* Single call to act */
  .static-page:is([data-page="about"], [data-page="training"]) :global(.ec-cta .btn) {
    margin-block-start: 0.5rem;
  }

  @keyframes page-rise {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }

  /* ─── Mobile ─────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .static-page[data-page="about"] :global(.ec-split) {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .static-page,
    .static-page :global(.page-title),
    .static-page :global(.post-body > p:first-child),
    .static-page:is([data-page="about"], [data-page="training"]) :global(.ec-card),
    .static-page[data-page="about"] :global(.ec-alert) {
      animation: none;
    }
  }
</style>
