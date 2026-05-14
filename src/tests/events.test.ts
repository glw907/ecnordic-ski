import { describe, it, expect } from 'vitest';
import { parseEventFrontmatter, sortEvents, filterUpcoming } from '$lib/events';
import type { CalendarEvent } from '$lib/types';

describe('parseEventFrontmatter', () => {
  it('parses a complete event', () => {
    const data = {
      title: 'Kincaid Classic',
      date: new Date('2026-12-06'),
      end_date: new Date('2026-12-07'),
      location: 'Kincaid Park',
      type: 'race',
    };
    const result = parseEventFrontmatter('2026-12-06-kincaid-classic', data);
    expect(result).toEqual({
      id: '2026-12-06-kincaid-classic',
      title: 'Kincaid Classic',
      start: '2026-12-06',
      end: '2026-12-07',
      location: 'Kincaid Park',
      type: 'race',
      description: undefined,
    });
  });

  it('defaults end to start when end_date is absent', () => {
    const data = { title: 'Dryland', date: new Date('2026-09-10'), type: 'training' };
    const result = parseEventFrontmatter('2026-09-10-dryland', data);
    expect(result.start).toBe('2026-09-10');
    expect(result.end).toBe('2026-09-10');
  });

  it('defaults type to training when absent', () => {
    const data = { title: 'Practice', date: new Date('2026-09-10') };
    const result = parseEventFrontmatter('2026-09-10-practice', data);
    expect(result.type).toBe('training');
  });
});

describe('sortEvents', () => {
  it('sorts by start date ascending', () => {
    const events: CalendarEvent[] = [
      { id: 'b', title: 'B', start: '2026-12-10', end: '2026-12-10', type: 'training' },
      { id: 'a', title: 'A', start: '2026-11-05', end: '2026-11-05', type: 'camp' },
    ];
    expect(sortEvents(events)[0].id).toBe('a');
  });
});

describe('filterUpcoming', () => {
  it('excludes events whose end < today', () => {
    const events: CalendarEvent[] = [
      { id: 'past', title: 'Past', start: '2026-01-01', end: '2026-01-01', type: 'training' },
      { id: 'future', title: 'Future', start: '2027-03-01', end: '2027-03-01', type: 'race' },
    ];
    expect(filterUpcoming(events, '2026-06-01').map(e => e.id)).toEqual(['future']);
  });

  it('includes multi-day events still in progress', () => {
    const events: CalendarEvent[] = [
      { id: 'ongoing', title: 'Camp', start: '2026-05-10', end: '2026-05-20', type: 'camp' },
    ];
    expect(filterUpcoming(events, '2026-05-15')).toHaveLength(1);
  });
});
