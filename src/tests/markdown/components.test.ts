import { describe, it, expect } from 'vitest';
import { toHtml } from 'hast-util-to-html';
import type { Element } from 'hast';
import { h } from 'hastscript';
import { ecnordicRegistry } from '$lib/markdown/components';

describe('ecnordicRegistry', () => {
	it('registers the seven EC primitives in document order', () => {
		expect(ecnordicRegistry.names).toEqual(['card', 'grid', 'alert', 'cta', 'split', 'panel', 'passage']);
	});

	it('builds a :::card into a section.card.ec-card with an ec-head + card-title', () => {
		// A stamped card directive element, as the remark phase produces it.
		const node = h('div', { dataPrimitive: 'card', dataIcon: 'flag' }, [
			h('h2', ['Title']),
			h('p', ['Body']),
		]) as Element;
		const out = ecnordicRegistry.get('card')!.build(node);
		const html = toHtml(out);
		expect(out.tagName).toBe('section');
		expect(out.properties?.className).toEqual(
			expect.arrayContaining(['card', 'ec-card']),
		);
		expect(html).toContain('ec-head');
		expect(html).toContain('card-title');
	});
});
