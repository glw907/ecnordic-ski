import { createRenderer } from '@glw907/cairn-cms';
import { ecnordicRegistry } from './components';

// The render pipeline now lives in cairn-core; this composes it from EC Nordic's
// component registry. `stagger` makes the engine stamp a `data-rise` ordinal on each
// top-level module, which the page CSS maps to the entrance-cascade delay. The exported
// names are kept for back-compat: callers use renderMarkdown.
const renderer = createRenderer(ecnordicRegistry, { stagger: true });

/** remark plugins (directive syntax → stamped EC directive nodes). */
export const remarkEcPlugins = renderer.remarkPlugins;
/** rehype plugins (raw passthrough, EC primitive dispatch, heading slugs). */
export const rehypeEcPlugins = renderer.rehypePlugins;
export const renderMarkdown = renderer.renderMarkdown;
