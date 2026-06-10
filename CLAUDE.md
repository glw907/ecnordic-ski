# ecxc.ski

East Community Cross Country. SvelteKit + TypeScript, deployed to Cloudflare Workers.

@docs/STATUS.md

## Stack

SvelteKit · TypeScript · Tailwind CSS v4 · DaisyUI v5 · @schedule-x/svelte · remark + remark-gfm · Pagefind · @sveltejs/adapter-cloudflare

## Development Workflow

Pass-driven. Any of "continue development," "next pass," "finish pass," or "ship pass" invokes the `site-pass` skill (this repo's own roadmap). The site consumes `@glw907/cairn-cms` from the npm registry by version range; that library is a separate standalone repo with its own roadmap.

## Website Content

Website content (pages, posts, form copy under `src/content/`) uses the web-content register,
not the technical voice. Draft with the `content-draft` skill (brief-first, reply stance) and
gate-check with `content-review`. Routing and voice rules are in `.claude/rules/content.md`; the
generative authority is `docs/content-guide.md`. Characterization snapshots pin the rendered
page HTML: after any content edit, run `npx vitest run -u` and commit the snapshots too.

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

The `ecxc` Worker carries three secrets. A renamed or recreated Worker starts with none (this
broke admin saves and the contact form at the Rename 4 cutover, backlog #32), so re-put all
three after any Worker rename. `GITHUB_APP_PRIVATE_KEY_B64` lives in `~/.local/secrets`; the
Turnstile secret is recoverable from the Turnstile API.

```bash
npx wrangler secret list
npx wrangler secret put GITHUB_APP_PRIVATE_KEY_B64   # cairn's GitHub App key (admin saves)
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put CONTACT_EMAIL
```

## Deploy

Push to `main` → GitHub Actions → build + pagefind + wrangler deploy → live in ~2 min.
