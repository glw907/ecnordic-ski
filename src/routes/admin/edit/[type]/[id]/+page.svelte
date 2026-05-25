<script lang="ts">
  import { browser } from '$app/environment';
  import { Carta, MarkdownEditor } from 'carta-md';
  import 'carta-md/default.css';
  import { previewCartaOptions } from '$lib/cairn/carta';
  import { remarkEcPlugins, rehypeEcPlugins } from '$lib/markdown/render';
  import { POST_TAGS } from '$lib/config';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Body is editable state; the Carta editor's preview runs the exact site plugin set, so it
  // matches the live page (risk #3). A hidden input carries the current value into the form.
  // svelte-ignore state_referenced_locally — seeding from the initial load is intended.
  let body = $state(data.body);

  const carta = new Carta(
    previewCartaOptions({ remarkPlugins: remarkEcPlugins, rehypePlugins: rehypeEcPlugins }),
  );

  // svelte-ignore state_referenced_locally — form defaults from the initial load.
  const fm = data.frontmatter as Record<string, unknown>;
  const fmString = (key: string): string => (typeof fm[key] === 'string' ? (fm[key] as string) : '');
  const selectedTags = new Set(Array.isArray(fm.tags) ? fm.tags.map(String) : []);
</script>

<svelte:head>
  <title>Edit {data.title} · EC Nordic CMS</title>
</svelte:head>

<div class="flex items-center justify-between gap-4">
  <div>
    <a href="/admin" class="text-sm opacity-70 hover:underline">← Back</a>
    <h1 class="mt-1 text-2xl font-bold">{data.title}</h1>
    <p class="text-sm opacity-60">{data.label} · {data.path}</p>
  </div>
</div>

{#if data.saved}
  <div class="alert alert-success mt-6"><span>Saved — committed to main; the site will redeploy.</span></div>
{:else if data.error}
  <div class="alert alert-error mt-6"><span>{data.error}</span></div>
{/if}

<form method="POST" action="/admin/save" class="mt-6 flex flex-col gap-5">
  <input type="hidden" name="type" value={data.type} />
  <input type="hidden" name="id" value={data.id} />

  <fieldset class="grid gap-4 rounded-box border border-base-300 bg-base-100 p-6">
    <label class="flex flex-col gap-1">
      <span class="text-sm font-medium">Title</span>
      <input name="title" required value={fmString('title')} class="input input-bordered w-full" />
    </label>

    {#if data.type === 'posts'}
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Date</span>
        <input type="date" name="date" required value={fmString('date')} class="input input-bordered w-full" />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Description</span>
        <textarea name="description" required rows="2" class="textarea textarea-bordered w-full"
          >{fmString('description')}</textarea>
      </label>

      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium">Tags</span>
        <div class="flex flex-wrap gap-3">
          {#each POST_TAGS as tag (tag)}
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" name="tags" value={tag} checked={selectedTags.has(tag)} class="checkbox checkbox-sm" />
              {tag}
            </label>
          {/each}
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="draft" checked={fm.draft === true} class="checkbox checkbox-sm" />
        Draft (hidden from the live site)
      </label>
    {/if}
  </fieldset>

  <div class="rounded-box border border-base-300 bg-base-100 p-2">
    <input type="hidden" name="body" value={body} />
    {#if browser}
      <MarkdownEditor {carta} bind:value={body} mode="tabs" />
    {:else}
      <textarea bind:value={body} rows="20" class="textarea textarea-bordered w-full font-mono"></textarea>
    {/if}
  </div>

  <div class="flex justify-end">
    <button type="submit" class="btn btn-primary">Save &amp; commit</button>
  </div>
</form>
