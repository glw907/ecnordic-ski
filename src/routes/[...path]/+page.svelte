<script lang="ts">
  import type { PageData } from './$types';
  import { CairnHead } from '@glw907/cairn-cms/delivery/head';
  import { SITE_TITLE } from '$lib/config';
  import { formatDate, tagUrl } from '$lib/utils';
  import { riseStyle } from '$lib/motion';

  let { data }: { data: PageData } = $props();
</script>

<CairnHead seo={data.seo} title={`${data.title} — ${SITE_TITLE}`} />

{#if data.concept === 'posts'}
  <article class="post">
    <header>
      <time class="post-date" datetime={data.date}>{formatDate(data.date)}</time>
      <h1 class="page-title">{data.title}</h1>
    </header>

    <div class="post-module" style={riseStyle(0)}>
      <div class="post-body">
        {@html data.html}
      </div>

      {#if data.tags.length}
        <ul class="post-tags">
          {#each data.tags as tag (tag)}
            <li class="post-tag"><a href={tagUrl(tag)}>#{tag}</a></li>
          {/each}
        </ul>
      {/if}
    </div>
  </article>

  <a href="/" class="back-link">← Home</a>
{:else}
  <article class="static-page" data-page={data.slug}>
    <h1 class="page-title">{data.title}</h1>

    <div class="post-body">
      {@html data.html}
    </div>
  </article>
{/if}

<style>
  /* Post presentation rules, copied from the old post +page.svelte. */
  .post {
    animation: page-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .post-module {
    animation: module-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: var(--rise, 0s);
  }
  @media (prefers-reduced-motion: reduce) {
    .post,
    .post-module {
      animation: none;
    }
  }

  /* ─── Static content page shell ─────────────────────────── */
  .static-page {
    max-width: 46rem;
    animation: page-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* Intro paragraphs fill the content column, so their right edge lines up with
     the cards below (no narrow measure leaving an off right margin). */
  .static-page :global(.post-body > p) {
    max-width: none;
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

  /* Lede: the first paragraph of any static page. A gentle step above the
     standard body (set in app.css), a touch larger and a touch heavier (medium,
     a loaded Alegreya Sans weight), same colour, so it reads as the intro
     without shouting. Site-wide and uniform; no per-page lede sizing. */
  .static-page :global(.post-body > p:first-child) {
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.6;
    margin-block-end: 1.2rem;
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

  /* ─── About: worked example of the EC Nordic design language ──────
     The page is built from a small, reusable kit (see the Pass-4 design
     spec). Each primitive maps to a DaisyUI component so it's idiomatic
     and portable; the scoped CSS here only tunes spacing and the one
     custom primitive (the icon chip):

       module   → DaisyUI .card (subtle: border + shadow-sm)
       caution  → .ec-alert.ec-alert-caution: subtle alert, amber chrome
       grid     → .ec-grid (global): card body of parallel titled points
       action   → DaisyUI .btn.btn-primary
       icon     → .ec-icon bare glyph (default); .ec-chip tile = one focal accent

     Color encodes role, never decoration:
       primary  (crimson) = the program and the one action
       secondary(cobalt)  = people / community
       warning  (amber)   = caution  ─────────────────────────────────── */

  /* A decorated page orchestrates its own entrance per module (below), so the
     shared whole-page rise would double the transform, so let the cascade carry
     it. (About and training both decorate; plain pages keep the page rise.) */
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) {
    animation: none;
  }

  /* Rhythm between modules, and the staggered entrance: each module rises in on its
     own delay so the page resolves as one top-to-bottom cascade continuing the title
     (0s) and lede (0.06s) above it. The delay comes from the engine's data-rise ordinal
     (mapped just below), not an inline style, so the sanitize floor can drop `style`. */
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.ec-card),
  .static-page[data-page="crewlab"] :global(.ec-passage),
  .static-page[data-page="about"] :global(.ec-alert) {
    margin-block-start: 1.4rem;
    animation: module-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  /* data-rise ordinal → cascade delay (0.16 + n*0.04s). The engine stamps the index on
     each top-level module; past the enumerated set a module holds the final step. */
  .static-page :global([data-rise]) { animation-delay: 0.64s; }
  .static-page :global([data-rise="0"]) { animation-delay: 0.16s; }
  .static-page :global([data-rise="1"]) { animation-delay: 0.20s; }
  .static-page :global([data-rise="2"]) { animation-delay: 0.24s; }
  .static-page :global([data-rise="3"]) { animation-delay: 0.28s; }
  .static-page :global([data-rise="4"]) { animation-delay: 0.32s; }
  .static-page :global([data-rise="5"]) { animation-delay: 0.36s; }
  .static-page :global([data-rise="6"]) { animation-delay: 0.40s; }
  .static-page :global([data-rise="7"]) { animation-delay: 0.44s; }
  .static-page :global([data-rise="8"]) { animation-delay: 0.48s; }
  .static-page :global([data-rise="9"]) { animation-delay: 0.52s; }
  .static-page :global([data-rise="10"]) { animation-delay: 0.56s; }
  .static-page :global([data-rise="11"]) { animation-delay: 0.60s; }
  /* A titled prose passage carries the section head + body at full page width,
     with no card border/wash. Prose is the kit's default (see design doc). */
  .static-page[data-page="crewlab"] :global(.ec-passage) {
    padding-inline: 0.25rem;
  }
  @keyframes module-rise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }

  /* Heading row: icon chip + title (DaisyUI .card-title), margins reset */
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.ec-head) {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    /* heading breathes from its body; the innermost step of the page's
       vertical rhythm (0.5 → 0.9 → 1.4rem, each ~1.5× the last) */
    margin-block-end: 0.5rem;
  }
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.ec-head h2),
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.ec-cta h2) {
    margin: 0;
    font-size: 1.3rem;
  }
  /* Bare header glyph: a touch larger than inline so it anchors the title */
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.ec-head .ec-glyph) {
    inline-size: 1.6rem;
    block-size: 1.6rem;
  }
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.section-body > :first-child) {
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
  .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.ec-cta .btn) {
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
    .static-page:is([data-page="about"], [data-page="training"], [data-page="crewlab"]) :global(.ec-card),
    .static-page[data-page="crewlab"] :global(.ec-passage),
    .static-page[data-page="about"] :global(.ec-alert) {
      animation: none;
    }
  }
</style>
