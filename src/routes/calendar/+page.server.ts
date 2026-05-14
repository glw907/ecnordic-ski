import type { PageServerLoad } from './$types';
import { getUpcomingEvents } from '$lib/events';

export const load: PageServerLoad = () => ({
  events: getUpcomingEvents(),
});
