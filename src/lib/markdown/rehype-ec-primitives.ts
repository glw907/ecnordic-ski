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

function buildPassage(node: Element, rise?: string): Element {
  const { head, rest } = splitHead(node, true);
  const properties: Record<string, unknown> = { className: ['ec-passage'] };
  if (rise) properties.style = rise;
  return h('section', properties, [head, h('div', { className: ['section-body'] }, rest)]);
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
