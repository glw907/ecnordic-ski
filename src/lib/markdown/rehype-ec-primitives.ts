import type { Root, Element, ElementContent, Properties } from 'hast';
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
  const properties: Properties = { className: classes };
  if (rise) properties.style = rise;
  return h('section', properties, [h('div', { className: ['card-body'] }, body)]);
}

function buildCard(node: Element, rise?: string): Element {
  const { head, rest } = splitHead(node, true);
  return cardShell(CARD_CLASS, rise, [head, h('div', { className: ['section-body'] }, rest)]);
}

function buildPassage(node: Element, rise?: string): Element {
  const { head, rest } = splitHead(node, true);
  const properties: Properties = { className: ['ec-passage'] };
  if (rise) properties.style = rise;
  return h('section', properties, [head, h('div', { className: ['section-body'] }, rest)]);
}

function markFirstList(children: ElementContent[]): Element | undefined {
  const ul = children.find((c) => isElement(c) && c.tagName === 'ul') as Element | undefined;
  if (ul) {
    ul.properties = { ...ul.properties, className: ['ec-grid'] };
    // Strip whitespace-only text nodes so the bare list serializes without newlines.
    ul.children = (ul.children as ElementContent[]).filter(
      (c) => !(c.type === 'text' && /^\s*$/.test(c.value)),
    );
  }
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

function buildAlert(node: Element, rise?: string): Element {
  const children = node.children as ElementContent[];
  const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
  const h2 = children[i] as Element;
  const icon = node.properties?.dataIcon as string | undefined;
  if (icon) (h2.children as ElementContent[]).unshift(glyph(icon)); // icon inline at the label head
  const rest = children.filter((_, j) => j !== i);
  const role = node.properties?.dataRole as string;
  const properties: Properties = { role: 'alert', className: ['ec-alert', `ec-alert-${role}`] };
  if (rise) properties.style = rise;
  return h('div', properties, [h('div', { className: ['ec-alert-body'] }, [h2, ...rest])]);
}

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
  const properties: Properties = { className: CTA_CLASS };
  if (rise) properties.style = rise;
  return h('section', properties, [
    h('div', { className: ['card-body', 'items-center', 'text-center'] }, [
      h('span', { className: ['ec-chip'] }, [glyph(icon)]),
      h2,
      h('div', { className: ['section-body'] }, rest),
    ]),
  ]);
}

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
    case 'passage': return buildPassage(node, rise);
    case 'alert': return buildAlert(node, rise);
    case 'grid': return buildGrid(node, rise);
    case 'cta': return buildCta(node, rise);
    case 'split': return buildSplit(node, rise);
    case 'panel': return buildPanel(node);
    default: return node;
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
