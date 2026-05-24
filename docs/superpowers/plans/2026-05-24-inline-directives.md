# Inline Container Directives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the implicit slug→primitive mapping in `decorate*()` with explicit inline container directives in the markdown, rendered through a pure remark/rehype AST pipeline, so each page's styling is visible in the file and robust to heading renames.

**Architecture:** `markdownToHtml` becomes a `unified` pipeline: `remark-parse → remark-gfm → remark-directive → remark-ec-directives (mark) → remark-rehype(allowDangerousHtml) → rehype-raw → rehype-slug → rehype-ec-primitives (restructure) → rehype-stringify`. The mark step stamps each known directive node with `data-*` markers; the restructure step rewrites those marked hast elements into the exact HTML the current `ecCard`/`ecCta`/alert/split builders emit (icons injected as real `hastscript` SVG nodes). All HTML-string regex (`parseSections`, `wrapSections`, `boldParasToGrid`, the three `decorate*` functions) is deleted. All five static pages migrate to directives.

**Tech Stack:** SvelteKit · TypeScript · unified/remark/rehype (remark-directive@4, remark-rehype@11, rehype-raw@7, rehype-slug@6, rehype-stringify@10, hastscript@9) · Vitest · DaisyUI v5 / Tailwind v4 (CSS unchanged).

**Spec:** `docs/superpowers/specs/2026-05-24-inline-directives-design.md`

**Render-identical contract:** About / Training / CrewLAB must render pixel-identical (screenshot-verified). Resources / Volunteers are a deliberate, small migration onto the kit (no identical target). The restructure plugin emits the same classes the builders did; `data-section` attributes are dropped (no CSS/JS consumes them — Task 14 verifies); headings now carry `rehype-slug` ids (invisible — does not affect pixels).

---

## Reference: directive vocabulary

Two optional attributes throughout: `icon=NAME` (a key in `ICON_PATHS`) and `role=ROLE` (`primary` default · `secondary` · `caution`).

| Directive | Output |
|---|---|
| `:::card{icon=NAME role=ROLE}` | `<section class="card ec-card …">` → `.card-body` → `.ec-head`(icon + `h2.card-title`) + `.section-body` |
| `:::grid{icon=NAME role=ROLE}` | with an `h2`: a grid card (as card, body list → `ul.ec-grid`); without an `h2` (nested): the bare `ul.ec-grid` lifted out |
| `:::alert{role=caution}` | `<div role="alert" class="ec-alert ec-alert-caution">` → `.ec-alert-body` → `h2`(icon prepended inline) + body; `role` selects the variant + default icon (caution→warning) |
| `:::cta{icon=NAME}` | `<section class="card ec-card ec-cta …">` → `.card-body.items-center.text-center` → `span.ec-chip`(icon) + `h2.card-title` + `.section-body` (contained `a.download-link` gains `btn btn-primary`) |
| `::::split` ⊃ `:::panel{icon=NAME role=ROLE}` | card with `.ec-head`(title only, no icon) + `.section-body` → `.ec-split` of `.ec-panel`s (each: icon span + its content) |
| `:::passage{icon=NAME}` | `<section class="ec-passage">` → `.ec-head`(icon + `h2.card-title`) + `.section-body` (no card chrome) |
| *(no directive)* | rendered as-is |

Nesting uses remark-directive's colon-count rule: a container that holds other directives opens with **four** colons (`::::split`, `::::card`), inner ones use three.

`ICON_PATHS` keys (glyph name ← source in current `[slug]/+page.svelte`):
`path`←`ICON['what-we-do']` · `warning`←`ICON['risks']` · `users-three`←`ICON['who-can-join']` · `compass`←`ICON['program-philosophy']` · `flag`←`ICON['getting-started']` · `calendar-blank`←`ICON['schedule']` · `backpack`←`ICON['what-to-bring']` · `tent`←`ICON['talkeetna-camp']` · `chat-circle`←`ICON['why-we-use-it']` · `person-simple-run`←`ICON['for-athletes']` · `hand-coins`←`PANEL_ICONS[0]` · `handshake`←`PANEL_ICONS[1]`.

---

## File structure

- **Create** `src/lib/markdown/icons.ts` — `ICON_PATHS` map + `glyph(name)` returning a hast `svg` element.
- **Create** `src/lib/markdown/remark-ec-directives.ts` — mark step (mdast).
- **Create** `src/lib/markdown/rehype-ec-primitives.ts` — restructure step (hast).
- **Modify** `src/lib/utils.ts` — rewrite `markdownToHtml` to the new pipeline.
- **Modify** `src/routes/[slug]/+page.svelte` — delete the `<script module>` block; render `page.html` directly; `<style>` unchanged.
- **Modify** `src/content/pages/{about,training,crewlab,resources,volunteers}.md` — add directives.
- **Modify** `package.json` — add deps, remove `remark-html`.
- **Modify** `docs/design-language.md` — document the vocabulary; register `chat-circle` / `person-simple-run`; update worked-example references.
- **Create** `src/tests/markdown/directives.test.ts` — pipeline unit tests.

---

## Task 1: Install dependencies

**Files:** Modify `package.json` (+ lockfile).

- [ ] **Step 1: Install runtime + type deps**

Run:
```bash
cd /home/glw907/Projects/ecnordic-ski
npm install unified remark-parse remark-directive remark-rehype rehype-raw rehype-slug rehype-stringify hastscript
npm install -D @types/mdast @types/hast mdast-util-directive
npm uninstall remark-html
```
Expected: installs succeed; `remark-html` removed from `package.json`. `remark` and `remark-gfm` stay.

- [ ] **Step 2: Verify versions resolved to expected majors**

