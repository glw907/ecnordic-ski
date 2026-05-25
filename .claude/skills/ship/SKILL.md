---
name: ship
description: "Land changes on this SvelteKit + Cloudflare project: run the quality gates (svelte-check, vitest, build), code-simplifier, commit specific files, and push to main. Use when the user says /ship, \"ship it\", \"ship\", \"commit and push\", or asks to land their changes. Takes an optional commit message as an argument. NOTE: this is the lightweight land-changes command — for the full pass-end ritual use site-pass (\"ship pass\", \"finish pass\")."
user_invocable: true
---

# /ship — Gate, Simplify, Commit, Deploy

Land the current changes on ecnordic.ski. **Pushing to `main` deploys to production**
(push → GitHub Actions → build + pagefind + `wrangler deploy` → live at
https://ecnordic.ski in ~2 min), so this skill ends by shipping the live site.

This is the quick "land my changes" path. For the full pass-end consolidation
(STATUS rewrite, plan archival, backlog reconciliation), use `site-pass` instead —
trigger it with "finish pass" / "ship pass".

## Usage

- `/ship` — auto-generate the commit message from the diff
- `/ship Drop mdsvex, gate frontmatter` — use the provided message verbatim

## Pipeline

Run sequentially. **Stop on the first failure** and report it; do not commit or push
broken work.

### 1. Quality gates

```bash
npm run check     # svelte-check — 0 errors required
npm test          # vitest run
npm run build     # full build: catches frontmatter validation + prerender breaks
```

All three matter. `check` and `test` alone won't catch a bad-frontmatter throw
(`src/lib/content-schema.ts`) or a prerender/`entries()` break — those only surface in
`npm run build`. If any gate fails, fix it and re-run before proceeding.

### 2. Simplify

Dispatch Anthropic's `code-simplifier` agent over the code changed this session
(scope it to the changed files; skip docs-only changes). Apply its refinements, then
re-run `npm run check` and `npm test` to confirm nothing broke. Docs-only commits skip
this step.

### 3. Update project state (if the work warrants it)

If the change is more than a trivial fix, keep the docs honest before committing:

- **`docs/STATUS.md`** — update "Current state" if the architecture or live behavior changed.
- **`BACKLOG.md`** — close any item this work resolved (move to `## Done` with today's
  date, verify it's actually done first); log anything newly surfaced. Use the
  `/log-issue` structured format (`**#N**`, `#type` + `#ecnordic` tags, dates).

Skip this for small self-contained changes.

### 4. Commit

- Run `git status` and `git diff`. If there are no changes, report "Nothing to ship" and stop.
- Stage each changed file **by name** (`git add <file>`). Never `git add -A` / `git add .`.
- Skip and warn on anything that looks like a secret (`.env`, `wrangler` secrets, tokens).
- Commit message: imperative mood, focused on the *why*. Use the user's argument verbatim
  if provided; otherwise generate from the diff. Always via HEREDOC with the footer:

```bash
git commit -m "$(cat <<'EOF'
Summary line in imperative mood.

Optional body explaining why.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 5. Push (this deploys)

```bash
git push origin main
```

Pushing to `main` triggers the production deploy. This project deploys *from* `main` —
that is by design here (unlike repos that forbid pushing to main). Proceed when the
user invoked `/ship`; the deploy is the intended outcome.

### 6. Confirm the deploy started

```bash
gh run list --branch main --limit 1
```

Report the commit hash, the message summary, and that the "Deploy to Cloudflare
Workers" run is queued/running. Mention it goes live in ~2 min.

## Rules

- Never amend an existing commit; if a hook fails, fix it and make a new commit.
- Never force push. Never `--no-verify`.
- Never commit secrets or `.env` files.

## When NOT to use

- Mid-implementation (changes aren't all done).
- When the user wants only a subset (just commit, just check).
- When the user wants the full pass-end ritual — use `site-pass` ("finish pass").
