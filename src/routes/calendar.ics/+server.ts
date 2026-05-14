import { getAllEvents } from '$lib/events';
import { generateICS } from '$lib/ics';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  const ics = generateICS(getAllEvents());
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ecnordic.ics"',
    },
  });
};