Run: `npm ls remark-directive remark-rehype rehype-raw rehype-slug rehype-stringify hastscript`
Expected: `remark-directive@4.x`, `remark-rehype@11.x`, `rehype-raw@7.x`, `rehype-slug@6.x`, `rehype-stringify@10.x`, `hastscript@9.x`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add remark/rehype directive pipeline dependencies"
```

---

## Task 2: Icon module

**Files:** Create `src/lib/markdown/icons.ts`; Test `src/tests/markdown/icons.test.ts`.

- [ ] **Step 1: Write the failing test**

`src/tests/markdown/icons.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { toHtml } from 'hast-util-to-html';
import { ICON_PATHS, glyph } from '$lib/markdown/icons';

describe('icons', () => {
  it('exposes every glyph the pages reference', () => {
    for (const name of [
      'path', 'warning', 'users-three', 'compass', 'flag', 'calendar-blank',
      'backpack', 'tent', 'chat-circle', 'person-simple-run', 'hand-coins', 'handshake',
    ]) {
      expect(ICON_PATHS[name], name).toBeTruthy();
    }
  });

  it('builds an ec-glyph svg with the path data', () => {
    const html = toHtml(glyph('flag'), { space: 'html' });
    expect(html).toContain('<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">');
    expect(html).toContain(`<path d="${ICON_PATHS['flag']}">`);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/tests/markdown/icons.test.ts`
Expected: FAIL — cannot resolve `$lib/markdown/icons`.

- [ ] **Step 3: Create the module**

`src/lib/markdown/icons.ts` — copy each `d=""` path string verbatim from the `ICON` / `PANEL_ICONS` maps currently in `src/routes/[slug]/+page.svelte` (lines ~53–79), keyed by the glyph names below. Copying the exact strings keeps the rendered glyphs byte-identical.

```ts
import { s } from 'hastscript';
import type { Element } from 'hast';

// Phosphor (regular) path data, keyed by glyph name. Sourced verbatim from the
// pre-Pass-5 ICON / PANEL_ICONS maps so the rendered glyphs are unchanged.
export const ICON_PATHS: Record<string, string> = {
  path: 'M200,168a32.06,…',                 // ← ICON['what-we-do']
  warning: 'M236.8,188.09,…',               // ← ICON['risks']
  'users-three': 'M244.8,150.4a8,…',        // ← ICON['who-can-join']
  compass: 'M128,24A104,…',                 // ← ICON['program-philosophy']
  flag: 'M42.76,50A8,…',                    // ← ICON['getting-started']
  'calendar-blank': 'M208,32H184V24a8,…',   // ← ICON['schedule']
  backpack: 'M168,40.58V32A24,…',           // ← ICON['what-to-bring']
  tent: 'M255.31,188.75l-64-144A8,…',       // ← ICON['talkeetna-camp']
  'chat-circle': 'M128,24A104,104,0,0,0,36.18,…', // ← ICON['why-we-use-it']
  'person-simple-run': 'M120,56a32,…',      // ← ICON['for-athletes']
  'hand-coins': 'M230.33,141.06a24.43,…',   // ← PANEL_ICONS[0]
  handshake: 'M254.3,107.91,…',             // ← PANEL_ICONS[1]
};

// Build the inline SVG glyph as a real hast node (no raw-string injection).
// Mirrors the old svg() helper: class ec-glyph, 256 viewBox, currentColor fill.
export function glyph(name: string): Element {
  return s(
    'svg',
    { className: ['ec-glyph'], viewBox: '0 0 256 256', fill: 'currentColor', ariaHidden: 'true' },
    [s('path', { d: ICON_PATHS[name] })],
  );
}
```

> When implementing: open `src/routes/[slug]/+page.svelte`, copy the full `d` string for each listed source into the matching key. Do not abbreviate — the `…` above are placeholders for the real path data.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/tests/markdown/icons.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown/icons.ts src/tests/markdown/icons.test.ts
git commit -m "Add Phosphor icon map + hast glyph builder"
```

---

## Task 3: Mark step + pipeline skeleton + restructure scaffolding

This task wires the full pipeline end to end with the **card** primitive working, so every later primitive is just a new branch.

**Files:** Create `src/lib/markdown/remark-ec-directives.ts`, `src/lib/markdown/rehype-ec-primitives.ts`; Modify `src/lib/utils.ts`; Test `src/tests/markdown/directives.test.ts`.

- [ ] **Step 1: Write the failing tests**

`src/tests/markdown/directives.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '$lib/utils';

describe('pipeline baseline', () => {
  it('renders unmarked content as plain prose', async () => {
    const html = await markdownToHtml('Just a paragraph.\n');
    expect(html.trim()).toBe('<p>Just a paragraph.</p>');
  });

  it('adds slug ids to headings', async () => {
    const html = await markdownToHtml(':::card{icon=path}\n## Sign Up\n\nx\n:::\n');
    expect(html).toContain('id="sign-up"');
  });
});

describe('card directive', () => {
  it('renders a module card with icon + heading + body', async () => {
    const html = await markdownToHtml(':::card{icon=path}\n## What we do\n\nBody text.\n:::\n');
    expect(html).toContain('<section class="card ec-card bg-base-100 border border-base-300 shadow-sm"');
    expect(html).toContain('<div class="card-body">');
    expect(html).toContain('<div class="ec-head"><span class="ec-icon"><svg class="ec-glyph"');
    expect(html).toContain('<h2 class="card-title"');
    expect(html).toContain('What we do');
    expect(html).toContain('<div class="section-body"><p>Body text.</p></div>');
  });

  it('applies the secondary role to the icon', async () => {
    const html = await markdownToHtml(':::card{icon=users-three role=secondary}\n## Who\n\nx\n:::\n');
    expect(html).toContain('<span class="ec-icon ec-icon-secondary">');
  });

  it('staggers the first primitive at --rise:0.16s', async () => {
    const html = await markdownToHtml(':::card{icon=path}\n## A\n\nx\n:::\n');
    expect(html).toContain('style="--rise:0.16s"');
  });

  it('leaves a non-grid card list as a plain list', async () => {
    const html = await markdownToHtml(':::card{icon=path}\n## A\n\n- one\n- two\n:::\n');
    expect(html).toContain('<ul>\n<li>one</li>');
    expect(html).not.toContain('ec-grid');
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/tests/markdown/directives.test.ts`
Expected: FAIL — `markdownToHtml` still uses `remark-html`; directives render as raw `:::` text.

- [ ] **Step 3: Create the mark step**

`src/lib/markdown/remark-ec-directives.ts`:
```ts
import type { Root } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import { visit } from 'unist-util-visit';

const PRIMITIVES = new Set(['card', 'grid', 'alert', 'cta', 'split', 'panel', 'passage']);

// An alert's role picks its default icon (caution → the warning glyph).
const ALERT_DEFAULT_ICON: Record<string, string> = { caution: 'warning' };

// Stamp each known container directive with data-* markers carrying its
// primitive name, icon, and role. No structure is built here — rehype-ec-primitives
// rewrites the marked elements once their children have been converted to hast.
export default function remarkEcDirectives() {
  return (tree: Root) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (!PRIMITIVES.has(node.name)) return;
      const attrs = node.attributes ?? {};
      const role = attrs.role || undefined;
      let icon = attrs.icon || undefined;
      if (node.name === 'alert' && !icon && role) icon = ALERT_DEFAULT_ICON[role];

      const properties: Record<string, string> = { dataPrimitive: node.name };
      if (icon) properties.dataIcon = icon;
      if (role) properties.dataRole = role;

      const data = node.data ?? (node.data = {});
      data.hName = 'div';
      data.hProperties = properties;
    });
  };
}
```

- [ ] **Step 4: Create the restructure step (scaffolding + card)**

`src/lib/markdown/rehype-ec-primitives.ts`:
```ts
import type { Root, Element, ElementContent } from 'hast';
import { h } from 'hastscript';
import { glyph } from './icons';

function isElement(node: ElementContent | undefined): node is Element {
  return !!node && node.type === 'element';
}

function riseStyle(idx: number): string {
  return `--rise:${(0.16 + idx * 0.04).toFixed(2)}s`;
}

// Bare glyph span; secondary role adds the cobalt modifier.
function iconSpan(name: string, role?: string): Element {
  const className = role === 'secondary' ? ['ec-icon', 'ec-icon-secondary'] : ['ec-icon'];
  return h('span', { className }, [glyph(name)]);
}

// Pull the section's <h2> out, retag it .card-title, and build the .ec-head row
// (optional icon + heading). Returns the head plus the remaining body children.
function splitHead(node: Element, withIcon: boolean): { head: Element; rest: ElementContent[] } {
  const children = node.children as ElementContent[];
  const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
  const h2 = children[i] as Element;
  h2.properties = { ...h2.properties, className: ['card-title'] };
  const rest = children.filter((_, j) => j !== i);
  const icon = node.properties?.dataIcon as string | undefined;
  const role = node.properties?.dataRole as string | undefined;
  const headKids: ElementContent[] = [];
  if (withIcon && icon) headKids.push(iconSpan(icon, role));
  headKids.push(h2);
  return { head: h('div', { className: ['ec-head'] }, headKids), rest };
}

const CARD_CLASS = ['card', 'ec-card', 'bg-base-100', 'border', 'border-base-300', 'shadow-sm'];

function cardShell(classes: string[], rise: string | undefined, body: ElementContent[]): Element {
  const properties: Record<string, unknown> = { className: classes };
  if (rise) properties.style = rise;
  return h('section', properties, [h('div', { className: ['card-body'] }, body)]);
}

function buildCard(node: Element, rise?: string): Element {
  const { head, rest } = splitHead(node, true);
  return cardShell(CARD_CLASS, rise, [head, h('div', { className: ['section-body'] }, rest)]);
}

// Recurse into a node's children, transforming any nested primitive sections
// (a grid inside a card, panels inside a split) WITHOUT a rise stagger.
function transformChildren(children: ElementContent[]): ElementContent[] {
  return children.map((c) => {
    if (isElement(c) && c.properties?.dataPrimitive) return transform(c);
    if (isElement(c)) c.children = transformChildren(c.children as ElementContent[]);
    return c;
  });
}

function transform(node: Element, rise?: string): Element {
  node.children = transformChildren(node.children as ElementContent[]);
  switch (node.properties?.dataPrimitive as string) {
    case 'card': return buildCard(node, rise);
    default: return node; // other primitives added in later tasks
  }
}

// Top-level primitives get a document-order rise stagger; everything else
// (lede, intro paragraphs, the page-toc nav) passes through untouched.
export default function rehypeEcPrimitives() {
  return (tree: Root) => {
    let idx = 0;
    tree.children = (tree.children as ElementContent[]).map((child) => {
      if (isElement(child) && child.properties?.dataPrimitive) {
        return transform(child, riseStyle(idx++));
      }
      if (isElement(child)) child.children = transformChildren(child.children as ElementContent[]);
      return child;
    });
  };
}
```

- [ ] **Step 5: Rewrite `markdownToHtml`**

Replace the top of `src/lib/utils.ts` (the `remark`/`remark-html` imports and the `markdownToHtml` function) with:
```ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkEcDirectives from './markdown/remark-ec-directives';
import rehypeEcPrimitives from './markdown/rehype-ec-primitives';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkEcDirectives)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeEcPrimitives)
  .use(rehypeStringify);

export async function markdownToHtml(content: string): Promise<string> {
  const file = await processor.process(content);
  return String(file);
}
```
Leave the rest of `utils.ts` (date helpers, `postUrl`, `tagUrl`) unchanged.

- [ ] **Step 6: Run to verify the tests pass**

Run: `npx vitest run src/tests/markdown/directives.test.ts`
Expected: PASS (all card + baseline tests).

- [ ] **Step 7: Commit**

```bash
git add src/lib/markdown/remark-ec-directives.ts src/lib/markdown/rehype-ec-primitives.ts src/lib/utils.ts src/tests/markdown/directives.test.ts
git commit -m "Add directive pipeline with the card primitive"
```

---

## Task 4: Passage primitive

**Files:** Modify `src/lib/markdown/rehype-ec-primitives.ts`; Modify `src/tests/markdown/directives.test.ts`.

- [ ] **Step 1: Add the failing test**

Append to `src/tests/markdown/directives.test.ts`:
```ts
describe('passage directive', () => {
  it('renders a titled prose passage with no card chrome', async () => {
    const html = await markdownToHtml(':::passage{icon=chat-circle}\n## Why we use it\n\nReasons.\n:::\n');
    expect(html).toContain('<section class="ec-passage" style="--rise:0.16s">');
    expect(html).toContain('<div class="ec-head"><span class="ec-icon"><svg');
    expect(html).toContain('<h2 class="card-title"');
    expect(html).toContain('<div class="section-body"><p>Reasons.</p></div>');
    expect(html).not.toContain('ec-card');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t passage`
Expected: FAIL — passage renders as a bare `<div>` (default branch).

- [ ] **Step 3: Implement `buildPassage` and register it**

Add to `rehype-ec-primitives.ts` (after `buildCard`):
```ts
function buildPassage(node: Element, rise?: string): Element {
  const { head, rest } = splitHead(node, true);
  const properties: Record<string, unknown> = { className: ['ec-passage'] };
  if (rise) properties.style = rise;
  return h('section', properties, [head, h('div', { className: ['section-body'] }, rest)]);
}
```
Add the case in `transform`'s switch:
```ts
    case 'passage': return buildPassage(node, rise);
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t passage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown/rehype-ec-primitives.ts src/tests/markdown/directives.test.ts
git commit -m "Add passage primitive"
```

---

## Task 5: Alert primitive

**Files:** Modify `src/lib/markdown/rehype-ec-primitives.ts`; Modify `src/tests/markdown/directives.test.ts`.

- [ ] **Step 1: Add the failing test**

Append:
```ts
describe('alert directive', () => {
  it('renders a subtle caution alert with the icon inline in the label', async () => {
    const html = await markdownToHtml(':::alert{role=caution}\n## Risks\n\nFalls happen.\n:::\n');
    expect(html).toContain('<div role="alert" class="ec-alert ec-alert-caution" style="--rise:0.16s">');
    expect(html).toContain('<div class="ec-alert-body">');
    expect(html).toContain('<h2 id="risks"><svg class="ec-glyph"');
    expect(html).toContain('Risks</h2>');
    expect(html).toContain('<p>Falls happen.</p>');
    expect(html).not.toContain('card-title');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t alert`
Expected: FAIL.

- [ ] **Step 3: Implement `buildAlert` and register it**

Add to `rehype-ec-primitives.ts`:
```ts
function buildAlert(node: Element, rise?: string): Element {
  const children = node.children as ElementContent[];
  const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
  const h2 = children[i] as Element;
  const icon = node.properties?.dataIcon as string | undefined;
  if (icon) (h2.children as ElementContent[]).unshift(glyph(icon)); // icon inline at the label head
  const rest = children.filter((_, j) => j !== i);
  const role = node.properties?.dataRole as string;
  const properties: Record<string, unknown> = { role: 'alert', className: ['ec-alert', `ec-alert-${role}`] };
  if (rise) properties.style = rise;
  return h('div', properties, [h('div', { className: ['ec-alert-body'] }, [h2, ...rest])]);
}
```
Add the case:
```ts
    case 'alert': return buildAlert(node, rise);
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t alert`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown/rehype-ec-primitives.ts src/tests/markdown/directives.test.ts
git commit -m "Add alert primitive"
```

---

## Task 6: Grid primitive (grid card + nested bare grid)

**Files:** Modify `src/lib/markdown/rehype-ec-primitives.ts`; Modify `src/tests/markdown/directives.test.ts`.

- [ ] **Step 1: Add the failing tests**

Append:
```ts
describe('grid directive', () => {
  it('renders a grid card: heading + body list becomes ec-grid', async () => {
    const html = await markdownToHtml(
      ':::grid{icon=compass}\n## Philosophy\n\nIntro.\n\n- **One** a\n- **Two** b\n:::\n',
    );
    expect(html).toContain('<section class="card ec-card');
    expect(html).toContain('<div class="ec-head"><span class="ec-icon"><svg');
    expect(html).toContain('<div class="section-body"><p>Intro.</p>');
    expect(html).toContain('<ul class="ec-grid">');
    expect(html).toContain('<li><strong>One</strong> a</li>');
  });

  it('lifts a nested grid (no heading) to a bare ec-grid list', async () => {
    const html = await markdownToHtml(
      '::::card{icon=tent}\n## Camp\n\n### Logistics\n\n:::grid\n- **Travel** by car\n:::\n::::\n',
    );
    expect(html).toContain('<h3 id="logistics">Logistics</h3>');
    expect(html).toContain('<ul class="ec-grid"><li><strong>Travel</strong> by car</li></ul>');
    // the nested grid did not become its own card
    expect(html.match(/ec-card/g)?.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t grid`
Expected: FAIL.

- [ ] **Step 3: Implement `buildGrid` and register it**

Add to `rehype-ec-primitives.ts`:
```ts
function markFirstList(children: ElementContent[]): Element | undefined {
  const ul = children.find((c) => isElement(c) && c.tagName === 'ul') as Element | undefined;
  if (ul) ul.properties = { ...ul.properties, className: ['ec-grid'] };
  return ul;
}

function buildGrid(node: Element, rise?: string): Element {
  const children = node.children as ElementContent[];
  const hasHeading = children.some((c) => isElement(c) && c.tagName === 'h2');
  const ul = markFirstList(children);
  if (!hasHeading) return ul ?? node; // nested use: emit the bare ec-grid list
  const { head, rest } = splitHead(node, true);
  return cardShell(CARD_CLASS, rise, [head, h('div', { className: ['section-body'] }, rest)]);
}
```
Add the case:
```ts
    case 'grid': return buildGrid(node, rise);
```

> Note: `splitHead` reuses the already-classed `ul`; `markFirstList` runs before `splitHead` so `rest` contains the `ul.ec-grid`.

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t grid`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown/rehype-ec-primitives.ts src/tests/markdown/directives.test.ts
git commit -m "Add grid primitive (grid card + nested bare grid)"
```

---

## Task 7: CTA primitive

**Files:** Modify `src/lib/markdown/rehype-ec-primitives.ts`; Modify `src/tests/markdown/directives.test.ts`.

- [ ] **Step 1: Add the failing test**

Append:
```ts
describe('cta directive', () => {
  it('renders a centered CTA card, chip icon, and promotes the download link', async () => {
    const html = await markdownToHtml(
      ':::cta{icon=flag}\n## Getting started\n\nDo this.\n\n<a href="/waiver" class="download-link">Get it →</a>\n:::\n',
    );
    expect(html).toContain('<section class="card ec-card ec-cta bg-base-100 border border-primary/30 shadow-sm" style="--rise:0.16s">');
    expect(html).toContain('<div class="card-body items-center text-center">');
    expect(html).toContain('<span class="ec-chip"><svg class="ec-glyph"');
    expect(html).toContain('<h2 class="card-title"');
    expect(html).toContain('class="download-link btn btn-primary"');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t cta`
Expected: FAIL.

- [ ] **Step 3: Implement `buildCta` and register it**

Add to `rehype-ec-primitives.ts`:
```ts
// Append btn classes to the authored `a.download-link` (raw HTML, reparsed by
// rehype-raw), wherever it sits in the body.
function promoteDownloadLink(children: ElementContent[]): void {
  for (const c of children) {
    if (!isElement(c)) continue;
    const cls = c.properties?.className;
    if (c.tagName === 'a' && Array.isArray(cls) && cls.includes('download-link')) {
      c.properties.className = [...cls, 'btn', 'btn-primary'];
    } else {
      promoteDownloadLink(c.children as ElementContent[]);
    }
  }
}

const CTA_CLASS = ['card', 'ec-card', 'ec-cta', 'bg-base-100', 'border', 'border-primary/30', 'shadow-sm'];

function buildCta(node: Element, rise?: string): Element {
  const children = node.children as ElementContent[];
  const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
  const h2 = children[i] as Element;
  h2.properties = { ...h2.properties, className: ['card-title'] };
  const rest = children.filter((_, j) => j !== i);
  promoteDownloadLink(rest);
  const icon = node.properties?.dataIcon as string;
  const properties: Record<string, unknown> = { className: CTA_CLASS };
  if (rise) properties.style = rise;
  return h('section', properties, [
    h('div', { className: ['card-body', 'items-center', 'text-center'] }, [
      h('span', { className: ['ec-chip'] }, [glyph(icon)]),
      h2,
      h('div', { className: ['section-body'] }, rest),
    ]),
  ]);
}
```
Add the case:
```ts
    case 'cta': return buildCta(node, rise);
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t cta`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markdown/rehype-ec-primitives.ts src/tests/markdown/directives.test.ts
git commit -m "Add cta primitive"
```

---

## Task 8: Split + panel primitives

**Files:** Modify `src/lib/markdown/rehype-ec-primitives.ts`; Modify `src/tests/markdown/directives.test.ts`.

- [ ] **Step 1: Add the failing test**

Append:
```ts
describe('split + panel directives', () => {
  it('renders a card with a heading and two iconned panels', async () => {
    const html = await markdownToHtml(
      '::::split\n## Costs\n\n:::panel{icon=hand-coins}\n**Free.** No fee.\n:::\n\n:::panel{icon=handshake role=secondary}\n**Help.** Pitch in.\n:::\n::::\n',
    );
    expect(html).toContain('<section class="card ec-card');
    expect(html).toContain('<div class="ec-head"><h2 class="card-title"'); // head has no icon
    expect(html).toContain('<div class="section-body"><div class="ec-split">');
    expect(html).toContain('<div class="ec-panel"><span class="ec-icon"><svg');
    expect(html).toContain('<div class="ec-panel"><span class="ec-icon ec-icon-secondary"><svg');
    expect(html).toContain('<strong>Free.</strong> No fee.');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/tests/markdown/directives.test.ts -t split`
Expected: FAIL.

- [ ] **Step 3: Implement `buildPanel` + `buildSplit` and register them**

Add to `rehype-ec-primitives.ts`:
```ts
function buildPanel(node: Element): Element {
  const icon = node.properties?.dataIcon as string | undefined;
  const role = node.properties?.dataRole as string | undefined;
  const kids: ElementContent[] = [];
  if (icon) kids.push(iconSpan(icon, role));
  kids.push(...(node.children as ElementContent[]));
  return h('div', { className: ['ec-panel'] }, kids);
}

function buildSplit(node: Element, rise?: string): Element {
  // Panels were already turned into .ec-panel divs by transformChildren.
  const children = node.children as ElementContent[];
  const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
  const h2 = children[i] as Element;
  h2.properties = { ...h2.properties, className: ['card-title'] };
  const panels = children.filter(
    (c) => isElement(c) && Array.isArray(c.properties?.className) && c.properties.className.includes('ec-panel'),
  );
  const head = h('div', { className: ['ec-head'] }, [h2]); // no icon at the split head
  const body = h('div', { className: ['section-body'] }, [h('div', { className: ['ec-split'] }, panels)]);
  return cardShell(CARD_CLASS, rise, [head, body]);
}
```
Add the cases:
```ts
    case 'split': return buildSplit(node, rise);
    case 'panel': return buildPanel(node);
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/tests/markdown/directives.test.ts`
Expected: PASS (all primitives green).

- [ ] **Step 5: Run type check**

Run: `npm run check`
Expected: no errors in `src/lib/markdown/**`. (The unused `decorate*` code in `+page.svelte` still type-checks — gutted in Task 13.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/markdown/rehype-ec-primitives.ts src/tests/markdown/directives.test.ts
git commit -m "Add split + panel primitives"
```

---

## Task 9: Migrate about.md

**Files:** Modify `src/content/pages/about.md`.

- [ ] **Step 1: Rewrite the body with directives**

Keep the frontmatter and the two intro paragraphs (the lede + the "informal and volunteer-run" paragraph) exactly as-is, unmarked. Wrap the sections:
```markdown
:::card{icon=path}
## What we do

<the three existing paragraphs, unchanged>
:::

:::alert{role=caution}
## Risks

<the existing paragraph, unchanged>
:::

:::card{icon=users-three role=secondary}
## Who can join

<the three existing paragraphs, unchanged>
:::

:::grid{icon=compass}
## Program philosophy

Five core principles guide our program design and the decisions we make for every athlete:

- **Total person first.** <unchanged>
- **Open to any committed athlete.** <unchanged>
- **High school sports matter.** <unchanged>
- **A lasting bond with trails and skiing.** <unchanged>
- **Support the community that supports you.** <unchanged>
:::

::::split
## Costs & volunteers

:::panel{icon=hand-coins}
**Free to join.** <unchanged paragraph>
:::

:::panel{icon=handshake role=secondary}
**Lend a hand.** <unchanged paragraph>
:::
::::

:::cta{icon=flag}
## Getting started

Fill out the [waiver](/waiver) and bring it to your first session, or send it ahead through the [contact form](/contact). Questions are welcome there too.

<a href="/waiver" class="download-link">Get the waiver →</a>
:::
```
Preserve all inner prose, links, and bold leads verbatim — only the wrappers and heading markers change. (Replace each `<unchanged>` above with the real text from the current file.)

- [ ] **Step 2: Type check + build**

Run: `npm run check && npm run build`
Expected: clean; build succeeds.

- [ ] **Step 3: Screenshot-verify identical** (see *Verification protocol* at the end)

Capture About at desktop + mobile, light + dark, and compare to the current live render. Reconcile any difference before committing.

- [ ] **Step 4: Commit**

```bash
git add src/content/pages/about.md
git commit -m "Migrate About to inline directives"
```

---

## Task 10: Migrate training.md

**Files:** Modify `src/content/pages/training.md`.

- [ ] **Step 1: Rewrite the body with directives**

Keep the lede paragraph and the `<nav class="page-toc">…</nav>` block unchanged and unmarked (the nav stays authored raw HTML). Replace every `<h2 id="…">X</h2>` with a directive-wrapped `## X` (rehype-slug regenerates the same ids):
```markdown
:::card{icon=calendar-blank}
## Schedule

<the two existing paragraphs incl. the [PLACEHOLDER] line, unchanged>
:::

:::grid{icon=path}
## What We Do

- **Running.** <unchanged>
- **Roller-skiing.** <unchanged>
- **Mountain biking.** <unchanged>
- **Strength and dryland.** <unchanged>

Most sessions mix two or three of these. You won't do the same thing every day.
:::

:::card{icon=users-three role=secondary}
## Who Can Join

<the existing paragraph + [PLACEHOLDER] line, unchanged>
:::

:::card{icon=backpack}
## What to Bring

- Water and snacks
- Trail running shoes
- Helmet (required for roller-skiing and mountain biking — no exceptions)
- Layers. Anchorage summer weather is variable.

Roller skis and poles aren't provided. [PLACEHOLDER — add any loaner equipment details.]
:::

::::card{icon=tent}
## Talkeetna Camp

<the existing intro paragraph + [PLACEHOLDER] line, unchanged>

### What to Expect

<the two existing paragraphs, unchanged>

### Logistics

:::grid
- **Travel** We drive up in private vehicles, driven by parent and adult volunteers. The drive is roughly [PLACEHOLDER — N hours].
- **Lodging** [PLACEHOLDER — camping, cabin, or other lodging details.]
- **Meals** Group meals, prepared together. [PLACEHOLDER — confirm meal logistics and whether athletes need to bring food.]
- **Cost** The camp is free. We accept donations to offset gas and site fees. [PLACEHOLDER — confirm if there is any required contribution.]
:::

### Packing List

[PLACEHOLDER — finalize packing list.]

- All your training gear (running shoes, roller skis and poles, helmet, bike if applicable)
- Sleeping bag and pad
- Rain gear — Talkeetna weather is unpredictable
- Water bottle and personal snacks
- Medications you take daily
::::

:::cta{icon=flag}
## Sign Up

A signed waiver is required before your first session. Get it on the [Resources](/resources) page. Camp registration is included — you don't need to sign up for Talkeetna separately.

<a href="https://crewlab.app.link/5g7vhhYEn3b" class="download-link" target="_blank" rel="noopener">Sign Up for Summer Training →</a>

Questions? [Contact us](/contact).
:::
```
The Logistics block converts the four `**Term:** …` paragraphs into a markdown list with the colon dropped (`**Travel** …`) — this reproduces `boldParasToGrid`'s exact output.

- [ ] **Step 2: Type check + build**

Run: `npm run check && npm run build`
Expected: clean; build succeeds.

- [ ] **Step 3: Verify toc anchors + screenshot-identical**

Confirm the rendered ids are `schedule`, `what-we-do`, `who-can-join`, `what-to-bring`, `talkeetna-camp`, `sign-up` (so the page-toc links resolve) and the page renders identically (desktop/mobile/dark).

- [ ] **Step 4: Commit**

```bash
git add src/content/pages/training.md
git commit -m "Migrate Training to inline directives"
```

---

## Task 11: Migrate crewlab.md

**Files:** Modify `src/content/pages/crewlab.md`.

- [ ] **Step 1: Rewrite the body with directives**

Keep the two intro paragraphs (lede + SafeSport paragraph) unmarked.
```markdown
:::passage{icon=chat-circle}
## Why we use it

<the existing paragraph, unchanged>
:::

:::grid{icon=person-simple-run}
## For athletes

<the existing intro paragraph, unchanged>

- **Check the schedule and RSVP.** <unchanged>
- **Use team chat.** <unchanged>
- **Log your workouts.** <unchanged>
- **Do the daily check-in.** <unchanged>
- **Watch your video.** <unchanged>
:::

:::card{icon=users-three role=secondary}
## For parents & supporters

<the existing intro paragraph, unchanged>

- **What you can see and do.** <unchanged, incl. the [PLACEHOLDER] line>
- **Organize and pitch in.** <unchanged>
- **What stays private.** <unchanged>
- **Notifications and logistics.** <unchanged>
:::

:::cta{icon=flag}
## Getting started

<the existing paragraph, unchanged>

<a href="https://crewlab.app.link/5g7vhhYEn3b" class="download-link" target="_blank" rel="noopener">Join EC Nordic on CrewLAB →</a>
:::
```
Note: "For athletes" is a `:::grid` (its list becomes ec-grid); "For parents & supporters" is a plain `:::card` (its list stays a plain list) — matching the current `decorateCrewlab` behavior.

- [ ] **Step 2: Type check + build**

Run: `npm run check && npm run build`
Expected: clean; build succeeds.

- [ ] **Step 3: Screenshot-verify identical** (desktop/mobile/dark).

- [ ] **Step 4: Commit**

```bash
git add src/content/pages/crewlab.md
git commit -m "Migrate CrewLAB to inline directives"
```

---

## Task 12: Migrate resources.md + volunteers.md (the deferred pages)

**Files:** Modify `src/content/pages/resources.md`, `src/content/pages/volunteers.md`.

- [ ] **Step 1: Rewrite resources.md**

Keep the lede ("Forms, guides, and links…") unmarked. Wrap the single section in a plain card (no icon; the waiver link stays a plain link — this page has no CTA):
```markdown
:::card
## Forms

**Waiver and Release of Liability** — required before the first day of participation in any EC Nordic activity, including the summer training program and Talkeetna camp.

<a href="/waiver" class="download-link" target="_blank" rel="noopener">View Waiver Form →</a>

Print the form and return a signed copy to Geoffrey Wright, or use a free e-signature service such as [SignWell](https://www.signwell.com).
:::
```

- [ ] **Step 2: Rewrite volunteers.md**

Keep the lede unmarked. Replace the manual `<h2 id="…">` tags with directives:
```markdown
:::passage{icon=users-three role=secondary}
## This Summer's Volunteers

> **TK — Add the volunteer roster: names, roles, and a sentence or two on each. Program leads first, then drivers and other adult helpers.**
:::

:::grid{icon=handshake role=secondary}
## Help Out

We always need more adults. The most useful things you can do:

- **Drive.** Many sessions are at remote trailheads, and we carpool. A driver with room for a few athletes makes a session happen.
- **Train alongside athletes.** Run, ride, or ski with the group at any pace. The spread on endurance days is wide, and we want adults with both the faster and the slower kids.
- **Teach what you know.** Strength work, technique, nutrition, navigation — if you know it, we can use it.

No certification or background required. We'll find a way to put you to work. [Reach out](/contact) if you'd like to help.
:::
```

- [ ] **Step 3: Type check + build**

Run: `npm run check && npm run build`
Expected: clean; build succeeds.

- [ ] **Step 4: Screenshot-verify kit-correct**

Capture Resources + Volunteers (desktop/mobile/dark). Check they render as proper kit primitives (card / passage / grid) — there is no old render to match.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/resources.md src/content/pages/volunteers.md
git commit -m "Migrate Resources and Volunteers to inline directives"
```

---

## Task 13: Gut the decorate machinery in [slug]/+page.svelte

**Files:** Modify `src/routes/[slug]/+page.svelte`.

- [ ] **Step 1: Delete the `<script module>` block and simplify rendering**

Remove the entire `<script module lang="ts">…</script>` block (lines 1–264: `slugify`, `parseSections`, `wrapSections`, the `svg`/`ICON`/`PANEL_ICONS` maps, `SECONDARY_SECTIONS`, `ecCard`, `riseStyle`, `ecCta`, `decoratePage`, `decorateAbout`, `boldParasToGrid`, `decorateTraining`, `decorateCrewlab`). Replace the instance `<script>`'s `bodyHtml` derivation: decoration now happens in `markdownToHtml`, so render `page.html` directly.

New instance script:
```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';

  let { data }: { data: PageData } = $props();
  let { page } = $derived(data);
</script>
```
New markup body:
```svelte
<article class="static-page" data-page={page.slug}>
  <h1 class="page-title">{page.title}</h1>

  <div class="post-body">
    {@html page.html}
  </div>
</article>
```
Leave the entire `<style>` block unchanged — every selector (`.ec-card`, `.ec-passage`, `.ec-alert`, `.ec-split`, `[data-page]`, the rise keyframes, reduced-motion) still applies to the pipeline output.

- [ ] **Step 2: Type check**

Run: `npm run check`
Expected: no errors (the `decorate*`/`ICON` references are gone; `bodyHtml` no longer exists).

- [ ] **Step 3: Build + screenshot spot-check**

Run: `npm run build`
Re-screenshot About to confirm the gutting did not change rendering (it shouldn't — `page.html` already carried the primitives in Task 9).

- [ ] **Step 4: Commit**

```bash
git add src/routes/[slug]/+page.svelte
git commit -m "Remove decorate* machinery; render directive output directly"
```

---

## Task 14: Verify data-section is unused; documentation

**Files:** Modify `docs/design-language.md`.

- [ ] **Step 1: Confirm nothing consumes `data-section`**

Run: `grep -rn "data-section" src/ docs/`
Expected: no matches in `src/` (the attribute is gone from output and no CSS/JS reads it). If a match appears in `src/`, stop and reconcile before continuing.

- [ ] **Step 2: Add the directive vocabulary to the design language**

In `docs/design-language.md`, update the "Last updated" line to `2026-05-24` with a note that page styling is now selected by inline container directives. Add a new section, **"Selecting a primitive — inline directives,"** documenting the vocabulary table from this plan's *Reference* section (the seven directives, the `icon`/`role` attributes, the four-colon nesting rule, "unmarked = prose"). Update the *Worked example — the About page* and *Refining a page — process* sections to reference the directive markup in `src/content/pages/about.md` and the `markdownToHtml` pipeline (`src/lib/markdown/*`), replacing the `decorate*()` references.

- [ ] **Step 3: Register the two new glyphs in the icon matrix**

Add rows to the icon matrix for the CrewLAB glyphs that were not previously listed:
```markdown
| `chat-circle` | the rationale / why | CrewLAB → Why we use it | primary |
| `person-simple-run` | athletes / the how-to | CrewLAB → For athletes | primary |
```
Also add `handshake` (volunteering) and `users-three` (people) usage notes for the Volunteers page if not already covered.

- [ ] **Step 4: Commit**

```bash
git add docs/design-language.md
git commit -m "Document the inline-directive vocabulary"
```

---

## Task 15: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Type check + unit tests + build**

Run: `npm run check && npm test && npm run build`
Expected: svelte-check clean; all vitest suites pass; build to `.svelte-kit/cloudflare/` succeeds.

- [ ] **Step 2: Screenshot regression sweep** (see *Verification protocol*)

For About / Training / CrewLAB: desktop (1280px) + mobile (390px), light + dark, `--force-prefers-reduced-motion`. Diff against the pre-Pass-5 live render; every difference must be reconciled to identical. For Resources / Volunteers: confirm kit-correct rendering.

- [ ] **Step 3: Confirm posts are unchanged**

Open a built post page (e.g. any `/YYYY/MM/slug/`) in the screenshot harness and confirm prose renders normally (posts contain no directives; the new pipeline must render them as before).

- [ ] **Step 4: Confirm Training toc anchors work**

Load the built Training page and click each page-toc link; confirm it scrolls to the matching section.

- [ ] **Step 5: Final commit (if any reconciliation edits were made)**

```bash
git add -A
git commit -m "Pass 5 verification fixes"
```

> The pass-end ritual (code-simplifier over the changed code, final svelte-check, STATUS.md update, plan archival, push) is handled by the `cairn-pass` skill at pass close — not part of this plan.

---

## Verification protocol (screenshots)

Per `docs/design-language.md` and project memory, the built site is served by wrangler on `:8787`; rebuild before checking. Backgrounded `wrangler dev` exits at EOF, so keep stdin open:

```bash
npm run build
( sleep infinity | npx wrangler dev --port 8787 ) &
# wait for "Ready", then capture with a headless chromium, e.g.:
#   chromium --headless --force-prefers-reduced-motion \
#     --window-size=1280,2000 --screenshot=/tmp/about-desktop.png http://localhost:8787/about
# repeat at --window-size=390,2400 (mobile) and with the dark theme (emulate prefers-color-scheme: dark).
```
Compare each capture against the current production render (https://ecnordic.ski) at 2× crop. About / Training / CrewLAB must be pixel-identical; Resources / Volunteers are checked for kit-correctness only.

---

## Self-review notes

- **Spec coverage:** pipeline (Tasks 1,3) · mark step (3) · all primitives card/passage/alert/grid/cta/split/panel (3–8) · grid-content-as-list incl. nested Logistics (6,10) · explicit split panels (8,9) · rehype-slug ids + toc (3,10,15) · five-page migration (9–12) · delete decorate*/wrapSections/boldParasToGrid (13) · data-section drop verified (14) · docs incl. new glyphs (14) · identical-render + posts + toc verification (15). No gaps.
- **No placeholders:** the `<unchanged>` / `…` markers in migration and icon tasks are explicit instructions to copy verbatim from named source files, not vague TODOs.
- **Type/name consistency:** `transform`/`transformChildren`/`splitHead`/`cardShell`/`iconSpan`/`riseStyle`/`markFirstList`/`promoteDownloadLink`/`buildCard`/`buildGrid`/`buildAlert`/`buildCta`/`buildSplit`/`buildPanel`/`buildPassage` are defined once (Tasks 3–8) and referenced consistently; `ICON_PATHS`/`glyph` (Task 2) used by the rehype plugin; `markdownToHtml` signature unchanged.
