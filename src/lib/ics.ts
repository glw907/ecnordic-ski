import type { CalendarEvent } from './types.js';
import { parseUtcDate } from './utils.js';

function icsDate(iso: string): string {
  return iso.replace(/-/g, '');
}

function addOneDay(iso: string): string {
  const d = parseUtcDate(iso);
  d.setUTCDate(d.getUTCDate() + 1);
  return icsDate(d.toISOString().slice(0, 10));
}

function escapeICS(value: string): string {
  return value
    .replace(/\r/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

export function generateICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ECN Nordic//ecnordic.ski//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ECN Nordic',
  ];

  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@ecnordic.ski`,
      `DTSTART;VALUE=DATE:${icsDate(event.start)}`,
      `DTEND;VALUE=DATE:${addOneDay(event.end)}`,
      `SUMMARY:${escapeICS(event.title)}`,
    );
    if (event.location)    lines.push(`LOCATION:${escapeICS(event.location)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
