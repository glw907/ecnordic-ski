# ecnordic.ski

East Community Nordic — SvelteKit + TypeScript, deployed to Cloudflare Workers.

@docs/STATUS.md

## Stack

SvelteKit · TypeScript · Tailwind CSS v4 · DaisyUI v5 · @schedule-x/svelte · remark + remark-gfm · Pagefind · @sveltejs/adapter-cloudflare

## Development Workflow

Pass-driven. Trigger phrases — "continue development," "next pass," "finish pass,"
"ship pass" — invoke the `site-pass` skill (this repo's own roadmap). For cairn-cms
library work (passes 0/A–F, tracked in `cairn-cms/docs/PLAN.md`), use `cairn-pass` instead.

## Build & Dev

```bash
npm install
npm run dev                      # dev server at http://localhost:5173
npm run build                    # build to .svelte-kit/cloudflare/
npm run build && npx pagefind --site .svelte-kit/cloudflare
```

## New Post

Create `src/content/posts/YYYY-MM-slug.md`:

```yaml
---
title: "Post Title"
date: YYYY-MM-DD
draft: false
description: "One sentence description."
tags: ["tag1"]
---
```

## New Event

Create `src/content/events/YYYY-MM-DD-slug.md`:

```yaml
---
title: "Event Name"
date: YYYY-MM-DD
end_date: YYYY-MM-DD
location: "Venue, Anchorage"
type: race
---
```

## Worker & Secrets

```bash
npx wrangler secret list
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put CONTACT_EMAIL
```

## Deploy

Push to `main` → GitHub Actions → build + pagefind + wrangler deploy → live in ~2 min.
