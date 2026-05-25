import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkEcDirectives from './remark-ec-directives';
import rehypeEcPrimitives from './rehype-ec-primitives';

// Exported so cairn-cms can inject the same set into Carta's preview pipeline —
// keeping the editor preview byte-for-byte identical to the live site.

/** remark plugins: directive syntax → EC directive nodes. Injected before remark-rehype. */
export const remarkEcPlugins = [remarkDirective, remarkEcDirectives];
/** rehype plugins: raw HTML passthrough, EC primitives, heading slugs. Injected after remark-rehype. */
export const rehypeEcPlugins = [rehypeRaw, rehypeEcPrimitives, rehypeSlug];

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkEcPlugins)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeEcPlugins)
  .use(rehypeStringify);

export async function renderMarkdown(content: string): Promise<string> {
  const file = await processor.process(content);
  return String(file);
}
