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

2. **`defineAdapter`/`defineFields` read like ordinary typed config.** The adapter is a single
   `defineAdapter({...})` literal with one `defineFields([...])` per concept. A SvelteKit developer
   reads it as plain config, the same way they read a `svelte.config.js` or a route's `load`. The
   field declarations are flat data objects with a discriminated `type`, so editor support is good
   and no cast is needed at the call site. The one rough edge is that the inferred frontmatter type
   and the editor form both come from the same `defineFields` call, which is convenient but hides
   the validation behavior: the declaration looks like a form schema, so it is easy to assume it
   validates more than it does (see the lost-rules finding below). Ranked above the cosmetic
   findings because the schema declaration is the first thing a site author writes.

3. **The `build(ctx)` slot model reads naturally once the slot rules are known.** Porting the seven
   components, the new build signature flowed well. A build receives `ctx.attributes`, `ctx.slot(name)`,
   and `ctx.items(name)`, and arranges hast with `hastscript`. It never walks the stamped tree, which
   the old `build(node)` form forced. A SvelteKit developer reads `ctx.slot('title')` and
   `ctx.slot('body')` the way they read named slots in a Svelte component, so the mental model carries
   over. Two snags cost time. The engine does not export the `ComponentContext` type from the package
   root, so a site that writes a named helper (not an inline `build: (ctx) =>`) has to recover the type
   with `Parameters<ComponentDef['build']>[0]`. And the slot-versus-attribute split is implicit (see
   findings 3 and 4), so the first port emitted undefined icons until the attributes were declared. Ranked
   here because the build model is the core of a site's render code.

## Findings

1. **Coupled breaking changes force a big-bang migration.** 0.12 (the build signature) and 0.13
   (the adapter contract) both gate compilation, so a consumer bumps and the repo does not compile
   until the adapter and every component are ported together. Fix: a per-version `MIGRATION.md`, or a
   codemod, or a deprecation window that keeps the old members working with a warning.
2. **`splitHead` removed with no migration note, and its head markup is now the site's to rebuild.**
   The "first `##` is the title" helper is gone, replaced by the `title` slot, with no changelog
   pointer. The helper used to return `{ head, rest }`, so a card build was two lines. Now each
   component rebuilds the head row by hand: read the icon and role attributes, build the icon span,
   wrap `ctx.slot('title')` in the heading element, and assemble the `ec-head` div. ecnordic factored
   this into one local `head(ctx)` helper shared across card, grid, and passage, so the busywork lands
   once. A site with several titled components still pays the rebuild. Fix: a changelog entry naming
   the replacement, and consider an engine helper that takes a `ctx` plus a site `makeIcon` and returns
   the standard icon-plus-heading head, the way `cardShell` and `iconSpan` already factor the common
   shapes.

3. **An icon or role only reaches `ctx.attributes` when the component declares it as an attribute.**
   The render dispatch reads `dataAttr<key>`, which the stamper writes only for declared attributes.
   The first port left `icon` and `role` off the `card`/`grid`/`passage`/`panel` defs, so every icon
   came back undefined and the glyphs vanished. The fix is to declare `{ key: 'icon', type: 'icon' }`
   and `{ key: 'role', type: 'select', ... }` on each component that renders an icon. This is correct
   once you know it, but nothing in the types points at it: a build can call `ctx.attributes.icon`
   freely and get `undefined` at runtime with no compile error. Fix: document that a build may only
   read declared attributes, or have the dispatch surface a dev warning when a build reads an
   undeclared key.

4. **The alert default icon falls in a gap between the two icon paths.** The stamper applies
   `defaultIconByRole` to its special `dataIcon` marker, but a build reads `dataAttrIcon` (the declared
   attribute path), and the default is never copied there. So `:::alert{role=caution}` with no explicit
   icon arrives with `ctx.attributes.icon` undefined, and the warning glyph disappears unless the build
   hardcodes the default itself. ecnordic dropped `defaultIconByRole` from the alert def and hardcoded
   `warning` for the caution role inside `buildAlert`. That works, but it splits the default across two
   places: the engine field exists yet does nothing for a build that reads the declared attribute. Fix:
   have the stamper also write the role default to `dataAttr<iconKey>` when the component declares an
   icon attribute, so `defaultIconByRole` reaches the build and stays the single source of the default.
5. **The schema contract drops four validation rules ecnordic's old validator enforced, and there
   is no per-field custom-validator hook to restore them.** Moving from the hand-written
   `validatePostFrontmatter` to `defineFields` keeps required-and-coerce, but validate-once is
   thinner than the old validator. Each lost rule below was verified against the engine source.
   - **No real-calendar-date check.** The old validator rejected `2026-02-30`
     (`content-schema.ts:49`). validate-once does not. A `date` field coerces a JS `Date` to
     `YYYY-MM-DD` and checks non-empty only (`cairn-cms/src/lib/content/validate.ts:40-45`); the
     only date constraints available are `min`/`max` bounds
     (`cairn-cms/src/lib/content/schema.ts:76-79`). An impossible calendar date passes.
   - **No date-format check.** The old validator required `^\d{4}-\d{2}-\d{2}$` and rejected
     `5/14/26`. validate-once has no format check for `date`; a `date` field has no `pattern`
     option (`cairn-cms/src/lib/content/types.ts:53-60`). Only `text`/`textarea` carry `pattern`.
   - **No controlled-vocabulary check on `tags`.** The old validator rejected any tag outside
     `POST_TAGS` (`content-schema.ts:57-60`). validate-once treats `options` as the editor's pick
     list only; the `tags` arm coerces to a string array and never checks membership
     (`cairn-cms/src/lib/content/validate.ts:33-39`). An off-vocabulary tag committed by hand or
     a stale file passes.
   - **No at-least-one-tag requirement.** The old validator required `tags.length >= 1`
     (`content-schema.ts:54`). The plan's target posts schema does not mark `tags` as
     `required`, so an empty or absent tag list passes. (validate-once would enforce non-empty if
     `required: true` were set, per `validate.ts:36`, but membership still would not be checked.)

   The non-boolean-`draft` rejection also goes away, but that one is benign: a present non-`true`
   boolean is simply omitted (`validate.ts:31`), so a bad `draft` value cannot corrupt the file.

   The root gap is that `defineFields` has no per-field custom-validator hook. The only escape
   hatch is the `refine(data, body)` option on `defineFields`
   (`cairn-cms/src/lib/content/schema.ts:82-87`), a single cross-field function that returns
   field-keyed errors. The four lost rules could be restored there as a hand-written block, which
   puts ecnordic back to owning a validator and undercuts the single-source-of-truth goal. Fix: add
   declarative field options the schema can carry as plain data: a `calendar: true` (or implicit)
   real-date check on `date`, a `pattern` on `date`, and an `enforced` flag on a `tags` field's
   `options` so the closed vocabulary is validated, not just suggested. These keep the declaration
   serializable and avoid pushing sites back to bespoke validators.
