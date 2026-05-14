<script lang="ts">
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';
  import ContactForm from '$lib/components/ContactForm.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Contact — {SITE_TITLE}</title>
</svelte:head>

<h1 class="page-title">Contact</h1>

<ContactForm {form} />
