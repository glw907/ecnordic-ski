import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '$lib/markdown/sanitize';

describe('ecnordic sanitize floor', () => {
  it('strips a script and an onclick handler', async () => {
    const out = await sanitizeHtml('<p onclick="x()">hi</p><script>alert(1)</script>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('onclick');
    expect(out).toContain('hi');
  });

  it('drops a javascript: URL on an anchor', async () => {
    const out = await sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });

  it('keeps the directive card section and its classes', async () => {
    const out = await sanitizeHtml(
      '<section class="card ec-card bg-base-100 border border-base-300 shadow-sm" style="--rise:0.16s"><div class="card-body"><div class="ec-head"></div></div></section>',
    );
    expect(out).toContain('<section');
    expect(out).toContain('class="card ec-card bg-base-100 border border-base-300 shadow-sm"');
    expect(out).toContain('style="--rise:0.16s"');
  });

  it('keeps the download-link anchor with target and rel', async () => {
    const out = await sanitizeHtml(
      '<a class="download-link btn btn-primary" href="/waiver" target="_blank" rel="noopener">Get</a>',
    );
    expect(out).toContain('class="download-link btn btn-primary"');
    expect(out).toContain('href="/waiver"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener"');
  });

  it('keeps a glyph svg with its viewBox, fill, aria-hidden, and path d', async () => {
    const out = await sanitizeHtml(
      '<svg class="ec-glyph" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M0 0h24"></path></svg>',
    );
    expect(out).toContain('<svg');
    expect(out).toContain('class="ec-glyph"');
    expect(out).toContain('viewBox="0 0 256 256"');
    expect(out).toContain('fill="currentColor"');
    expect(out).toContain('aria-hidden="true"');
    expect(out).toContain('<path');
    expect(out).toContain('d="M0 0h24"');
  });

  it('keeps the alert role and the toc nav aria-label and heading ids', async () => {
    const out = await sanitizeHtml(
      '<div role="alert" class="ec-alert ec-alert-caution"></div><nav class="page-toc" aria-label="On this page"><a href="#x">X</a></nav><h2 id="risks">Risks</h2>',
    );
    expect(out).toContain('role="alert"');
    expect(out).toContain('<nav');
    expect(out).toContain('aria-label="On this page"');
    expect(out).toContain('id="risks"');
  });
});
