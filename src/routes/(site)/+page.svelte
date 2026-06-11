<script lang="ts">
  import type { PageData } from './$types';
  import { formatDate, formatShortDate, tagUrl } from '$lib/utils';
  import { HOMEPAGE_FEATURED_COUNT } from '$lib/config';

  let { data }: { data: PageData } = $props();
</script>

<!-- Hero: welcome + recent posts side by side -->
<div class="hero-grid">

  <!-- Welcome hero: photo with the intro panel overlapping it, so the
       opening reads as a designed moment rather than a story card. The
       parenthetical ECXC takes fireweed so the abbreviation registers as
       the brand on first contact. -->
  <div class="welcome-hero">
    <div class="welcome-photo">
      <img src="/images/ec-xc-hero.webp" alt="ECXC athletes training" />
    </div>
    <div class="welcome-panel">
      <h2 class="welcome-heading">
        Welcome to East Community Cross&nbsp;Country <span class="welcome-abbr">(ECXC)</span>
      </h2>
      <div class="welcome-blurb">{@html data.welcomeHtml}</div>
      <a href="/about" class="welcome-link">Learn more →</a>
    </div>
  </div>

  <!-- Recent posts card -->
  <div class="recent-card">
    <h2 class="section-label">Recent Posts</h2>
    {#if data.posts.length > 0}
      <ul class="recent-list">
        {#each data.posts.slice(0, 3) as post}
          <li class="recent-row">
            <a href={post.permalink} class="recent-title">{post.title}</a>
            <time class="recent-date" datetime={post.date}>{formatShortDate(post.date)}</time>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="no-posts">No posts yet.</p>
    {/if}
    <a href="/archives" class="recent-more">see all posts <span class="recent-arr">→</span></a>
  </div>

</div>

<!-- News -->
{#if data.featured || data.posts.length > HOMEPAGE_FEATURED_COUNT}
  <h2 id="news" class="section-label news-label">News & Updates</h2>
  <section class="news-section">

    {#if data.featured}
      <article class="featured-post">
        <time class="post-date" datetime={data.featured.date}>{formatDate(data.featured.date)}</time>
        <h3 class="featured-title">
          <a href={data.featured.permalink}>{data.featured.title}</a>
        </h3>
        <div class="post-body">
          {@html data.featured.html}
        </div>
        {#if data.featured.tags.length > 0}
          <ul class="post-tags" aria-label="Tags">
            {#each data.featured.tags as tag}
              <li><a href={tagUrl(tag)} class="post-tag">{tag}</a></li>
            {/each}
          </ul>
        {/if}
      </article>
    {/if}

    {#if data.posts.length > HOMEPAGE_FEATURED_COUNT}
      <h3 class="older-heading">Earlier</h3>
      <ol class="post-list" aria-label="Earlier posts">
        {#each data.posts.slice(HOMEPAGE_FEATURED_COUNT) as post}
          <li class="post-entry">
            <div class="post-meta">
              <time class="post-date" datetime={post.date}>{formatDate(post.date)}</time>
              {#if post.tags.length > 0}
                <ul class="post-tags post-tags-inline" aria-label="Tags">
                  {#each post.tags as tag}
                    <li><a href={tagUrl(tag)} class="post-tag">{tag}</a></li>
                  {/each}
                </ul>
              {/if}
            </div>
            <h3 class="post-title">
              <a href={post.permalink}>{post.title}</a>
            </h3>
            {#if post.description}
              <p class="post-description">{post.description}</p>
            {/if}
          </li>
        {/each}
      </ol>
    {/if}

  </section>
{/if}

<style>
  /* ─── Shared label ──────────────────────────────────────── */
  .section-label {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--color-muted);
    margin: 0 0 0.9rem;
  }

  /* ─── Hero grid ─────────────────────────────────────────── */
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 1rem;
    margin-block: 2rem 1.75rem;
    align-items: stretch;
  }

  /* ─── Welcome hero ──────────────────────────────────────── */
  /* The intro panel overlaps the photo's bottom edge, so the two read as
     one composed layer stack instead of a stacked story card. The panel's
     fireweed top rule is the same brand punctuation as the page-title dash. */
  .welcome-hero {
    display: flex;
    flex-direction: column;
  }

  .welcome-photo {
    overflow: hidden;
    border-radius: 12px;
    background: var(--color-base-200);
  }

  .welcome-photo img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Anchored left rather than centered: the asymmetric overlap gives the
     composition direction and leaves photo visible on the right. */
  .welcome-panel {
    position: relative;
    margin: -2.75rem 4.5rem 0 1rem;
    padding: 1.4rem 1.5rem 1.5rem;
    background: var(--color-base-100);
    border: 1px solid var(--color-border-subtle);
    border-top: 3px solid var(--color-primary);
    border-radius: 12px;
    box-shadow: var(--shadow-float);
  }

  .welcome-heading {
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 2.6vw, 1.65rem);
    font-weight: 800;
    line-height: 1.18;
    color: var(--color-heading);
    text-wrap: balance;
    margin: 0 0 0.75rem;
  }

  .welcome-abbr {
    color: var(--color-primary);
    white-space: nowrap;
  }

  .welcome-blurb {
    margin: 0 0 1.1rem;
  }
  /* The body is rendered from home.md, so its paragraphs come through {@html} and
     need :global to reach. The heading carries the hierarchy now, so the
     blurb reads at body weight. */
  .welcome-blurb :global(p) {
    font-size: 0.98rem;
    line-height: 1.55;
    color: var(--color-body);
    margin: 0 0 0.7rem;
  }
  .welcome-blurb :global(p:last-child) {
    margin-bottom: 0;
  }

  .welcome-link {
    font-family: var(--font-display);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-spruce-accent);
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: opacity 0.15s ease;
  }
  .welcome-link:hover { opacity: 0.75; }

  /* ─── Recent posts card ─────────────────────────────────── */
  /* A whisper of spruce wash sets the sidebar off from the page without
     competing with the hero; its label takes the working green to match
     the card's top rule. */
  .recent-card {
    background: color-mix(in oklab, var(--color-spruce-accent) 4%, var(--color-base-100));
    border: 1px solid var(--color-border-subtle);
    border-top: 3px solid var(--color-spruce-accent);
    border-radius: 12px;
    padding: 1.25rem 1.5rem 1.5rem;
    box-shadow: var(--shadow-rest);
    display: flex;
    flex-direction: column;
  }

  .recent-card .section-label {
    color: var(--color-spruce-accent);
  }

  .recent-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    flex: 1;
  }

  .recent-row {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding-block: 0.65rem;
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .recent-row:last-child { border-bottom: none; }

  .recent-title {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-heading);
    line-height: 1.25;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .recent-title:hover { color: var(--color-primary); }

  /* Dates are metadata styled as eyebrows, so they wear the working green
     like every other ambient accent; pink stays on the hover affordance. */
  .recent-date {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    color: var(--color-spruce-accent);
    line-height: 1.3;
  }

  .no-posts {
    font-size: 0.85rem;
    font-style: italic;
    color: var(--color-muted);
    margin: 0 0 0.9rem;
  }

  .recent-more {
    font-family: var(--font-display);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-spruce-accent);
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: opacity 0.15s ease;
  }
  .recent-more:hover { opacity: 0.75; }
  .recent-arr {
    display: inline-block;
    transition: transform 0.15s ease;
  }
  .recent-more:hover .recent-arr { transform: translateX(2px); }
  @media (prefers-reduced-motion: reduce) {
    .recent-more:hover .recent-arr { transform: none; }
  }

  /* ─── News section ──────────────────────────────────────── */
  .news-label { margin-block-start: 2rem; }

  .news-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ─── Featured post card ────────────────────────────────── */
  .featured-post {
    background: var(--color-base-100);
    border: 1px solid var(--color-border-subtle);
    border-radius: 12px;
    padding: 1.75rem 2rem;
    box-shadow: var(--shadow-rest);
  }

  .featured-title {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 5vw, 2.2rem);
    font-weight: 700;
    line-height: 1.18;
    margin: 0 0 1.5rem;
    letter-spacing: -0.02em;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .featured-title a {
    color: var(--color-heading);
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .featured-title a:hover { color: var(--color-primary); }

  /* ─── Older post cards ──────────────────────────────────── */
  .older-heading {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--color-muted);
    margin: 0.5rem 0 0;
  }

  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .post-entry {
    background: var(--color-base-100);
    border: 1px solid var(--color-border-subtle);
    border-radius: 10px;
    padding: 1.1rem 1.5rem;
    box-shadow: var(--shadow-rest);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .post-entry:hover {
    border-color: var(--color-border);
    box-shadow: var(--shadow-lift);
  }

  .post-title {
    font-family: var(--font-display);
    font-size: clamp(1.05rem, 3vw, 1.2rem);
    font-weight: 700;
    line-height: 1.25;
    margin: 0.3rem 0 0;
    letter-spacing: -0.01em;
  }

  .post-title a {
    color: var(--color-heading);
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .post-title a:hover { color: var(--color-primary); }

  .post-meta {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  .post-tags-inline { margin-block-start: 0; gap: 0.1rem 0.5rem; }

  .post-description {
    font-size: 0.88rem;
    font-style: italic;
    line-height: 1.55;
    color: var(--color-muted);
    margin: 0.35rem 0 0;
  }

  /* ─── Mobile: stack cards, shrink the panel overlap ─────── */
  @media (max-width: 600px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }
    .welcome-panel {
      margin: -1.5rem 1.5rem 0 0.5rem;
      padding: 1.1rem 1.1rem 1.25rem;
    }
  }
</style>
