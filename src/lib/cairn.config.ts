// ecnordic.ski's cairn adapter. The site-specific half of the CMS.
//
// Everything here is what cairn-core deliberately does NOT know: which repo to commit to,
// which collections are editable, each collection's frontmatter fields + validator, and the
// remark/rehype plugin set the preview must mirror (the live render's directive pipeline).
// 907.life supplies its own adapter of the same shape; cairn-core consumes only this.
import type { CairnAdapter } from '@glw907/cairn-cms';
import { remarkEcPlugins, rehypeEcPlugins } from './markdown/render';
import { ecnordicRegistry } from './markdown/components';
import { validatePostFrontmatter, validatePageFrontmatter } from './content-schema';
import { POST_TAGS, siteConfig } from './config';

export const cairn: CairnAdapter = {
  siteName: siteConfig.siteName,
  sender: siteConfig.email?.sender ?? 'noreply@ecnordic.ski',
  backend: { owner: 'glw907', repo: 'ecnordic-ski', branch: 'main' },
  preview: { remarkPlugins: remarkEcPlugins, rehypePlugins: rehypeEcPlugins },
  // The component registry that drives the render pipeline above; exposed here so the
  // editor's future insert-component palette reads the same single declaration (R10a).
  registry: ecnordicRegistry,
  collections: [
    {
      type: 'posts',
      label: 'Posts',
      dir: 'src/content/posts',
      fields: [
        { type: 'text', name: 'title', label: 'Title', required: true },
        { type: 'date', name: 'date', label: 'Date', required: true },
        { type: 'textarea', name: 'description', label: 'Description', required: true, rows: 2 },
        { type: 'tags', name: 'tags', label: 'Tags', options: POST_TAGS },
        { type: 'boolean', name: 'draft', label: 'Draft (hidden from the live site)' },
      ],
      validate: validatePostFrontmatter,
    },
    {
      type: 'pages',
      label: 'Pages',
      dir: 'src/content/pages',
      kind: 'page',
      fields: [{ type: 'text', name: 'title', label: 'Title', required: true }],
      validate: validatePageFrontmatter,
    },
  ],
};
