import { getAllEvents } from '$lib/events';
import { generateICS } from '$lib/ics';
import type { RequestHandler } from './$types';

let _cachedICS: string | null = null;

export const GET: RequestHandler = () => {
  _cachedICS ??= generateICS(getAllEvents());
  return new Response(_cachedICS, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ecnordic.ics"',
    },
  });
};
