interface PostBase {
  slug: string;
  year: string;
  month: string;
  title: string;
  /** ISO date string from frontmatter, e.g. "2026-05-14" */
  date: string;
  draft: boolean;
  description: string;
  tags: string[];
}

export type PostSummary = PostBase;
export type PostDetail = PostBase & { html: string };
export type Post = PostSummary | PostDetail;

export type EventType = 'race' | 'camp' | 'clinic' | 'training' | 'social';

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date string, e.g. "2026-12-06" */
  start: string;
  /** ISO date string (inclusive), e.g. "2026-12-07" */
  end: string;
  location?: string;
  type: EventType;
  description?: string;
}

export interface StaticPage {
  slug: string;
  title: string;
  html: string;
}
