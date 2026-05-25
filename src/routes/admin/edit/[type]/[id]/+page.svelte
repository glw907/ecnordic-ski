<script lang="ts">
  import { browser } from '$app/environment';
  import { Carta, Markdown } from 'carta-md';
  import 'carta-md/default.css';
  import { previewCartaOptions } from '$lib/cairn/carta';
  import { remarkEcPlugins, rehypeEcPlugins } from '$lib/markdown/render';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Preview runs the exact site plugin set, so it matches the live page (risk #3).
  const carta = new Carta(
    previewCartaOptions({ remarkPlugins: remarkEcPlugins, rehypePlugins: rehypeEcPlugins }),
  );
</script>

<div class="flex items-center justify-between gap-4">
  <div>
    <a href="/admin" class="text-sm opacity-70 hover:underline">← Back</a>
    <h1 class="mt-1 text-2xl font-bold">{data.title}</h1>
    <p class="text-sm opacity-60">{data.label} · {data.path}</p>
  </div>
</div>

<div class="mt-6 rounded-box border border-base-300 bg-base-100 p-6">
  <p class="mb-4 text-sm opacity-60">
    Render-only preview. Editing and saving arrive in Pass C.
  </p>
  {#if browser}
    <div class="prose max-w-none">
      <Markdown {carta} value={data.body} />
    </div>
  {:else}
    <p class="opacity-50">Loading preview…</p>
  {/if}
</div>
