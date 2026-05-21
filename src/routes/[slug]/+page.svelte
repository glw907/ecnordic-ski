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
  // request). Each section's icon carries its meaning at a glance; see
  // decorateAbout. The cost/volunteer section header reuses the hand-heart glyph.
  const HAND_HEART =
    '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M230.33,141.06a24.34,24.34,0,0,0-18.61-4.77C230.5,117.33,240,98.48,240,80c0-26.47-21.29-48-47.46-48A47.58,47.58,0,0,0,156,48.75,47.58,47.58,0,0,0,119.46,32C93.29,32,72,53.53,72,80c0,11,3.24,21.69,10.06,33a31.87,31.87,0,0,0-14.75,8.4L44.69,144H16A16,16,0,0,0,0,160v40a16,16,0,0,0,16,16H120a7.93,7.93,0,0,0,1.94-.24l64-16a6.94,6.94,0,0,0,1.19-.4L226,182.82l.44-.2a24.6,24.6,0,0,0,3.93-41.56ZM119.46,48A31.15,31.15,0,0,1,148.6,67a8,8,0,0,0,14.8,0,31.15,31.15,0,0,1,29.14-19C209.59,48,224,62.65,224,80c0,19.51-15.79,41.58-45.66,63.9l-11.09,2.55A28,28,0,0,0,140,112H100.68C92.05,100.36,88,90.12,88,80,88,62.65,102.41,48,119.46,48ZM16,160H40v40H16Zm203.43,8.21-38,16.18L119,200H56V155.31l22.63-22.62A15.86,15.86,0,0,1,89.94,128H140a12,12,0,0,1,0,24H112a8,8,0,0,0,0,16h32a8.32,8.32,0,0,0,1.79-.2l67-15.41.31-.08a8.6,8.6,0,0,1,6.3,15.9Z"/></svg>';
  const ICON: Record<string, string> = {
    'what-we-do':
      '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z"/></svg>',
    risks:
      '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"/></svg>',
    'who-can-join':
      '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"/></svg>',
    'program-philosophy':
      '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z"/></svg>',
    'costs-volunteers': HAND_HEART,
    'getting-started':
      '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M42.76,50A8,8,0,0,0,40,56V224a8,8,0,0,0,16,0V179.77c26.79-21.16,49.87-9.75,76.45,3.41,16.4,8.11,34.06,16.85,53,16.85,13.93,0,28.54-4.75,43.82-18a8,8,0,0,0,2.76-6V56A8,8,0,0,0,218.76,50c-28,24.23-51.72,12.49-79.21-1.12C111.07,34.76,78.78,18.79,42.76,50ZM216,172.25c-26.79,21.16-49.87,9.74-76.45-3.41-25-12.35-52.81-26.13-83.55-8.4V59.79c26.79-21.16,49.87-9.75,76.45,3.4,25,12.35,52.82,26.13,83.55,8.4Z"/></svg>',
    gift:
      '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216,72H180.92c.39-.33.79-.65,1.17-1A29.53,29.53,0,0,0,192,49.57,32.62,32.62,0,0,0,158.44,16,29.53,29.53,0,0,0,137,25.91a54.94,54.94,0,0,0-9,14.48,54.94,54.94,0,0,0-9-14.48A29.53,29.53,0,0,0,97.56,16,32.62,32.62,0,0,0,64,49.57,29.53,29.53,0,0,0,73.91,71c.38.33.78.65,1.17,1H40A16,16,0,0,0,24,88v32a16,16,0,0,0,16,16v64a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V136a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72ZM149,36.51a13.69,13.69,0,0,1,10-4.5h.49A16.62,16.62,0,0,1,176,49.08a13.69,13.69,0,0,1-4.5,10c-9.49,8.4-25.24,11.36-35,12.4C137.7,60.89,141,45.5,149,36.51Zm-64.09.36A16.63,16.63,0,0,1,96.59,32h.49a13.69,13.69,0,0,1,10,4.5c8.39,9.48,11.35,25.2,12.39,34.92-9.72-1-25.44-4-34.92-12.39a13.69,13.69,0,0,1-4.5-10A16.6,16.6,0,0,1,84.87,36.87ZM40,88h80v32H40Zm16,48h64v64H56Zm144,64H136V136h64Zm16-80H136V88h80v32Z"/></svg>',
    'hand-heart': HAND_HEART,
  };

  // Cobalt (people) for the community sections; crimson (program) elsewhere.
  const SECONDARY_SECTIONS = new Set(['who-can-join']);

  function ecCard(slug: string, head: string, body: string): string {
    return `<section class="card ec-card bg-base-100 border border-base-300 shadow-sm" data-section="${slug}">`
      + `<div class="card-body">${head}<div class="section-body">${body}</div></div></section>`;
  }

  // About is the worked example of the design language: each H2 section
  // becomes a DaisyUI module whose treatment fits its job, with a Phosphor
  // icon carrying the meaning and color carrying the role.
  function decorateAbout(html: string): string {
    const { intro, sections } = parseSections(html);
    if (!sections.length) return html;
    const decorated = sections.map(({ h2, title, slug, rest }) => {
      if (!h2) return rest;
      const icon = ICON[slug] ?? '';
      const tone = SECONDARY_SECTIONS.has(slug) ? ' ec-chip-secondary' : '';
      const chip = icon ? `<span class="ec-chip${tone}">${icon}</span>` : '';
      const head = `<div class="ec-head">${chip}<h2 class="card-title">${title}</h2></div>`;

      // Caution → DaisyUI soft warning alert.
      if (slug === 'risks') {
        return `<div role="alert" class="alert alert-soft alert-warning ec-risks" data-section="risks">`
          + `${icon}<div class="ec-risks-body"><h2>${title}</h2>${rest}</div></div>`;
      }

      // Values → DaisyUI numbered list.
      if (slug === 'program-philosophy') {
        let n = 0;
        const body = rest
          .replace('<ul>', '<ul class="list ec-tenets">')
          .replace(/<li>/g, () => `<li class="list-row"><span class="badge badge-primary ec-num">${++n}</span><div>`)
          .replace(/<\/li>/g, '</div></li>');
        return ecCard('program-philosophy', head, body);
      }

      // Paired info → split into two labelled panels with their own icons.
      if (slug === 'costs-volunteers') {
        const colIcons = [ICON.gift, ICON['hand-heart']];
        let i = 0;
        const body = '<div class="ec-split">'
          + rest.replace(/<p>([\s\S]*?)<\/p>/g, (_full, p) => {
              const ic = colIcons[i] ?? '';
              const toneClass = i === 1 ? ' ec-chip-secondary' : '';
              i += 1;
              return `<div class="ec-panel"><span class="ec-chip ec-chip-sm${toneClass}">${ic}</span><p>${p}</p></div>`;
            })
          + '</div>';
        return ecCard('costs-volunteers', head, body);
      }

      // Single call to act → centered card, waiver link promoted to a button.
      if (slug === 'getting-started') {
        const body = rest.replace('class="download-link"', 'class="download-link btn btn-primary"');
        return `<section class="card ec-card ec-cta bg-base-100 border border-primary/30 shadow-sm" data-section="getting-started">`
          + `<div class="card-body items-center text-center">${chip}<h2 class="card-title">${title}</h2>`
          + `<div class="section-body">${body}</div></div></section>`;
      }

      return ecCard(slug, head, rest);
    }).join('');
    return intro + decorated;
  }
