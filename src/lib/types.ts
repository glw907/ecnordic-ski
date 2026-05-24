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

export interface StaticPage {
  slug: string;
  title: string;
  html: string;
}
