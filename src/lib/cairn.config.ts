// ecnordic.ski's cairn adapter. The site-specific half of the CMS: which repo to commit to, the
// editable concepts and their schema, the directive component registry, and the engine render the
// editor preview mirrors. One defineFields declaration per concept is the single source of truth
// for the editor form, the validator, and the inferred frontmatter type.
import { defineAdapter, defineFields } from '@glw907/cairn-cms';
import { ecnordicRegistry } from './markdown/components.js';
import { markdownToHtml } from './utils.js';
import { ICON_PATHS } from './markdown/icons.js';
import { POST_TAGS, siteConfig, siteEmail } from './config.js';

export const cairn = defineAdapter({
  siteName: siteConfig.siteName ?? 'EC Nordic',
  content: {
    posts: {
      dir: 'src/content/posts',
      label: 'Posts',
      schema: defineFields([
        { type: 'text', name: 'title', label: 'Title', required: true },
        { type: 'date', name: 'date', label: 'Date', required: true },
        { type: 'textarea', name: 'description', label: 'Description', required: true, rows: 2 },
        { type: 'tags', name: 'tags', label: 'Tags', options: POST_TAGS },
        { type: 'boolean', name: 'draft', label: 'Draft (hidden from the live site)' },
      ]),
    },
    pages: {
      dir: 'src/content/pages',
      label: 'Pages',
      schema: defineFields([{ type: 'text', name: 'title', label: 'Title', required: true }]),
    },
  },
  backend: {
    owner: 'glw907',
    repo: 'ecnordic-ski',
    branch: 'main',
    appId: '3847496',
    installationId: '135372268',
  },
  sender: { from: siteEmail.sender ?? 'noreply@ecnordic.ski' },
  render: (md, opts) => markdownToHtml(md, opts),
  registry: ecnordicRegistry,
  icons: ICON_PATHS,
  navMenu: {
    configPath: 'src/lib/site.config.yaml',
    menuName: 'primary',
    label: 'Navigation',
    maxDepth: 2,
  },
});
