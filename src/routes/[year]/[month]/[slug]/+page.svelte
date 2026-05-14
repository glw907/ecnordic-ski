<script lang="ts">
  import { SITE_TITLE } from '$lib/config';
  import { formatDate } from '$lib/utils';

  let { data } = $props();
  let { post } = $derived(data);
</script>

<svelte:head>
  <title>{post.title} — {SITE_TITLE}</title>
  <meta name="description" content={post.description} />
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
        <li class="post-tag"><a href="/tags/{tag}">#{tag}</a></li>
      {/each}
    </ul>
  {/if}
</article>

<p class="back-link"><a href="/">← Home</a></p>
