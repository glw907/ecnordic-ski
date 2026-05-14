import matter from 'gray-matter';
import type { CalendarEvent, EventType } from './types.js';

const rawFiles = import.meta.glob<string>('/src/content/events/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

let _cachedEvents: CalendarEvent[] | null = null;

function isoFromValue(value: unknown, fallback?: string): string {
  // gray-matter parses bare YAML dates as UTC midnight Date objects
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && value) return value.slice(0, 10);
  return fallback ?? '';
}

export function parseEventFrontmatter(id: string, data: Record<string, unknown>): CalendarEvent {
  const start = isoFromValue(data.date);
  const end   = isoFromValue(data.end_date, start);
  return {
    id,
    title: String(data.title ?? ''),
    start,
    end,
    location: data.location as string | undefined,
    type: (data.type as EventType) ?? 'training',
    description: data.description as string | undefined,
  };
}

export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.start.localeCompare(b.start));
}

export function filterUpcoming(events: CalendarEvent[], today: string): CalendarEvent[] {
  return events.filter(e => e.end >= today);
}

export function getAllEvents(): CalendarEvent[] {
  if (_cachedEvents) return _cachedEvents;

  const events: CalendarEvent[] = [];
  for (const [filepath, raw] of Object.entries(rawFiles)) {
    const id = filepath.split('/').pop()!.replace('.md', '');
    const { data } = matter(raw);
    events.push(parseEventFrontmatter(id, data));
  }

  _cachedEvents = sortEvents(events);
  return _cachedEvents;
}

export function getUpcomingEvents(): CalendarEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  return filterUpcoming(getAllEvents(), today);
}
