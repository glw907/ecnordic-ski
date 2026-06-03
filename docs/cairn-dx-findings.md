# cairn-cms DX findings (from the ecnordic 0.21 migration)

Friction this migration hit in the cairn-cms consumer surface. Each entry: the symptom, where it
bit, and a concrete suggested fix. The pass-end synthesis (Plan B, final task) files these as
engine backlog items in cairn-cms.

The primary lens is SvelteKit-developer fit: cairn is a fully SvelteKit tool, so the test that
matters most is whether each step feels native to a SvelteKit developer. Record SvelteKit-fit
observations in their own section below, and rank them above cosmetic friction.

## SvelteKit fit

Does cairn feel native to a SvelteKit developer? One entry per surface as you wire it. Prompts: does
the adapter read like ordinary config; do the routes read like normal `load`/`actions`/`+server`
handlers; do the types flow without casts; do `$props`/`$app/state`/the runes behave; does
`createPublicRoutes`/`CairnHead`/`createContentRoutes` compose like a SvelteKit library should; are
the import paths and the export map obvious. Note both what flowed naturally and what fought a
SvelteKit idiom.

1. **A plain `npm install` cannot relock the site lockfile.** Symptom: ecnordic is an npm
   workspace member, so running `npm install` from inside the site rewrites the workspace-root
   lockfile and leaves the site's own committed lockfile stale, which breaks CI `npm ci`. The
   version bump needs a move-aside dance (mv the root `package.json` and `package-lock.json` aside,
   `npm install --package-lock-only --ignore-scripts`, then restore the root files). Location: the
   `^0.21.0` bump in `package.json`, Plan A Task 1. A SvelteKit developer expects a bump and a plain
   `npm install` to refresh the lockfile in place. Fix: the create-cairn-site scaffolder should
   document the relock step in the site README, or ship a small `npm run relock` script that wraps
   the move-aside so the site dev never types it by hand. Standalone (non-workspace) sites avoid this
   entirely, so the scaffolder output should not assume the workspace layout.

## Findings

1. **Coupled breaking changes force a big-bang migration.** 0.12 (the build signature) and 0.13
   (the adapter contract) both gate compilation, so a consumer bumps and the repo does not compile
   until the adapter and every component are ported together. Fix: a per-version `MIGRATION.md`, or a
   codemod, or a deprecation window that keeps the old members working with a warning.
2. **`splitHead` removed with no migration note.** The "first `##` is the title" helper is gone,
   replaced by the `title` slot, with no changelog pointer. Fix: a changelog entry naming the
   replacement.
