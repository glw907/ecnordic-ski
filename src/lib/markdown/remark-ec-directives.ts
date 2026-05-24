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
