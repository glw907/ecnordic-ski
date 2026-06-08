<script lang="ts">
  import { ConfirmPage } from '@glw907/cairn-cms/components';

  let { data }: { data: { token: string; siteName: string; error: string | null; csrf: string } } =
    $props();
</script>

<ConfirmPage {data} />
