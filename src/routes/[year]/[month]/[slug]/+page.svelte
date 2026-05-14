<script lang="ts">
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';
  import { formatDate, tagUrl } from '$lib/utils';

  let { data }: { data: PageData } = $props();
  let { post } = $derived(data);
</script>

<svelte:head>
  <title>{post.title} — {SITE_TITLE}</title>
  {#if post.description}
    <meta name="description" content={post.description} />
  {/if}
</svelte:head>

<article>
  <header>
    <time class="post-date" datetime={post.date}>{formatDate(post.date)}</time>
    <h1 class="page-title">{post.title}</h1>
  </header>

  <div class="post-body">
    {@html post.html}
  </div>

  {#if post.tags.length}
    <ul class="post-tags">
      {#each post.tags as tag}
        <li class="post-tag"><a href={tagUrl(tag)}>#{tag}</a></li>
      {/each}
    </ul>
  {/if}
</article>

<a href="/" class="back-link">← Home</a>
