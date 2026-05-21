import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  ssr: {
    external: ['cloudflare:email']
  },
  build: {
    rollupOptions: {
      // Pagefind's UI bundle is generated after the build by `npx pagefind`,
      // so it doesn't exist at bundle time. Keep the runtime import external
      // (Vite 8's Rolldown bundler resolves it eagerly otherwise).
      external: ['cloudflare:email', '/pagefind/pagefind-ui.js']
    }
  }
});
