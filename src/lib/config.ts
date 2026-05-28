import { parseSiteConfig, extractMenu } from '@glw907/cairn-cms';
import raw from './site.config.yaml?raw';

/** The site's canonical config, read from the git-committed YAML at build time (Pass L). */
export const siteConfig = parseSiteConfig(raw);

export const SITE_URL                = siteConfig.url ?? '';
export const SITE_TITLE              = siteConfig.siteName;
export const SITE_DESCRIPTION        = siteConfig.description ?? '';
export const SITE_AUTHOR             = siteConfig.author ?? '';
export const SITE_LOCALE             = siteConfig.locale ?? 'en-US';
export const FEED_MAX_ITEMS          = siteConfig.settings?.feedMaxItems ?? 20;
export const HOMEPAGE_FEATURED_COUNT = siteConfig.settings?.homepageFeaturedCount ?? 1;

/** Controlled tag vocabulary for posts. Frontmatter tags outside this set fail the build. */
export const POST_TAGS: readonly string[] = siteConfig.settings?.postTags ?? [];

/** The primary header navigation, read from the site config (Pass L). */
export const PRIMARY_NAV = extractMenu(siteConfig, 'primary', 2);

// cairn-cms: the backend repo and editable collections live in the site adapter
// (`src/lib/cairn.config.ts`), behind cairn-core's CairnAdapter seam (Pass D).

// Homepage welcome copy. This is prose content, not site config, so it stays here until it is
// modeled as a reusable markdown content fragment (see cairn-cms PLAN.md, reusable-content fragments).
export const WELCOME_BLURB =
  'East Community Nordic is a free, volunteer-run summer training group for ' +
  'Anchorage high school Nordic skiers and cross-country runners. We build the ' +
  'fitness, skills, and outdoor habits that carry kids through the ski season ' +
  'and past graduation.';
