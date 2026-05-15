import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { SITE_LOCALE } from '$lib/config';
import type { PostSummary, CalendarEvent } from '$lib/types';

export async function markdownToHtml(content: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content);
  return result.toString();
}

export function isoFromValue(value: unknown, fallback?: string): string {
  // gray-matter parses bare YAML dates as UTC midnight Date objects
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && value) return value.slice(0, 10);
  return fallback ?? '';
}

// Parses YYYY-MM-DD as UTC — avoids timezone shift from bare date string parsing.
export function parseUtcDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(iso: string): string {
  return parseUtcDate(iso).toLocaleDateString(SITE_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(iso: string): string {
  return parseUtcDate(iso).toLocaleDateString(SITE_LOCALE, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function toRFC822(iso: string): string {
  return parseUtcDate(iso).toUTCString();
}

export function toISODateTime(iso: string): string {
  return iso + 'T00:00:00Z';
}

/** Returns the canonical relative URL for a post, e.g. /2026/05/spring-dryland/ */
export function postUrl(post: Pick<PostSummary, 'year' | 'month' | 'slug'>): string {
  return `/${post.year}/${post.month}/${post.slug}/`;
}

/** Returns the canonical relative URL for a tag page, e.g. /tags/training/ */
export function tagUrl(tag: string): string {
  return `/tags/${tag}/`;
}

/** Returns a formatted date range string for a calendar event. */
export function eventDateRange(event: CalendarEvent): string {
  if (event.start === event.end) return formatDate(event.start);
  return `${formatDate(event.start)} – ${formatDate(event.end)}`;
}

/** Returns the day-of-week name for an ISO date, e.g. "Monday". */
export function formatDayOfWeek(iso: string): string {
  return parseUtcDate(iso).toLocaleDateString(SITE_LOCALE, {
    weekday: 'long',
    timeZone: 'UTC',
  });
}

/** Returns a short M/D date string, e.g. "5/16". */
export function formatMonthDay(iso: string): string {
  const d = parseUtcDate(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

/** Formats a start/end time pair, e.g. "4:00–5:30 PM" or "4:00 PM". */
export function formatTimeRange(start?: string, end?: string): string {
  if (!start) return '';
  if (!end) return start;
  // Strip AM/PM from start if end has the same suffix
  const startSuffix = start.match(/(AM|PM)$/i)?.[1];
  const endSuffix = end.match(/(AM|PM)$/i)?.[1];
  const startBase = startSuffix && endSuffix && startSuffix.toUpperCase() === endSuffix.toUpperCase()
    ? start.replace(/\s*(AM|PM)$/i, '').trim()
    : start;
  return `${startBase}–${end}`;
}

/** Returns the Mon–Sun ISO date range of the calendar week containing today. */
export function getThisWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon … 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}
