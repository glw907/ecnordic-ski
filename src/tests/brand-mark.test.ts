import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

function read(path: string): string {
	return readFileSync(path, 'utf-8');
}

describe('brand mark', () => {
	it('ships an SVG favicon', () => {
		expect(existsSync('static/favicon.svg')).toBe(true);
	});

	it('keeps the favicon font-independent', () => {
		expect(read('static/favicon.svg')).not.toContain('<text');
	});

	it('links the SVG favicon from app.html', () => {
		expect(read('src/app.html')).toContain('favicon.svg');
	});

	it('keeps the accessible name on the logo link', () => {
		expect(read('src/lib/components/Nav.svelte')).toContain('aria-label="ECXC home"');
	});

	// The mark is a system of cuts from one generator (docs/design/build-mark.py):
	// the nav carries the four-tile primary, the favicon carries the compact
	// single-badge cut. This pins the shape of each cut and the cross-references
	// in their comments, so an edit to one flags the other.
	it('keeps the nav mark and favicon as the two documented cuts', () => {
		const nav = read('src/lib/components/Nav.svelte');
		const navMark = nav.match(/<svg class="logo-mark"[\s\S]*?<\/svg>/)?.[0] ?? '';
		expect(navMark.match(/<path d="[^"]+"/g) ?? []).toHaveLength(4);
		expect(nav).toContain('build-mark.py');
		expect(nav).toContain('favicon.svg');

		const favicon = read('static/favicon.svg');
		expect(favicon.match(/<path d="[^"]+"/g) ?? []).toHaveLength(1);
		expect(favicon).toContain('<rect');
		expect(favicon).toContain('Nav.svelte');
	});
});
