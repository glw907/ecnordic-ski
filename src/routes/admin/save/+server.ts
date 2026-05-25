import type { RequestHandler } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { CAIRN_REPO, CAIRN_COLLECTIONS, type CairnCollectionType } from '$lib/config';
import { validatePostFrontmatter, validatePageFrontmatter } from '$lib/content-schema';
import { serializeMarkdown } from '$lib/cairn/content';
import { commitFile, installationToken } from '$lib/cairn/github';

function isCollectionType(type: string): type is CairnCollectionType {
  return type in CAIRN_COLLECTIONS;
}

// SvelteKit's built-in same-origin check protects this POST (cross-origin form posts → 403),
// so no separate CSRF token is needed — same posture as the contact remote function.
export const POST: RequestHandler = async ({ request, platform, locals }) => {
  const editor = locals.editor;
  if (!editor) throw error(401, 'Not signed in');

  const env = platform?.env;
  if (!env?.GITHUB_APP_ID || !env.GITHUB_APP_INSTALLATION_ID || !env.GITHUB_APP_PRIVATE_KEY_B64) {
    throw error(500, 'GitHub App is not configured');
  }

  const form = await request.formData();
  const type = String(form.get('type') ?? '');
  const id = String(form.get('id') ?? '');
  const body = String(form.get('body') ?? '');
  if (!isCollectionType(type) || !id) throw error(400, 'Bad request');
  const { label, dir } = CAIRN_COLLECTIONS[type];

  // Build frontmatter from the posted fields and validate against the site schema; a bad
  // field bounces back to the editor with the validator's message rather than 500ing.
  const filename = `${id}.md`;
  const rawPost = {
    title: form.get('title'),
    date: form.get('date'),
    draft: form.get('draft') === 'on',
    description: form.get('description'),
    tags: form.getAll('tags').map(String),
  };

  let frontmatter: object;
  try {
    frontmatter =
      type === 'posts'
        ? validatePostFrontmatter(rawPost, filename)
        : validatePageFrontmatter({ title: form.get('title') }, filename);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid frontmatter';
    throw redirect(303, `/admin/edit/${type}/${id}?error=${encodeURIComponent(message)}`);
  }

  const markdown = serializeMarkdown(frontmatter, body);
  const token = await installationToken({
    appId: env.GITHUB_APP_ID,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    privateKeyB64: env.GITHUB_APP_PRIVATE_KEY_B64,
  });

  await commitFile(
    CAIRN_REPO,
    `${dir}/${id}.md`,
    markdown,
    { message: `Update ${label.toLowerCase()}: ${id}`, author: { name: editor.name, email: editor.email } },
    token,
  );

  throw redirect(303, `/admin/edit/${type}/${id}?saved=1`);
};
