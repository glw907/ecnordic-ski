import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '$lib/markdown/render';
import { ecnordicRegistry } from '$lib/markdown/components';

describe('ecnordicRegistry', () => {
	it('registers the seven EC primitives in document order', () => {
		expect(ecnordicRegistry.names).toEqual(['card', 'grid', 'alert', 'cta', 'split', 'panel', 'passage']);
	});

	it('builds a :::card into a section.card.ec-card with an ec-head + card-title', async () => {
		const html = await renderMarkdown(':::card[Title]{icon="flag"}\nBody\n:::\n');
		expect(html).toContain('<section class="card ec-card');
		expect(html).toContain('ec-head');
		expect(html).toContain('card-title');
	});
});
