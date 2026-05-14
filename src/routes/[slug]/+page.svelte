<script lang="ts">
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';

  let { data }: { data: PageData } = $props();
  let { page } = $derived(data);
</script>

<svelte:head>
  <title>{page.title} — {SITE_TITLE}</title>
</svelte:head>

<h1 class="page-title">{page.title}</h1>

<div class="post-body">
  {@html page.html}
</div>
