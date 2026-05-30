// A defense-in-depth floor over the engine's rendered HTML. The directive output is
// engine-controlled, but the render pipeline runs rehype-raw, so authored raw HTML (the
// `<a class="download-link">` in a :::cta, and anything else an editor commits) passes
// straight through. An editor could commit a <script>. This pass sanitizes the final string
// while allowlisting every element and attribute the EC directive vocabulary emits.
//
// What the directives produce (from the characterization snapshot): section/div/span wrappers
// with classes and a `--rise` custom property in `style`; h2/h3 anchors with `id`; a `nav`
// table of contents with `aria-label`; an `ec-alert` div with `role="alert"`; inline glyph
// `svg`/`path`; and authored `a.download-link` anchors carrying `target`/`rel`. Classes, ids,
// and the rise style do not execute, so they are allowed; scripts, event-handler attributes,
// and unsafe URL schemes fall to the default schema's core rules and are dropped.
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema, type Options as Schema } from 'rehype-sanitize';

type PropertyDefinition = NonNullable<Schema['attributes']>[string][number];

// The default schema restricts `className` to a fixed value list on many elements (`a` to
// `data-footnote-backref`, `section` to `footnotes`, headings and lists to the task/footnote
// classes), encoded as a `["className", ...values]` tuple that overrides the global `*` rule.
// The directive output carries arbitrary presentational classes on those same tags, so strip
// any className tuple and allow `className` as a free attribute. Classes do not execute, so
// this is safe; scripts, event handlers, and unsafe URLs still fall to the default core rules.
function freeClassName(attrs: readonly PropertyDefinition[] | undefined): PropertyDefinition[] {
  const kept = (attrs ?? []).filter(
    (a) => !(Array.isArray(a) && a[0] === 'className') && a !== 'className',
  );
  return [...kept, 'className'];
}

// Free className on every element the default schema constrains, so no directive class is lost.
const freedAttributes: Record<string, PropertyDefinition[]> = {};
for (const [tag, attrs] of Object.entries(defaultSchema.attributes ?? {})) {
  freedAttributes[tag] = freeClassName(attrs);
}

const schema: Schema = {
  ...defaultSchema,
  // Keep heading anchors and in-page links intact: emit ids verbatim, not `user-content-`-prefixed.
  clobberPrefix: '',
  clobber: [],
  tagNames: [...(defaultSchema.tagNames ?? []), 'section', 'nav', 'svg', 'path'],
  attributes: {
    ...freedAttributes,
    '*': [...freeClassName(defaultSchema.attributes?.['*']), 'style', 'id', 'role', 'ariaHidden', 'ariaLabel'],
    a: [...freeClassName(defaultSchema.attributes?.a), 'target', 'rel', 'download'],
    svg: ['className', 'viewBox', 'fill', 'ariaHidden', 'role', 'width', 'height'],
    path: ['d', 'fill'],
  },
};

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

/** Sanitize a rendered HTML fragment, keeping the directive output and dropping hostile markup. */
export async function sanitizeHtml(html: string): Promise<string> {
  return String(await processor.process(html));
}
