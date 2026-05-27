import { createRenderer } from '@glw907/cairn-cms';
import { ecnordicRegistry } from './components';
import { riseStyle } from '$lib/motion';

// The render pipeline now lives in cairn-core; this composes it from EC Nordic's
// component registry + its rise-stagger motion formula. The exported names are kept
// for back-compat: callers use renderMarkdown, and cairn-cms injects the plugin
// arrays into Carta's preview so the editor stays byte-for-byte identical to the site.
const renderer = createRenderer(ecnordicRegistry, { rise: riseStyle });

/** remark plugins (directive syntax → stamped EC directive nodes). For Carta's preview. */
export const remarkEcPlugins = renderer.remarkPlugins;
/** rehype plugins (raw passthrough, EC primitive dispatch, heading slugs). For Carta's preview. */
export const rehypeEcPlugins = renderer.rehypePlugins;
export const renderMarkdown = renderer.renderMarkdown;
