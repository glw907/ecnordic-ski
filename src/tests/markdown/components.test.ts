import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '$lib/markdown/render';
import { ecnordicRegistry } from '$lib/markdown/components';

describe('ecnordicRegistry', () => {
	it('registers the primitives in document order', () => {
		expect(ecnordicRegistry.names).toEqual([
			'card', 'grid', 'alert', 'cta', 'split', 'panel', 'passage', 'aside', 'section',
			'programs', 'program', 'week', 'day', 'spectrum', 'zone', 'figure', 'gallery',
		]);
	});

	it('wraps a :::figure body image in a figure with a figcaption', async () => {
		const html = await renderMarkdown(':::figure[Athletes at East]\n![Athletes warming up](/images/east.webp)\n:::\n');
		expect(html).toContain('<figure class="ec-figure"');
		expect(html).toContain('<img');
		expect(html).toContain('<figcaption>Athletes at East</figcaption>');
	});

	it('wraps a :::gallery body in an ec-gallery container', async () => {
		const html = await renderMarkdown(':::gallery[Camp]\n![One](/a.webp)\n![Two](/b.webp)\n:::\n');
		expect(html).toContain('<div class="ec-gallery"');
		expect(html).toContain('/a.webp');
		expect(html).toContain('/b.webp');
	});

	it('builds a :::card into a section.card.ec-card with an ec-head + card-title', async () => {
		const html = await renderMarkdown(':::card[Title]{icon="flag"}\nBody\n:::\n');
		expect(html).toContain('<section class="card ec-card');
		expect(html).toContain('ec-head');
		expect(html).toContain('card-title');
	});

	it('builds an :::aside into a semantic aside.ec-aside with the body', async () => {
		const html = await renderMarkdown(':::aside[Spenst]{icon="info"}\nExplosive, plyometric work.\n:::\n');
		expect(html).toContain('<aside class="ec-aside"');
		expect(html).toContain('Explosive, plyometric work.');
	});

	it('builds a titleless :::aside without an h2', async () => {
		const html = await renderMarkdown(':::aside\nA quick note.\n:::\n');
		expect(html).toContain('<aside class="ec-aside"');
		expect(html).not.toContain('<h2');
	});
});
