<script lang="ts">
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';
  import { formatDate, tagUrl } from '$lib/utils';
  import { riseStyle } from '$lib/motion';

  let { data }: { data: PageData } = $props();
  let { post } = $derived(data);
</script>

<svelte:head>
  <title>{post.title} — {SITE_TITLE}</title>
  {#if post.description}
    <meta name="description" content={post.description} />
  {/if}
</svelte:head>

<article class="post">
  <header>
    <time class="post-date" datetime={post.date}>{formatDate(post.date)}</time>
    <h1 class="page-title">{post.title}</h1>
  </header>

  <div class="post-module" style={riseStyle(0)}>
    <div class="post-body">
      {@html post.html}
    </div>

    {#if post.tags.length}
      <ul class="post-tags">
        {#each post.tags as tag (tag)}
          <li class="post-tag"><a href={tagUrl(tag)}>#{tag}</a></li>
        {/each}
      </ul>
    {/if}
  </div>
</article>

<a href="/" class="back-link">← Home</a>

<style>
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
</style>
