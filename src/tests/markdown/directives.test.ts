import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '$lib/markdown/render';

describe('pipeline baseline', () => {
  it('renders unmarked content as plain prose', async () => {
    const html = await renderMarkdown('Just a paragraph.\n');
    expect(html.trim()).toBe('<p>Just a paragraph.</p>');
  });

  it('adds slug ids to headings', async () => {
    const html = await renderMarkdown(':::card{icon=path}\n## Sign Up\n\nx\n:::\n');
    expect(html).toContain('id="sign-up"');
  });
});

describe('card directive', () => {
  it('renders a module card with icon + heading + body', async () => {
    const html = await renderMarkdown(':::card{icon=path}\n## What we do\n\nBody text.\n:::\n');
    expect(html).toContain('<section class="card ec-card bg-base-100 border border-base-300 shadow-sm"');
    expect(html).toContain('<div class="card-body">');
    expect(html).toContain('<div class="ec-head"><span class="ec-icon"><svg class="ec-glyph"');
    expect(html).toContain('<h2 class="card-title"');
    expect(html).toContain('What we do');
    expect(html).toContain('<div class="section-body"><p>Body text.</p></div>');
  });

  it('applies the secondary role to the icon', async () => {
    const html = await renderMarkdown(':::card{icon=users-three role=secondary}\n## Who\n\nx\n:::\n');
    expect(html).toContain('<span class="ec-icon ec-icon-secondary">');
  });

  it('staggers the first primitive at --rise:0.16s', async () => {
    const html = await renderMarkdown(':::card{icon=path}\n## A\n\nx\n:::\n');
    expect(html).toContain('style="--rise:0.16s"');
  });

  it('leaves a non-grid card list as a plain list', async () => {
    const html = await renderMarkdown(':::card{icon=path}\n## A\n\n- one\n- two\n:::\n');
    expect(html).toContain('<ul>\n<li>one</li>');
    expect(html).not.toContain('ec-grid');
  });
});

describe('passage directive', () => {
  it('renders a titled prose passage with no card chrome', async () => {
    const html = await renderMarkdown(':::passage{icon=chat-circle}\n## Why we use it\n\nReasons.\n:::\n');
    expect(html).toContain('<section class="ec-passage" style="--rise:0.16s">');
    expect(html).toContain('<div class="ec-head"><span class="ec-icon"><svg');
    expect(html).toContain('<h2 class="card-title"');
    expect(html).toContain('<div class="section-body"><p>Reasons.</p></div>');
    expect(html).not.toContain('ec-card');
  });
});

describe('alert directive', () => {
  it('renders a subtle caution alert with the icon inline in the label', async () => {
    const html = await renderMarkdown(':::alert{role=caution}\n## Risks\n\nFalls happen.\n:::\n');
    expect(html).toContain('<div role="alert" class="ec-alert ec-alert-caution" style="--rise:0.16s">');
    expect(html).toContain('<div class="ec-alert-body">');
    expect(html).toContain('<h2 id="risks"><svg class="ec-glyph"');
    expect(html).toContain('Risks</h2>');
    expect(html).toContain('<p>Falls happen.</p>');
    expect(html).not.toContain('card-title');
  });
});

describe('grid directive', () => {
  it('renders a grid card: heading + body list becomes ec-grid', async () => {
    const html = await renderMarkdown(
      ':::grid{icon=compass}\n## Philosophy\n\nIntro.\n\n- **One** a\n- **Two** b\n:::\n',
    );
    expect(html).toContain('<section class="card ec-card');
    expect(html).toContain('<div class="ec-head"><span class="ec-icon"><svg');
    expect(html).toContain('<div class="section-body"><p>Intro.</p>');
    expect(html).toContain('<ul class="ec-grid">');
    expect(html).toContain('<li><strong>One</strong> a</li>');
  });

  it('lifts a nested grid (no heading) to a bare ec-grid list', async () => {
    const html = await renderMarkdown(
      '::::card{icon=tent}\n## Camp\n\n### Logistics\n\n:::grid\n- **Travel** by car\n:::\n::::\n',
    );
    expect(html).toContain('<h3 id="logistics">Logistics</h3>');
    expect(html).toContain('<ul class="ec-grid"><li><strong>Travel</strong> by car</li></ul>');
    expect(html.match(/ec-card/g)?.length).toBe(1); // the nested grid did not become its own card
  });
});
