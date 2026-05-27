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

function fail(kind: string, source: string, msg: string): never {
  throw new Error(`Invalid ${kind} frontmatter in ${source}: ${msg}`);
}

/**
 * Validates a post's raw frontmatter, throwing on the first problem so bad content
 * fails the build rather than shipping. `source` (the filename) is named in every
 * error to make the offending file obvious.
 */
export function validatePostFrontmatter(
  data: Record<string, unknown>,
  source: string
): PostFrontmatter {
  const f = (msg: string): never => fail('post', source, msg);

  const title = data.title;
  if (typeof title !== 'string' || title.trim() === '') f('title is required');

  if (data.draft !== undefined && typeof data.draft !== 'boolean') f('draft must be a boolean');

  const description = data.description;
  if (typeof description !== 'string' || description.trim() === '') f('description is required');

  const date = isoFromValue(data.date);
  if (!ISO_DATE.test(date)) f('date must be a YYYY-MM-DD string');
  if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    f(`date "${date}" is not a real calendar date`);
  }

  const tags = data.tags;
  if (!Array.isArray(tags) || tags.length === 0) f('at least one tag is required');
  for (const tag of tags as unknown[]) {
    if (typeof tag !== 'string' || !allowedTags.has(tag)) {
      f(`tag "${String(tag)}" is not in the controlled vocabulary (${POST_TAGS.join(', ')})`);
    }
  }

  return {
    title: title as string,
    date,
    draft: data.draft === true,
    description: description as string,
    tags: tags as string[],
  };
}

/** Validates a static page's raw frontmatter. */
export function validatePageFrontmatter(
  data: Record<string, unknown>,
  source: string
): PageFrontmatter {
  const title = data.title;
  if (typeof title !== 'string' || title.trim() === '') fail('page', source, 'title is required');
  return { title: title as string };
}
