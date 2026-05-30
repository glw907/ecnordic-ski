import { createRenderer } from '@glw907/cairn-cms';
import { ecnordicRegistry } from './components';

// The render pipeline now lives in cairn-core; this composes it from EC Nordic's
// component registry. `stagger` makes the engine stamp a `data-rise` ordinal on each
// top-level module, which the page CSS maps to the entrance-cascade delay. The exported
// names are kept for back-compat: callers use renderMarkdown, and cairn-cms injects the
// plugin arrays into Carta's preview so the editor stays byte-for-byte identical to the site.
const renderer = createRenderer(ecnordicRegistry, { stagger: true });

/** remark plugins (directive syntax → stamped EC directive nodes). For Carta's preview. */
export const remarkEcPlugins = renderer.remarkPlugins;
/** rehype plugins (raw passthrough, EC primitive dispatch, heading slugs). For Carta's preview. */
export const rehypeEcPlugins = renderer.rehypePlugins;
export const renderMarkdown = renderer.renderMarkdown;
