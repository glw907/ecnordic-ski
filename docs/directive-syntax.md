# Directive syntax for page content

EC Nordic pages use container directives to lay out cards, grids, callouts, and split sections. This
is the markdown extension the render pipeline understands. Posts are plain markdown; directives are a
page-content tool.

**Source of truth.** The registry in `src/lib/markdown/components.ts` defines every directive: its
name, slots, attributes, and the `insertTemplate` the admin editor inserts. If this guide and that
file ever disagree, the file wins. The valid icon names live in `src/lib/markdown/icons.ts`. Read
both when adding or changing a directive; read this guide when drafting content with the directives
that already exist.

## How a container directive is written

A container directive opens with a colon fence and a name, and closes with a matching fence. The
syntax accepts three or more colons. EC Nordic's pages standardize on four at the top level, so any
block can host a nested one without a fence collision. Match that convention when you draft:

```
::::card[Card title]{icon="flag"}
Body copy goes here. It is ordinary markdown.
::::
```

The admin editor's insert templates use three colons, which renders the same. The pages use four, so
prefer four for consistency with what is already authored.

Three parts carry the content:

- `[label]` is the **title slot**. It renders as an `<h2>` heading inside the component. Most
  directives require it; `panel` is the exception.
- The lines between the fences are the **body slot**, parsed as markdown. Lists, links, and emphasis
  all work.
- `{...}` holds **attributes**, written as `key="value"`. The two attributes in play are `icon` and
  `role`.

Nesting uses colon count. The outer fence takes more colons than the inner one, so a `split` that
wraps two panels opens with four colons and the panels open with three:

```
::::split[How it works]
:::panel{icon="hand-coins"}
First panel copy.
:::

:::panel{icon="handshake"}
Second panel copy.
:::
::::
```

## The seven directives

| Name | Title | Body | Attributes | What it renders |
|------|-------|------|------------|-----------------|
| `card` | required | yes | `icon`, `role` | A bordered card with an icon-and-heading row above the body. |
| `grid` | required | yes | `icon`, `role` | A card whose first bullet list lays out as a responsive grid. |
| `alert` | required | yes | `icon`, `role` (required) | A callout box keyed to a role. The only role is `caution`. |
| `cta` | required | yes | `icon` | A centered card with a chip icon and an emphasized button link. |
| `split` | required | yes | none | A card that lays its nested `panel` blocks side by side. |
| `panel` | none | yes | `icon`, `role` | A single panel with an optional icon. Use it inside `split`. |
| `passage` | required | yes | `icon`, `role` | A titled section without the card border. |

### Per-directive notes

`card` is the workhorse. Write `::::card[Title]{icon="flag"}`, then the body.

`grid` takes an optional intro line followed by a bullet list. The first list becomes the grid. A
typical open is `::::grid[What to bring]{icon="backpack"}`.

`alert` requires `role="caution"`. A caution alert with no `icon` defaults to the `warning` glyph, so
you rarely set the icon by hand. Open it with `::::alert[Heads up]{role="caution"}`.

`cta` promotes a link to a primary button. Put one link in the body with `class="download-link"`, as
in `<a class="download-link" href="/waiver">Sign the waiver</a>`.

`split` and `panel` work as a pair. A `panel` is only meaningful inside a `split`. A bare `panel`
renders, but the side-by-side layout comes from the `split` wrapper. Mind the colon count: four
outside, three inside.

`passage` has the same shape as `card` without the card chrome, for a lighter titled section.

## Valid icon names

The `icon` attribute takes one of these names (Phosphor glyphs from `icons.ts`). A name outside this
list renders nothing, so it is a silent miss to watch for:

```
backpack  calendar-blank  chat-circle  compass  flag  hand-coins
handshake  path  person-simple-run  tent  users-three  warning
```

## The `role` attribute

For `alert`, `role` must be `caution`. For `card`, `grid`, `panel`, and `passage`, `role` is
`primary` or `secondary` and tints the icon. Leave it off when the default sits fine.

## A worked example

```
::::card[Practice schedule]{icon="calendar-blank"}
We meet Monday through Thursday after school. Saturdays are for longer distance
sessions and the occasional race.
::::

::::alert[Dress for the cold]{role="caution"}
Layers matter more than a single heavy coat. Bring a change of socks.
::::
```

Both blocks render without any heading markdown, because the `[label]` is the heading. The alert sets
its required `role` and lets the `icon` default to `warning`.
