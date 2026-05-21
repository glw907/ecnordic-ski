<script lang="ts">
  import '@schedule-x/theme-default/dist/index.css';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';
  import { formatShortDate, eventDateRange, formatTimeRange } from '$lib/utils';

  let { data }: { data: PageData } = $props();
  let { events } = $derived(data);

  let calendarEl: HTMLDivElement;

  onMount(() => {
    let destroyed = false;
    let calendarApp: import('@schedule-x/calendar').CalendarApp | undefined;

    import('@schedule-x/calendar').then(({ createCalendar, viewMonthGrid }) => {
      if (destroyed) return;

      calendarApp = createCalendar({
        views: [viewMonthGrid],
        defaultView: viewMonthGrid.name,
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
        })),
      });

      calendarApp.render(calendarEl);
    });

    return () => {
      destroyed = true;
      calendarApp?.destroy();
    };
  });
</script>

<svelte:head>
  <title>Calendar — {SITE_TITLE}</title>
</svelte:head>

<h1 class="page-title">Calendar</h1>

<div class="calendar-toolbar">
  <a href="/calendar.ics" class="btn btn-sm btn-outline btn-primary">Subscribe (ICS)</a>
</div>

<div bind:this={calendarEl} class="calendar-container"></div>

{#if events.length > 0}
  <section class="event-list-section">
    <h2 class="event-list-heading">All Events</h2>
    <ul class="event-list">
      {#each events as event}
        <li class="event-row">
          <span class="event-date">{formatShortDate(event.start)}</span>
          <div class="event-info">
            <span class="event-title">{event.title}</span>
            {#if event.location || event.start_time}
              <span class="event-location">
                {#if event.location}{event.location}{/if}{#if event.location && event.start_time}  ·  {/if}{#if event.start_time}{formatTimeRange(event.start_time, event.end_time)}{/if}
              </span>
            {/if}
            {#if event.start !== event.end}
              <span class="event-range">{eventDateRange(event)}</span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </section>
{:else}
  <p class="no-events">No upcoming events.</p>
{/if}

<style>
  .calendar-toolbar {
    margin-block-end: 1.5rem;
  }

  .calendar-container {
    margin-block: 0 2.5rem;
    min-height: 600px;
  }

  .event-list-section {
    margin-block-start: 1rem;
  }

  .event-list-heading {
    font-family: var(--font-display);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: var(--color-muted);
    margin: 0 0 1rem;
  }

  .event-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .event-row {
    display: grid;
    grid-template-columns: 4.5rem 1fr;
    gap: 0 1rem;
    align-items: start;
    padding-block: 0.65rem;
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .event-row:last-child { border-bottom: none; }

  .event-date {
    font-family: var(--font-display);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.095em;
    padding-top: 0.1em;
  }

  .event-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .event-title {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-heading);
  }

  .event-location,
  .event-range {
    font-size: 0.8rem;
    color: var(--color-muted);
  }

  .no-events {
    font-size: 0.9rem;
    color: var(--color-muted);
    font-style: italic;
  }
</style>
