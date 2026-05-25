export const SITE_URL              = 'https://ecnordic.ski';
export const SITE_TITLE            = 'EC Nordic';
export const SITE_DESCRIPTION      = 'East Community Nordic — year-round training for junior skiers in Anchorage, Alaska.';
export const SITE_AUTHOR           = 'EC Nordic';
export const SITE_LOCALE           = 'en-US';
export const FEED_MAX_ITEMS        = 20;
export const HOMEPAGE_FEATURED_COUNT = 1;

/** Controlled tag vocabulary for posts. Frontmatter tags outside this set fail the build. */
export const POST_TAGS = [
  'training',
  'racing',
  'results',
  'events',
  'camp',
  'announcements',
] as const;

/** cairn-cms: the repository the admin reads content from (and commits to, from Pass C). */
export const CAIRN_REPO = { owner: 'glw907', repo: 'ecnordic-ski', branch: 'main' } as const;

/** cairn-cms: editable content collections, keyed by the `[type]` route segment. */
export const CAIRN_COLLECTIONS = {
  posts: { label: 'Posts', dir: 'src/content/posts' },
  pages: { label: 'Pages', dir: 'src/content/pages' },
} as const;

export type CairnCollectionType = keyof typeof CAIRN_COLLECTIONS;

export const WELCOME_BLURB =
  'East Community Nordic is a free, volunteer-run summer training group for ' +
  'Anchorage high school Nordic skiers and cross-country runners. We build the ' +
  'fitness, skills, and outdoor habits that carry kids through the ski season ' +
  'and past graduation.';
