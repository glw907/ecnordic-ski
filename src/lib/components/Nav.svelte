<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { PRIMARY_NAV } from '$lib/config';

  let { onSearchOpen }: { onSearchOpen: () => void } = $props();

  let dark = $state(browser && document.documentElement.getAttribute('data-theme') === 'ecxc-dark');
  let mobileOpen = $state(false);

  function toggleTheme() {
    dark = !dark;
    const theme = dark ? 'ecxc-dark' : 'ecxc';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.cookie = `theme=${theme}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
  }

  function isActive(href: string): boolean {
    const p = $page.url.pathname;
    if (href === '/') return p === '/';
    return p.startsWith(href);
  }

  function closeMobile() {
    mobileOpen = false;
  }

</script>

{#snippet searchButton()}
  <button onclick={onSearchOpen} class="nav-icon" aria-label="Search">
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  </button>
{/snippet}

{#snippet themeButton()}
  <button
    onclick={toggleTheme}
    class="nav-icon"
    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {#if dark}
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/><path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/><path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    {/if}
  </button>
{/snippet}

<header class="site-header">
  <nav class="nav-inner">
    <a href="/" class="site-logo" onclick={closeMobile}>
      <span class="logo-ecxc">ECXC</span>
    </a>

    <!-- Desktop links -->
    <div class="desktop-links">
      {#each PRIMARY_NAV as link}
        <a
          href={link.url ?? '#'}
          class="nav-link"
          class:active={isActive(link.url ?? '')}
          aria-current={isActive(link.url ?? '') ? 'page' : undefined}
        >{link.label}</a>
      {/each}
      <div class="nav-icons">
        {@render searchButton()}
        {@render themeButton()}
      </div>
    </div>

    <!-- Mobile right side: icons + hamburger -->
    <div class="mobile-right">
      {@render searchButton()}
      {@render themeButton()}
      <button
        class="hamburger"
        onclick={() => { mobileOpen = !mobileOpen; }}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        {#if mobileOpen}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        {/if}
      </button>
    </div>
  </nav>

  <!-- Mobile dropdown -->
  {#if mobileOpen}
    <div class="mobile-menu">
      {#each PRIMARY_NAV as link}
        <a
          href={link.url ?? '#'}
          class="mobile-link"
          class:active={isActive(link.url ?? '')}
          aria-current={isActive(link.url ?? '') ? 'page' : undefined}
          onclick={closeMobile}
        >{link.label}</a>
      {/each}
    </div>
  {/if}
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 30;
    background: var(--color-base-100);
    border-bottom: 2px solid var(--color-primary);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 64rem;
    margin-inline: auto;
    padding-inline: 1rem;
    height: 3.5rem;
  }

  .site-logo {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }
  .site-logo:hover { opacity: 0.75; }

  /* Placeholder wordmark. The four-spot grid logo (EC over XC) lands in the brand pass. */
  .logo-ecxc {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.6rem;
    letter-spacing: -0.01em;
    color: var(--color-primary);
  }

  /* Desktop nav */
  .desktop-links {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .nav-link {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--color-muted);
    text-decoration: none;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    transition: color 0.15s ease, background 0.15s ease;
  }
  .nav-link:hover { color: var(--color-body); }
  .nav-link.active {
    color: var(--color-primary);
    background: var(--color-base-200);
  }

  .nav-icons {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .nav-icon {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0.4rem;
    cursor: pointer;
    color: var(--color-muted);
    transition: color 0.2s ease;
  }
  .nav-icon:hover { color: var(--color-body); }

  /* Mobile */
  .mobile-right {
    display: none;
    align-items: center;
    gap: 0.1rem;
  }

  .hamburger {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0.4rem;
    cursor: pointer;
    color: var(--color-muted);
    transition: color 0.2s ease;
  }
  .hamburger:hover { color: var(--color-body); }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    background: var(--color-base-100);
    border-top: 1px solid var(--color-border-subtle);
    padding: 0.5rem 1rem 1rem;
    max-width: 64rem;
    margin-inline: auto;
  }

  .mobile-link {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-muted);
    text-decoration: none;
    padding-block: 0.65rem;
    border-bottom: 1px solid var(--color-border-subtle);
    transition: color 0.15s ease;
  }
  .mobile-link:last-child { border-bottom: none; }
  .mobile-link:hover { color: var(--color-body); }
  .mobile-link.active { color: var(--color-primary); }

  @media (max-width: 639px) {
    .desktop-links { display: none; }
    .mobile-right { display: flex; }
  }
</style>
