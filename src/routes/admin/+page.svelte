<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="flex items-center justify-between">
  <h1 class="text-2xl font-bold">EC Nordic CMS</h1>
  <form method="POST" action="/admin/auth/logout">
    <button type="submit" class="btn btn-ghost btn-sm">Sign out</button>
  </form>
</div>

<p class="mt-2 text-sm opacity-70">
  Signed in as {data.editor?.name} ({data.editor?.email})
</p>

<div class="mt-8 rounded-box border border-base-300 bg-base-100 p-6">
  <p class="opacity-70">No content collections wired yet — that arrives in Pass B.</p>
</div>
