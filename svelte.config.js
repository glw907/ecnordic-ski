import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess()],
  kit: {
    // remoteBindings:false keeps the build-time platform proxy from connecting to Cloudflare
    // during prerender. The EMAIL binding is `remote = true` for `wrangler dev` real-mail only;
    // wrangler dev still honors it, but without this the CI prerender (no Cloudflare auth) fails
    // with "Failed to start the remote proxy session".
    adapter: adapter({ platformProxy: { remoteBindings: false } }),
    experimental: {
      // Pass 9 spike: opt into experimental remote functions for the contact form.
      remoteFunctions: true
    },
    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn',
      handleUnseenRoutes: 'warn'
    }
  }
};

export default config;
