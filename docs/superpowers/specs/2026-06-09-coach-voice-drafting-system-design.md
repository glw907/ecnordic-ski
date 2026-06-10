# Coach Voice Drafting System

Date: 2026-06-09. Approved in-session by Geoff.

## The problem

The content system measures quality after drafting instead of generating it up front. The
2026-06-09 rubric audit made the gap concrete: pages scored 83 to 87 and still edit hard, because
the guide is mostly prohibitions and adjectives, the rubric grades finished prose, and nothing
hands the drafting model the material a good first draft is made of. Geoff's goal is a draft worth
editing, not a score. Most observed slop is fact starvation: where the model lacked a concrete
detail it padded with abstraction, taglines, and benefit framing, and those padding sites are
exactly what makes editing tedious.

## The model: cairn's admin design system

`cairn-cms/docs/internal/admin-design-system.md` makes every new admin surface come out right on
the first pass by putting one generative authority in front of the model at build time:
load-bearing rules, then tokens, then component recipes with the voice embedded, then a procedure
for adding a new surface. This spec translates that pattern to prose.

## Decisions

1. **`docs/content-guide.md` is restructured into the generative authority**, same skeleton:
   load-bearing rules first (about six; break one and the prose reads wrong), then the container
   length budgets, then per-content-type recipes, each a shape plus one real annotated exemplar
   (drawn from the corpus or from audit-praised passages, never invented), then the voice notes,
   with the avoid-catalog demoted to a back section (it is the guard's domain, and the method's
   research says prohibition lists decay over a draft anyway). The corpus
   (`docs/coach-voice-corpus.md`) stays separate as the exemplar library the recipes point into.

2. **Drafting is brief-first.** `content-draft` builds a structured brief before any prose: the
   verifiable facts (places, times, names, costs), the audience questions the page must answer,
   the one next step, and the container plan. Prose is generated from the brief, recipe by recipe.
   Where the brief has a gap, the draft carries a visible `[ASK: question]` marker instead of
   writing around it; drafting never blocks on Geoff. Briefs are durable files in
   `docs/content-briefs/`, one per page, so a redraft starts from facts instead of from the old
   prose.

3. **Length budgets are part of the recipes.** Site copy renders into fixed UI containers, and a
   draft that overflows a card or program tile breaks the page. Budgets are derived from the
   shipped pages (the containers they render into today): lede 1 to 3 sentences; `passage` one
   paragraph, 80 to 120 words; `card` 50 to 150 words; `aside` glossary 25 to 50 words; `alert` 40
   to 90 words; `grid` bullets 25 to 60 words each, three to five bullets; `panel` 50 to 120
   words; `cta` 30 to 60 words plus the link; `program` tile body 15 to 25 words; `zone` 15 to 30
   words; `day` tile 5 to 12 words; `faq` answer 1 to 3 sentences.

4. **Scoring is demoted.** `content-review`'s default output becomes the four hard gates (banned
   vocabulary, unverified claim, safety promise, cost misstatement) plus a findings list ordered
   by edit cost. The band and 0-to-100 score move behind an explicit request. The rubric text
   stays in the method for when a score is asked for.

5. **The learning loop is the corpus.** After Geoff ships an edit, the diff against the draft is
   harvested: his strongest passages go into the corpus's First-party gold; a fix he makes twice
   becomes a load-bearing rule. The harvest procedure lives in the corpus doc; it runs on request
   ("feed my edits back"), not automatically.

6. **Draft-off is an optional flag, not the default.** For a high-stakes page, two or three
   candidates from deliberately different stances, judged against the corpus, best parts spliced.
   Documented in the method as an option; not used for routine drafting.

## First test: rewrite the site

The new system's acceptance test is rewriting all five pages (`home`, `about`, `training`,
`crewlab`, `volunteers`) through it: brief extracted from the current page's facts, then a full
rewrite. Structure is in scope (per Geoff, 2026-06-09): each brief designs its own container
plan from the registered directive vocabulary, adding or dropping UI components as the prose
needs; the budgets apply per container type wherever one is used. Hard gates checked per page. Backlog #21's crewlab payment gap ships as an `[ASK]` marker. Geoff final edits,
and those edits seed First-party gold via the harvest loop. As dated historical content, the
welcome post is not rewritten.

## Touched surfaces

- This repo: `docs/content-guide.md` (restructure), `docs/coach-voice-corpus.md` (harvest
  procedure), `docs/content-briefs/*.md` (new), `src/content/pages/*.md` (rewrite),
  `.claude/rules/content.md` (brief-first pointer).
- Dotfiles: `~/.claude/docs/web-content-method.md` (brief step, demoted scoring, draft-off
  option), `content-draft` and `content-review` skills (procedure updates). Committed in
  dotfiles, push left to Geoff.

## Out of scope

Automation of the harvest (a hook or admin surface), the 907.life rollout (backlog #27 carries
it), and any change to the prose-guard tiers.
