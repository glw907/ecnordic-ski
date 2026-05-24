import { describe, it, expect } from 'vitest';
import { validatePostFrontmatter, validatePageFrontmatter } from '$lib/content-schema';

const validPost = {
  title: 'Welcome',
  date: '2026-05-14',
  draft: false,
  description: 'A first post.',
  tags: ['announcements'],
};

describe('validatePostFrontmatter', () => {
  it('accepts well-formed frontmatter', () => {
    expect(validatePostFrontmatter(validPost, 'ok.md')).toEqual(validPost);
  });

  it('accepts a Date object for date (gray-matter parses bare YAML dates as Date)', () => {
    const result = validatePostFrontmatter(
      { ...validPost, date: new Date('2026-05-14T00:00:00Z') },
      'ok.md'
    );
    expect(result.date).toBe('2026-05-14');
  });

  it('defaults a missing draft flag to false', () => {
    const { draft: _omit, ...noDraft } = validPost;
    expect(validatePostFrontmatter(noDraft, 'ok.md').draft).toBe(false);
  });

  it('names the source file in the error', () => {
    expect(() => validatePostFrontmatter({ ...validPost, title: '' }, 'bad.md')).toThrow(
      /bad\.md/
    );
  });

  it('rejects a missing or empty title', () => {
    expect(() => validatePostFrontmatter({ ...validPost, title: '' }, 's')).toThrow(/title/);
    const { title: _omit, ...noTitle } = validPost;
    expect(() => validatePostFrontmatter(noTitle, 's')).toThrow(/title/);
  });

  it('rejects a missing or malformed date', () => {
    const { date: _omit, ...noDate } = validPost;
    expect(() => validatePostFrontmatter(noDate, 's')).toThrow(/date/);
    expect(() => validatePostFrontmatter({ ...validPost, date: '5/14/26' }, 's')).toThrow(/date/);
  });

  it('rejects an impossible calendar date', () => {
    expect(() => validatePostFrontmatter({ ...validPost, date: '2026-02-30' }, 's')).toThrow(
      /date/
    );
  });

  it('rejects a non-boolean draft', () => {
    expect(() => validatePostFrontmatter({ ...validPost, draft: 'yes' }, 's')).toThrow(/draft/);
  });

  it('rejects a missing or empty description', () => {
    expect(() => validatePostFrontmatter({ ...validPost, description: '' }, 's')).toThrow(
      /description/
    );
  });

  it('rejects tags outside the controlled vocabulary', () => {
    expect(() => validatePostFrontmatter({ ...validPost, tags: ['misc'] }, 's')).toThrow(/misc/);
  });

  it('rejects an empty or missing tag list', () => {
    expect(() => validatePostFrontmatter({ ...validPost, tags: [] }, 's')).toThrow(/tag/);
    const { tags: _omit, ...noTags } = validPost;
    expect(() => validatePostFrontmatter(noTags, 's')).toThrow(/tag/);
  });
});

describe('validatePageFrontmatter', () => {
  it('accepts a page with a title', () => {
    expect(validatePageFrontmatter({ title: 'About' }, 'about.md')).toEqual({ title: 'About' });
  });

  it('rejects a missing title and names the source', () => {
    expect(() => validatePageFrontmatter({}, 'about.md')).toThrow(/about\.md/);
    expect(() => validatePageFrontmatter({}, 'about.md')).toThrow(/title/);
  });
});
