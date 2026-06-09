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

	// The favicon embeds a copy of the nav glyph paths (a static asset cannot import
	// from src/). This pins the two copies together so an edit to one flags the other.
	it('keeps the favicon glyphs in sync with the nav mark', () => {
		const nav = read('src/lib/components/Nav.svelte');
		const glyphs = read('static/favicon.svg').match(/<path d="[^"]+"/g) ?? [];
		expect(glyphs.length).toBe(4);
		for (const glyph of glyphs) {
			expect(nav).toContain(glyph);
		}
	});
});
