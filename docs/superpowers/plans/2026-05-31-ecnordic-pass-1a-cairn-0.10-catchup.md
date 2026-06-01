# ecnordic Pass 1a: cairn-cms 0.10 version catch-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump ecnordic-ski from `@glw907/cairn-cms@0.6.0` to `^0.10.0`, fix every breaking-API change, and declare the posts URL policy so the admin create and edit flow handles ecnordic's month-dated posts, with the existing public content routes left working unchanged.

**Architecture:** A focused catch-up. The breaking surface is small and known: the adapter's `renderPreview` member became `render`, the admin `EditPage` prop renamed to match, and the dated-slug model now reads each concept's `datePrefix` from the YAML site-config through `composeRuntime`. ecnordic posts are `YYYY-MM-slug.md` (month granularity), so the YAML must declare `datePrefix: month` or the admin create flow produces the wrong filename. The public delivery surface (the catch-all route, engine feeds, retiring `posts.ts`/`feed.ts`) is a separate Pass 1b, written after this lands. Everything else in ecnordic's cairn-cms usage is signature-compatible across `0.6` to `0.10`.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, `@glw907/cairn-cms@^0.10.0`, vitest, npm workspaces (ecnordic is a member of the `~/Projects/cairn` root workspace).

**Design reference:** `docs/superpowers/specs/2026-05-31-ecnordic-cairn-0.10-migration-design.md` (Pass 1 split into 1a catch-up and 1b delivery, recorded in the design's pass breakdown).

---

## File structure

- Modify `package.json`: bump `@glw907/cairn-cms` to `^0.10.0`, remove the `carta-md` dependency (0.9.0 swapped the editor to CodeMirror, which cairn-cms bundles; nothing in ecnordic imports carta).
- Modify `src/lib/cairn.config.ts`: rename the adapter member `renderPreview` to `render`.
- Modify `src/routes/admin/(app)/[concept]/[id]/+page.svelte`: rename the `EditPage` prop `renderPreview` to `render`.
- Modify `src/lib/site.config.yaml`: add a `content:` block declaring the posts URL policy.
- Modify `src/lib/cairn.server.ts`: thread `urlPolicyFrom(siteConfig)` into `composeRuntime`.
- Modify `src/lib/markdown/render.ts`: drop the stale Carta reference in the header comment.
- Create `tests/config/url-policy.test.ts`: prove the YAML carries `posts.datePrefix: month` and the permalink.

## Conventions for every task

- ecnordic deploys on push to `main`, and an editor SAVE commits content to `main`. This pass must NOT exercise the live create flow against the real GitHub backend, since a real create would push a file and deploy. Verify the dated-create wiring with the unit test and a local `wrangler dev` editor load, not a live commit.
- Run `npm run check` (svelte-check) and `npm test` (vitest) before each commit. svelte-check reads 0 errors, 0 warnings.
- Commit specific files, never `git add -A`. Commit footer: `Co-Authored-By: Claude <noreply@anthropic.com>`. No em dashes in commit bodies; plain voice.
- The repo content guard runs on `src/content/**`. This pass touches no content files, so it does not enter into it.

---

## Task 1: Bump the dependency, drop carta-md, and relock

**Files:**
- Modify: `package.json`
- Modify: `src/lib/markdown/render.ts` (stale comment)

ecnordic is a member of the `~/Projects/cairn` npm workspace, so a plain `npm install` from here rewrites the ROOT lock and leaves ecnordic's committed lock stale, which breaks CI `npm ci`. Install standalone by temporarily moving the root manifest and lock aside, the documented relock procedure.

- [ ] **Step 1: Edit `package.json`**

In the `dependencies` block, change the cairn-cms pin and remove carta-md:

```jsonc
// before
"@glw907/cairn-cms": "0.6.0",
// ...
"carta-md": "4.11.2",

// after: pin caret, and delete the carta-md line entirely
"@glw907/cairn-cms": "^0.10.0",
```

(Leave every other dependency as-is. The remark/rehype/hastscript/unified deps are ecnordic's own render-pipeline deps, not cairn-cms peers.)

- [ ] **Step 2: Drop the stale Carta comment in `src/lib/markdown/render.ts`**

The header comment references Carta, which no longer applies. Read the file's first comment block and remove only the Carta sentence, leaving the rest of the comment and all code unchanged. The code already only calls `createRenderer` and re-exports the plugins; there is no functional carta dependency.

- [ ] **Step 3: Relock standalone (keeps the root workspace lock untouched)**

Run from the ecnordic-ski directory:

```bash
cd /home/glw907/Projects/cairn/ecnordic-ski
mv ../package.json /tmp/cairn-root-package.json
mv ../package-lock.json /tmp/cairn-root-package-lock.json
rm -rf node_modules package-lock.json
npm install
mv /tmp/cairn-root-package.json ../package.json
mv /tmp/cairn-root-package-lock.json ../package-lock.json
```

With the root manifest moved aside, npm treats ecnordic as standalone and resolves `^0.10.0` from the registry (the published `0.10.0`; the local workspace copy is not ahead, so no symlink engages).

- [ ] **Step 4: Verify the installed version and the stale lock is gone**

Run: `node -p "require('./node_modules/@glw907/cairn-cms/package.json').version"`
Expected: `0.10.0`.

Run: `node -p "Object.keys(require('./package.json').dependencies).includes('carta-md')"`
Expected: `false`.

- [ ] **Step 5: Confirm the build now fails on the known breaking API (the red state)**

Run: `npm run check`
Expected: FAIL. svelte-check reports errors that `renderPreview` is not a known property of `CairnAdapter` (in `src/lib/cairn.config.ts`) and not a known `EditPage` prop (in the admin edit mount), and that the required `render` member is missing. This is the migration surface Tasks 2 and 3 fix.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/markdown/render.ts
git commit -m "build: bump cairn-cms to ^0.10.0 and drop carta-md

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Rename the adapter renderer to `render`

**Files:**
- Modify: `src/lib/cairn.config.ts`

The `0.7.0` rename: `CairnAdapter.renderPreview` became the required `render(md, opts?)`. ecnordic's existing arrow already satisfies the signature, since `markdownToHtml(md)` ignores the optional second argument.

- [ ] **Step 1: Rename the member**

In `src/lib/cairn.config.ts`, change the renderer member and its comment:

```ts
// before
  // The editor preview runs the same sanitized directive render as the public page.
  renderPreview: (md) => markdownToHtml(md),

// after
  // The site's one renderer: the editor preview and (in Pass 1b) every public page call it.
  render: (md) => markdownToHtml(md),
```

- [ ] **Step 2: Verify the adapter type error is gone**

Run: `npm run check`
Expected: the `cairn.config.ts` `renderPreview`/`render` error is resolved. The admin edit mount still errors on its `renderPreview` prop (Task 3). No new errors in `cairn.config.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/cairn.config.ts
git commit -m "feat: rename the cairn adapter renderer to render

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Update the admin editor mount prop

**Files:**
- Modify: `src/routes/admin/(app)/[concept]/[id]/+page.svelte`

`EditPage` renamed its `renderPreview` prop to `render` in `0.9.0` (the CodeMirror editor swap). ecnordic never passed the dropped Carta `preview` prop, so the only change is this rename. `icons` is optional and ecnordic has no icon set, so it stays omitted.

- [ ] **Step 1: Rename the prop**

In `src/routes/admin/(app)/[concept]/[id]/+page.svelte`, change the `EditPage` usage:

```svelte
<!-- before -->
<EditPage data={{ ...data, siteName: cairn.siteName }} renderPreview={cairn.renderPreview} />

<!-- after -->
<EditPage data={{ ...data, siteName: cairn.siteName }} render={cairn.render} />
```

- [ ] **Step 2: Verify the type check is fully green**

Run: `npm run check`
Expected: PASS, 0 errors and 0 warnings. The breaking-API surface is now closed.

Run: `npm test`
Expected: PASS, exit 0 (the existing suite still passes; nothing in it touched the rename).

- [ ] **Step 3: Commit**

```bash
git add "src/routes/admin/(app)/[concept]/[id]/+page.svelte"
git commit -m "feat: pass render to EditPage in the admin edit mount

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Declare the posts URL policy in the YAML site-config

**Files:**
- Modify: `src/lib/site.config.yaml`
- Test: `tests/config/url-policy.test.ts`

The dated-slug model reads each concept's `permalink` and `datePrefix` from a `content:` block in the YAML site-config. ecnordic posts are month-dated (`YYYY-MM-slug.md`), so `datePrefix: month` is required for the admin create flow (Task 5) and for the Pass 1b delivery surface. The permalink `/:year/:month/:slug` matches ecnordic's current `[year]/[month]/[slug]` route, so no URL moves.

- [ ] **Step 1: Write the failing test**

```ts
// tests/config/url-policy.test.ts
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { parseSiteConfig, urlPolicyFrom } from '@glw907/cairn-cms';

// Parse the real YAML straight off disk, so the test proves the committed config
// rather than any build-time import wiring.
const yaml = readFileSync(new URL('../../src/lib/site.config.yaml', import.meta.url), 'utf8');
const policy = urlPolicyFrom(parseSiteConfig(yaml));

describe('posts URL policy', () => {
  it('declares month-granularity dated posts', () => {
    expect(policy.posts?.datePrefix).toBe('month');
  });

  it('declares the dated permalink that matches the current route', () => {
    expect(policy.posts?.permalink).toBe('/:year/:month/:slug');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/config/url-policy.test.ts`
Expected: FAIL, `policy.posts` is undefined because the YAML has no `content:` block yet.

- [ ] **Step 3: Add the `content:` block to the YAML**

In `src/lib/site.config.yaml`, add a top-level `content:` block (place it after the `locale:` line, before `menus:`):

```yaml
content:
  posts:
    permalink: /:year/:month/:slug
    datePrefix: month
```

(Pages need no entry: the default permalink for pages is `/:slug`, which is ecnordic's current page route, and pages are not dated.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/config/url-policy.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Gate and commit**

Run `npm run check` (0/0) and `npm test` (exit 0), then:

```bash
git add src/lib/site.config.yaml tests/config/url-policy.test.ts
git commit -m "feat: declare the month-dated posts URL policy in the site config

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Thread the URL policy through composeRuntime

**Files:**
- Modify: `src/lib/cairn.server.ts`

`composeRuntime(adapter, extensions, urlPolicy)` passes the per-concept URL policy into `normalizeConcepts`, which sets each descriptor's `datePrefix`. The admin `createAction` reads `concept.datePrefix` through `composeDatedId` to build a new post's filename. Without the policy, posts default to `datePrefix: day` and a new post would be written as `YYYY-MM-DD-slug.md` instead of ecnordic's `YYYY-MM-slug.md`.

- [ ] **Step 1: Read the current `cairn.server.ts`**

Confirm the current composition line reads `const runtime = composeRuntime(cairn);` and note the existing imports.

- [ ] **Step 2: Import `urlPolicyFrom` and `siteConfig`, and pass the policy**

In `src/lib/cairn.server.ts`:

Add `urlPolicyFrom` to the existing `@glw907/cairn-cms` import (or add the import if none exists):

```ts
import { composeRuntime, urlPolicyFrom } from '@glw907/cairn-cms';
```

Import the parsed site config (exported from `src/lib/config.ts`):

```ts
import { siteConfig } from './config.js';
```

Change the composition to pass the policy as the third argument (the second is the extensions array, which stays empty):

```ts
// before
const runtime = composeRuntime(cairn);
// after
const runtime = composeRuntime(cairn, [], urlPolicyFrom(siteConfig));
```

(Match the file's actual import style and the runtime variable name when you read it in Step 1. The `composeRuntime` import may already be present; if so, only add `urlPolicyFrom` to it.)

- [ ] **Step 3: Verify the type check passes**

Run: `npm run check`
Expected: PASS, 0 errors and 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add src/lib/cairn.server.ts
git commit -m "feat: thread the posts URL policy into the runtime

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Full gate and local verification

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `npm run check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Unit tests**

Run: `npm test`
Expected: PASS, exit 0 (includes the new `url-policy` test and the existing suite).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: the build succeeds. The existing public routes (`posts.ts`/`pages.ts`/`feed.ts` and the per-token routes) still serve content, since Pass 1a leaves them in place.

- [ ] **Step 4: Confirm existing public URLs are unchanged**

Spot-check the built output or a `npm run preview` for the known URLs: the home page, a post at `/2026/05/welcome/` (the `2026-05-welcome.md` post), a page at `/about/`, the tag pages, `/feed.xml`, and `/feed.json`. Each resolves exactly as before. No URL moved, because Pass 1a changed no routing.

- [ ] **Step 5: Local admin editor smoke (no live commit)**

Start the admin against a real Worker locally:

Run: `npx wrangler dev` (or the repo's documented admin dev command), then load `/admin` and open an existing post in the editor.
Expected: the editor loads on the CodeMirror surface, the preview renders, and the form is intact. Do NOT save a new post through the live GitHub backend from this smoke, since a real create commits to `main` and deploys. The dated-create filename derivation is already proven by the `url-policy` test plus the engine's own `composeDatedId` tests; the live create runs for real only when an editor next adds a post.

- [ ] **Step 6: Confirm the committed lock is correct for CI**

Run: `node -p "require('./package-lock.json').packages[''].dependencies['@glw907/cairn-cms']"`
Expected: `^0.10.0`, and `carta-md` absent from the lock. This is what CI `npm ci` installs against.

---

## Self-review notes

- **Spec coverage:** this plan is the Pass 1a half of the design's Pass 1. It covers the version bump (Task 1), the `renderPreview`-to-`render` rename on both the adapter (Task 2) and the editor mount (Task 3), the YAML URL policy required for month-dated admin create (Tasks 4 and 5), and verification (Task 6). The delivery surface (catch-all route, engine feeds, sitemap, retiring `posts.ts`/`pages.ts`/`feed.ts`) is deliberately deferred to Pass 1b.
- **Breaking-API completeness:** the runtime factories (`composeRuntime`, `createContentRoutes`, `createAuthRoutes`, `createEditorRoutes`, `createNavRoutes`), every other admin route, and all other ecnordic imports from cairn-cms are signature-compatible across `0.6` to `0.10`, so they need no edit. The only required code edits are the two renames, the YAML block, and the one-line policy threading.
- **`SiteConfig` typing:** ecnordic's `EcSettings`/`EcEmail`/`EcFooter` casts in `config.ts` stay. `0.10`'s `SiteConfig` still types non-core keys as `unknown`, so the workaround is still load-bearing. It is left untouched.
- **No content change:** no `src/content` file is touched, so the content guard is not involved and no rendered output moves.
