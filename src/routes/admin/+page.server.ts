import type { PageServerLoad } from './$types';
import { CAIRN_REPO, CAIRN_COLLECTIONS } from '$lib/config';
import { listMarkdown, type RepoFile } from '$lib/cairn/github';

interface Collection {
  type: string;
  label: string;
  files: RepoFile[];
  error?: string;
}

export const load: PageServerLoad = async () => {
  const collections: Collection[] = await Promise.all(
    Object.entries(CAIRN_COLLECTIONS).map(async ([type, { label, dir }]) => {
      try {
        return { type, label, files: await listMarkdown(CAIRN_REPO, dir) };
      } catch (err) {
        // A failed listing (rate limit, network) shouldn't 500 the whole admin.
        return { type, label, files: [], error: err instanceof Error ? err.message : 'Failed to load' };
      }
    }),
  );
  return { collections };
};
