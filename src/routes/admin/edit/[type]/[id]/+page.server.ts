import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import matter from 'gray-matter';
import { cairn } from '$lib/cairn.config';
import { findCollection } from '$lib/cairn/adapter';
import { readRaw } from '$lib/cairn/github';

export const load: PageServerLoad = async ({ params, url }) => {
  const collection = findCollection(cairn, params.type);
  if (!collection) throw error(404, 'Unknown collection');

  const path = `${collection.dir}/${params.id}.md`;
  const raw = await readRaw(cairn.backend, path);
  if (raw === null) throw error(404, 'Content not found');

  // Split frontmatter from body server-side; the editor form binds to the frontmatter and
  // the Carta editor binds to the body, and /admin/save reassembles them on commit.
  const { data: frontmatter, content: body } = matter(raw);

  return {
    type: params.type,
    id: params.id,
    label: collection.label,
    fields: collection.fields,
    path,
    body,
    frontmatter,
    title: typeof frontmatter.title === 'string' ? frontmatter.title : params.id,
    saved: url.searchParams.get('saved') === '1',
    error: url.searchParams.get('error'),
  };
};
