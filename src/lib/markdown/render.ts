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

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkEcDirectives)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeEcPrimitives)
  .use(rehypeSlug)
  .use(rehypeStringify);

export async function renderMarkdown(content: string): Promise<string> {
  const file = await processor.process(content);
  return String(file);
}
