import { describe, it, expect } from 'vitest';
import { generateICS } from '$lib/ics';
import type { CalendarEvent } from '$lib/types';

describe('generateICS', () => {
  it('produces a valid VCALENDAR structure', () => {
    const output = generateICS([]);
    expect(output).toContain('BEGIN:VCALENDAR');
    expect(output).toContain('END:VCALENDAR');
    expect(output).toContain('VERSION:2.0');
  });

  it('includes a VEVENT for each event', () => {
    const events: CalendarEvent[] = [
      { id: 'test-event', title: 'Test', start: '2026-12-06', end: '2026-12-07', type: 'race' },
    ];
    const output = generateICS(events);
    expect(output).toContain('BEGIN:VEVENT');
    expect(output).toContain('SUMMARY:Test');
    expect(output).toContain('DTSTART;VALUE=DATE:20261206');
    expect(output).toContain('DTEND;VALUE=DATE:20261208'); // exclusive end: +1 day
  });

  it('escapes commas in title', () => {
    const events: CalendarEvent[] = [
      { id: 'e', title: 'Race, Day 2', start: '2026-12-07', end: '2026-12-07', type: 'race' },
    ];
    expect(generateICS(events)).toContain('SUMMARY:Race\\, Day 2');
  });

  it('includes LOCATION when present', () => {
    const events: CalendarEvent[] = [
      { id: 'e', title: 'Race', start: '2026-12-06', end: '2026-12-06', type: 'race', location: 'Kincaid Park' },
    ];
    expect(generateICS(events)).toContain('LOCATION:Kincaid Park');
  });
});