</script>

<script lang="ts">
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';

  let { data }: { data: PageData } = $props();
  let { page } = $derived(data);

  let bodyHtml = $derived(page.slug === 'about' ? decorateAbout(page.html) : wrapSections(page.html));
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

  .static-page :global(.post-body > p:first-child) {
    font-size: 1.27rem;
    line-height: 1.5;
    font-weight: 500;
    color: var(--color-heading);
    margin-block-end: 1.6rem;
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
       caution  → DaisyUI .alert.alert-soft.alert-warning
       values   → DaisyUI .list / .list-row + numbered .badge
       action   → DaisyUI .btn.btn-primary
       icon chip→ .ec-chip — a tinted square holding a Phosphor glyph

     Color encodes role, never decoration:
       primary  (crimson) = the program and the one action
       secondary(cobalt)  = people / community
       warning  (amber)   = caution  ─────────────────────────────────── */

  /* Intro: lede stays bold; the clarifying paragraph reads quieter */
  .static-page[data-page="about"] :global(.post-body > p:not(:first-child)) {
    color: var(--color-muted);
    font-size: 0.97rem;
  }

  /* Rhythm between modules */
  .static-page[data-page="about"] :global(.ec-card),
  .static-page[data-page="about"] :global(.ec-risks) {
    margin-block-start: 1.25rem;
  }

  /* Heading row: icon chip + title (DaisyUI .card-title), margins reset */
  .static-page[data-page="about"] :global(.ec-head) {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-block-end: 0.25rem;
  }
  .static-page[data-page="about"] :global(.ec-head h2),
  .static-page[data-page="about"] :global(.ec-cta h2) {
    margin: 0;
    font-size: 1.3rem;
  }
  .static-page[data-page="about"] :global(.section-body > :first-child) {
    margin-block-start: 0;
  }

  /* The icon chip primitive (.ec-chip / .ec-glyph) lives globally in
     app.css so any page can reuse it. Below: only About-specific tuning. */

  /* Caution callout (DaisyUI alert): top-align icon, quiet the prose */
  .static-page[data-page="about"] :global(.ec-risks) {
    align-items: flex-start;
  }
  .static-page[data-page="about"] :global(.ec-risks .ec-glyph) {
    inline-size: 1.5rem;
    block-size: 1.5rem;
    margin-block-start: 0.1rem;
  }
  .static-page[data-page="about"] :global(.ec-risks-body h2) {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
  }
  .static-page[data-page="about"] :global(.ec-risks-body p) {
    margin: 0;
    font-size: 0.92rem;
  }

  /* Values list (DaisyUI list): numbered, bold lead-in per tenet */
  .static-page[data-page="about"] :global(.ec-tenets) {
    margin-block-start: 0.5rem;
  }
  .static-page[data-page="about"] :global(.ec-tenets .list-row) {
    padding-inline: 0;
    align-items: start;
  }
  .static-page[data-page="about"] :global(.ec-num) {
    font-family: var(--font-display);
    font-weight: 800;
    margin-block-start: 0.15rem;
  }
  .static-page[data-page="about"] :global(.ec-tenets strong) {
    display: block;
    font-family: var(--font-display);
    color: var(--color-heading);
    margin-block-end: 0.1rem;
  }

  /* Paired info: two labelled panels, each with its own icon */
  .static-page[data-page="about"] :global(.ec-split) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-block-start: 0.25rem;
  }
  .static-page[data-page="about"] :global(.ec-panel) {
    background: var(--color-base-200);
    border-radius: 0.75rem;
    padding: 1.1rem 1.2rem;
  }
  .static-page[data-page="about"] :global(.ec-panel .ec-chip) {
    margin-block-end: 0.6rem;
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
  .static-page[data-page="about"] :global(.ec-cta .btn) {
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
    .static-page :global(.post-body > p:first-child) {
      animation: none;
    }
  }
</style>
