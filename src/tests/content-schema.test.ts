import { describe, it, expect } from 'vitest';
import { validatePostFrontmatter, validatePageFrontmatter } from '$lib/content-schema';

const validPost = {
  title: 'Welcome',
  date: '2026-05-14',
  draft: false,
  description: 'A first post.',
  tags: ['announcements'],
};

describe('validatePostFrontmatter (ValidationResult)', () => {
  it('accepts well-formed frontmatter and normalizes', () => {
    const r = validatePostFrontmatter(validPost, 'b');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.title).toBe('Welcome');
      expect(r.data.date).toBe('2026-05-14');
      expect(r.data.draft).toBe(false);
      expect(r.data.description).toBe('A first post.');
      expect(r.data.tags).toEqual(['announcements']);
    }
  });

  it('accepts a Date object for date (gray-matter parses bare YAML dates as Date)', () => {
    const r = validatePostFrontmatter(
      { ...validPost, date: new Date('2026-05-14T00:00:00Z') },
      'b'
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.date).toBe('2026-05-14');
  });

  it('defaults a missing draft flag to false', () => {
    const { draft: _omit, ...noDraft } = validPost;
    const r = validatePostFrontmatter(noDraft, 'b');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.draft).toBe(false);
  });

  it('never throws on bad input, returns a field error', () => {
    const r = validatePostFrontmatter({ ...validPost, title: '' }, 'b');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.title).toBeTruthy();
  });

  it('rejects a missing or empty title', () => {
    const r1 = validatePostFrontmatter({ ...validPost, title: '' }, 'b');
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.errors.title).toMatch(/title/i);
    const { title: _omit, ...noTitle } = validPost;
    const r2 = validatePostFrontmatter(noTitle, 'b');
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.errors.title).toMatch(/title/i);
  });

  it('rejects a missing or malformed date', () => {
    const { date: _omit, ...noDate } = validPost;
    const r1 = validatePostFrontmatter(noDate, 'b');
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.errors.date).toMatch(/date/i);
    const r2 = validatePostFrontmatter({ ...validPost, date: '5/14/26' }, 'b');
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.errors.date).toMatch(/date/i);
  });

  it('rejects an impossible calendar date', () => {
    const r = validatePostFrontmatter({ ...validPost, date: '2026-02-30' }, 'b');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.date).toMatch(/date/i);
  });

  it('rejects a non-boolean draft', () => {
    const r = validatePostFrontmatter({ ...validPost, draft: 'yes' }, 'b');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.draft).toMatch(/draft/i);
  });

  it('rejects a missing or empty description', () => {
    const r = validatePostFrontmatter({ ...validPost, description: '' }, 'b');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.description).toMatch(/description/i);
  });

  it('rejects tags outside the controlled vocabulary', () => {
    const r = validatePostFrontmatter({ ...validPost, tags: ['misc'] }, 'b');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.tags).toMatch(/misc/);
  });

  it('rejects an empty or missing tag list', () => {
    const r1 = validatePostFrontmatter({ ...validPost, tags: [] }, 'b');
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.errors.tags).toMatch(/tag/i);
    const { tags: _omit, ...noTags } = validPost;
    const r2 = validatePostFrontmatter(noTags, 'b');
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.errors.tags).toMatch(/tag/i);
  });
});

describe('validatePageFrontmatter (ValidationResult)', () => {
  it('accepts a page with a title', () => {
    const r = validatePageFrontmatter({ title: 'About' }, 'b');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.title).toBe('About');
  });

  it('rejects a missing title without throwing', () => {
    const r = validatePageFrontmatter({}, 'b');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.title).toMatch(/title/i);
  });
});
