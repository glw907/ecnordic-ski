import type { ValidationResult } from '@glw907/cairn-cms';
import { POST_TAGS } from './config.js';
import { isoFromValue } from './utils.js';

/** Validated post frontmatter: the editorial fields, after type and vocabulary checks. */
export interface PostFrontmatter {
  title: string;
  date: string;
  draft: boolean;
  description: string;
  tags: string[];
}

/** Validated page frontmatter. */
export interface PageFrontmatter {
  title: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const allowedTags = new Set<string>(POST_TAGS);

/**
 * Validates a post's raw frontmatter and returns a ValidationResult. Every rule the
 * build-time validator enforced is preserved; only the return shape changed from
 * throw-on-first-error to a collected `errors` map keyed by field. The admin editor reads
 * the map to show inline field errors; the build callers in posts.ts throw on `ok: false`.
 */
export function validatePostFrontmatter(
  frontmatter: Record<string, unknown>,
  _body: string
): ValidationResult {
  const errors: Record<string, string> = {};

  const rawTitle = frontmatter.title;
  const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
  if (!title) errors.title = 'Title is required';

  if (frontmatter.draft !== undefined && typeof frontmatter.draft !== 'boolean') {
    errors.draft = 'Draft must be a boolean';
  }

  const rawDescription = frontmatter.description;
  const description = typeof rawDescription === 'string' ? rawDescription.trim() : '';
  if (!description) errors.description = 'Description is required';

  const date = isoFromValue(frontmatter.date);
  if (!ISO_DATE.test(date)) {
    errors.date = 'Date must be a YYYY-MM-DD string';
  } else if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    errors.date = `Date "${date}" is not a real calendar date`;
  }

  const rawTags = frontmatter.tags;
  if (!Array.isArray(rawTags) || rawTags.length === 0) {
    errors.tags = 'At least one tag is required';
  } else {
    const bad = rawTags.find((tag) => typeof tag !== 'string' || !allowedTags.has(tag));
    if (bad !== undefined) {
      errors.tags = `Tag "${String(bad)}" is not in the controlled vocabulary (${POST_TAGS.join(', ')})`;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      ...frontmatter,
      title,
      date,
      draft: frontmatter.draft === true,
      description,
      tags: rawTags as string[],
    },
  };
}

/** Validates a static page's raw frontmatter and returns a ValidationResult. */
export function validatePageFrontmatter(
  frontmatter: Record<string, unknown>,
  _body: string
): ValidationResult {
  const rawTitle = frontmatter.title;
  const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
  if (!title) return { ok: false, errors: { title: 'Title is required' } };
  return { ok: true, data: { ...frontmatter, title } };
}
