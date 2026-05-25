import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import matter from 'gray-matter';
import { CAIRN_REPO, CAIRN_COLLECTIONS, type CairnCollectionType } from '$lib/config';
import { readRaw } from '$lib/cairn/github';

function isCollectionType(type: string): type is CairnCollectionType {
  return type in CAIRN_COLLECTIONS;
}

export const load: PageServerLoad = async ({ params }) => {
  if (!isCollectionType(params.type)) throw error(404, 'Unknown collection');
  const { label, dir } = CAIRN_COLLECTIONS[params.type];

  const path = `${dir}/${params.id}.md`;
  const raw = await readRaw(CAIRN_REPO, path);
  if (raw === null) throw error(404, 'Content not found');

  // Split frontmatter from body server-side (gray-matter already runs here for the site
  // build). Pass B previews only the body; the frontmatter form arrives in Pass C.
  const { data: frontmatter, content: body } = matter(raw);

  return {
    type: params.type,
    id: params.id,
    label,
    path,
    body,
    title: typeof frontmatter.title === 'string' ? frontmatter.title : params.id,
  };
};
