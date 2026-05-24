import { describe, it, expect } from 'vitest';
import { toHtml } from 'hast-util-to-html';
import { ICON_PATHS, glyph } from '$lib/markdown/icons';

describe('icons', () => {
  it('exposes every glyph the pages reference', () => {
    for (const name of [
      'path', 'warning', 'users-three', 'compass', 'flag', 'calendar-blank',
      'backpack', 'tent', 'chat-circle', 'person-simple-run', 'hand-coins', 'handshake',
    ]) {
      expect(ICON_PATHS[name], name).toBeTruthy();
    }
  });

  it('builds an ec-glyph svg with the path data', () => {
    const html = toHtml(glyph('flag'), { space: 'html' });
    expect(html).toContain('<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">');
    expect(html).toContain(`<path d="${ICON_PATHS['flag']}">`);
  });
});
