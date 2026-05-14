<script lang="ts">
  import '@schedule-x/theme-default/dist/index.css';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { SITE_TITLE } from '$lib/config';
  import { eventDateRange } from '$lib/utils';

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

<p>
  <a href="/calendar.ics" class="btn btn-sm btn-outline">Subscribe (ICS)</a>
</p>

<div bind:this={calendarEl} class="calendar-container"></div>

{#if events.length === 0}
  <p>No upcoming events.</p>
{:else}
  <section class="event-list">
    <h2>Upcoming Events</h2>
    <ul>
      {#each events as event}
        <li>
          <strong>{event.title}</strong>
          <span class="post-date">{eventDateRange(event)}</span>
          {#if event.location}<span>{event.location}</span>{/if}
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .calendar-container {
    margin-block: 2rem;
    min-height: 600px;
  }

  .event-list ul {
    list-style: none;
    padding: 0;
  }

  .event-list li {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-block: 0.75rem;
    border-bottom: 1px solid var(--color-border-subtle);
  }
</style>
