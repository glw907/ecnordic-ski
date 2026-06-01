// ecnordic.ski's cairn adapter. The site-specific half of the CMS.
//
// Everything here is what the engine deliberately does NOT know: which repo to commit to,
// which concepts are editable, each concept's frontmatter fields + validator, the directive
// component registry, and the sanitized render the editor preview mirrors. 907.life supplies
// its own adapter of the same shape; the engine consumes only this.
import type { CairnAdapter } from '@glw907/cairn-cms';
import { ecnordicRegistry } from './markdown/components.js';
import { validatePostFrontmatter, validatePageFrontmatter } from './content-schema.js';
import { markdownToHtml } from './utils.js';
import { POST_TAGS, siteConfig, siteEmail } from './config.js';

export const cairn: CairnAdapter = {
  siteName: siteConfig.siteName ?? 'EC Nordic',
  content: {
    posts: {
      dir: 'src/content/posts',
      label: 'Posts',
      fields: [
        { type: 'text', name: 'title', label: 'Title', required: true },
        { type: 'date', name: 'date', label: 'Date', required: true },
        { type: 'textarea', name: 'description', label: 'Description', required: true, rows: 2 },
        { type: 'tags', name: 'tags', label: 'Tags', options: POST_TAGS },
        { type: 'boolean', name: 'draft', label: 'Draft (hidden from the live site)' },
      ],
      validate: validatePostFrontmatter,
    },
    pages: {
      dir: 'src/content/pages',
      label: 'Pages',
      fields: [{ type: 'text', name: 'title', label: 'Title', required: true }],
      validate: validatePageFrontmatter,
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
  // The site's one renderer: the editor preview and (in Pass 1b) every public page call it.
  render: (md) => markdownToHtml(md),
  // The directive component registry, exposed so the editor's insert-component palette
  // reads the same single declaration the public render uses.
  registry: ecnordicRegistry,
  // The header menu, managed from /admin/nav and committed to the site-config YAML.
  navMenu: {
    configPath: 'src/lib/site.config.yaml',
    menuName: 'primary',
    label: 'Navigation',
    maxDepth: 2,
  },
};
