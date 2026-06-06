# Web-content authoring infrastructure: drafting skill, review rubric, shared method

Date: 2026-06-05
Status: Approved design, ready for an implementation plan

## Problem

The site's prose stack was built coder-first. The `writing-voice` output style, the
`prose-voice.md` reference, and the `prose-guard` hook all assume technical writing: terse,
plain, and stripped of decoration. That register fits code comments, docs, specs, and commit
messages. It does not fit website content for high-school athletes and their parents.

Two gaps follow. First, there is no skill that drives drafting. The one editorial skill,
`content-cleanup`, reviews finished copy and flags ten named patterns, but it starts after the
words are on the page and it produces a yes/no flag, not a measured quality signal. Second,
nothing makes the writer start from the audience. The hardest part of website copy is deciding
who it serves and what they need before a sentence is written, and the current tools say nothing
about that step.

The user's standard for participant-facing copy is explicit: write like a coach at a trailhead,
concrete and local, and recognize that this audience spots AI-style school communications and
brochure prose on sight. That standard has no home in the infrastructure today. It lives only in
`docs/content-guide.md`, which the drafting tools do not enforce as a process.

## Goal

Build a web-content authoring track that starts from the audience, drafts in the right register,
and scores the result against a rubric. Keep the technical writing track intact. Make the
method reusable across sites (ecnordic, 907.life) while each site keeps its own voice.

## Non-goals

- No change to the technical writing track. Code comments, docs, specs, and commit messages keep
  the existing voice, the `prose-voice.md` reference, and the `prose-guard` docs and comments
  tiers. This work adds a register; it does not replace one.
- No rewrite of existing site content. The skills and rubric apply going forward and on demand.
- No new automated detector. The rubric uses `prose-guard`'s existing sweep for machine signals
  and agent judgment for the rest. Burstiness and word-list checks are one input, not a verdict.

## Design principle: one floor, two registers, chosen by context

A website article is not a code comment. The model is a single quality floor with two registers
selected by what is being written.

- **Floor, always on.** The `writing-voice` output style: plain voice, varied cadence, no AI
  tells. It applies to everything.
- **Technical register.** Code comments, docs, specs, commits, READMEs. Governed by
  `prose-voice.md`, the `go-conventions` skill, and the `prose-guard` docs and comments tiers.
  Unchanged by this work.
- **Web-content register, new.** Site pages, posts, and form copy. Audience-first, coach at a
  trailhead, governed by the site `content-guide.md`, the `prose-guard` general tier, and the two
  new skills.

`prose-guard` already routes by tier: the general tier for `.md` under `src/content/`, the docs
tier for other `.md`, and the comments tier for code. That tier map is the context router. The
web-content register plugs into the general tier and leaves the technical tiers alone.

## Architecture and homes

The hybrid split puts the method in the dotfiles and the voice in each repo.

**Shared, in `~/.dotfiles/claude/.claude/` (synced by stow, reusable across sites):**

- `docs/web-content-method.md`: the methodology. It holds the audience-first drafting method, the
  full Signs-of-AI-writing catalog (banned vocabulary, constructions, structural and tonal tells)
  in fenced blocks, the scoring rubric, and the calibration note. Both skills load it.
- `skills/content-draft/SKILL.md`: the drafting skill.
- `skills/content-review/SKILL.md`: the review-and-score skill.

**Local, in the ecnordic repo:**

- `docs/content-guide.md`: stays the site voice source of truth. It gains a short pointer to the
  shared method and keeps the ecnordic specifics (the trailhead voice, the Anchorage features, the
  off/on-voice examples). It does not duplicate the catalog.
- `.claude/rules/content.md`: routes drafting to `content-draft` and review to `content-review`.
- `.claude/skills/content-cleanup/`: deleted. `content-review` supersedes it.

Banned-word lists go inside fenced code blocks in every file, because `prose-guard` skips fenced
content. That is why this spec, the method doc, and the guide can all carry the catalog without
the hook rejecting the edit.

## The drafting skill: `content-draft`

A process skill. The steps are ordered and the first one is the point of the whole skill.

1. **Audience and purpose brief, first.** Before any prose, state who the piece serves (athletes,
   parents, or both), what they already know, what they need or worry about, where and how they
   will read it, and the one action or takeaway it must land. If any of these is unknown, ask.
   Nothing gets drafted before this brief exists.
2. **Gather the concrete facts.** Pull the real specifics from the content-guide canonical facts:
   places, dates, schedule, gear, cost, sign-up. Drafting on abstractions is the failure mode this
   step prevents.
3. **Load the local register.** Read the site `content-guide.md` for the voice and the canonical
   facts.
4. **Draft.** Write audience-first, concrete, with varied sentence and paragraph length.
5. **Self-check.** Run the Signs-of-AI-writing self-check from the method doc: read it aloud, hunt
   the banned vocabulary and the negative-parallelism frame, test every dash, and check for
   trailing "-ing" editorial tags.
6. **Offer the score.** Offer to run `content-review` before saving or committing.

The skill is reusable. The audience-first steps and the self-check are site-agnostic; the local
`content-guide.md` supplies the voice and the facts.

## The review-and-score skill: `content-review`

A review skill that produces a score and a findings list, then gates edits on approval.

1. Read the target file, the site `content-guide.md`, and the rubric in the method doc.
2. Run `prose-guard` on the file for the machine signals: burstiness, banned words, structural
   tells, and the advisory sweep.
3. Score the seven dimensions. The machine signals feed cadence and part of AI-tell freedom; agent
   judgment scores audience fit, concreteness, voice, structure, and key-fact clarity.
4. Check the hard gates.
5. Compute the band: publish, hold, or redraft.
6. Report: the score table, the band, the hard-gate status, and a per-sentence findings list. Each
   finding names the specific pattern and proposes a fix. This is the `content-cleanup` behavior,
   preserved.
7. Apply only approved edits. Change nothing else.

Its description carries the old `content-cleanup` triggers (`/content-cleanup`, "clean up this
content", "check for AI tells", "editorial pass") so existing habits still reach it.

## The rubric

Audience-first, with hard gates that override the score.

**Hard gates. Any hit blocks publish, whatever the score.**

- A banned word or phrase from the catalog (also caught by `prose-guard`).
- An unverified factual claim or fabricated social proof.
- A safety or standard-of-care promise that carries legal risk.
- A cost misstatement. Training is free; donations are optional.

**Scored dimensions. Each scores 0 to 5. Weighted, then normalized to 100.**

| Dimension | Weight | Measures |
|---|---|---|
| Audience fit | x3 | Written to athletes and parents; answers their real questions; right reading level and context |
| Concreteness and local specificity | x2 | Real places, dates, workouts, gear; abstraction and marketing absent |
| Voice fidelity | x2 | Coach at a trailhead; matches the content-guide; warm, not gushing |
| AI-tell freedom | x2 | Clean against the Signs-of-AI-writing catalog |
| Cadence and burstiness | x1 | Varied sentence and paragraph length, from the `prose-guard` sweep |
| Structure and scannability | x1 | Headings, short paragraphs, tables and bullets where they earn their place |
| Key-fact and next-step clarity | x1 | Cost, schedule, safety, sign-up clear; a clear next step where relevant |

The weights sum to twelve sub-scores. Maximum raw score is sixty. The normalized score is the raw
score times 100 divided by 60.

**Bands.**

- Publish at 80 or above, with no hard-gate hit.
- Hold from 60 to 79. One revision pass, then re-score.
- Redraft below 60. Return to the brief.

**Calibration.** The agent's scoring drifts over time. The method doc carries two or three scored
sample pieces with their expected bands, so a reviewer can re-anchor periodically and keep the
scores steady.

## The shared method doc: `web-content-method.md`

The reusable reference both skills load. Its sections:

1. The audience-first method. The six drafting steps, written site-agnostic.
2. The Signs-of-AI-writing catalog. The full set, in fenced blocks so `prose-guard` skips it. It
   covers the banned vocabulary, the banned constructions, the structural tells, and the tonal
   tells. It credits Wikipedia's "Signs of AI writing" page as the source.
3. The rubric. The dimensions, weights, gates, bands, and the normalization formula.
4. The calibration samples.

The catalog's banned vocabulary, recorded for reference (this block is fenced, so the guard skips
it):

```
Vocabulary to skip: delve, dive into, navigate (as metaphor), unlock, embark, foster, cultivate,
empower, leverage, harness, unpack, underscore, bolster, shed light on, pave the way, robust,
comprehensive, vibrant, dynamic, seamless, holistic, intricate, nuanced (as empty praise),
multifaceted, journey (as metaphor), passion, passionate, vital, crucial, essential, pivotal,
transformative, groundbreaking, cutting-edge, innovative, foundational, testament.

Constructions to skip: "It's not just X. It's Y." and every negative-parallelism form;
"Whether you're a beginner or a seasoned racer..."; "More than just..."; "In today's world...";
"It's worth noting / It's important to note"; "When it comes to / At its core / At the end of the
day"; "Join us as we... / Discover the joy of..."; "Take it to the next level"; opening with a
rhetorical question; closing with a motivational tag; sentences ending in an "-ing" editorial tag.

Structural patterns to skip: three-item lists where two or four fit equally; stacked parallel
sentence openings; every paragraph ending on a punchy line; paragraphs all the same length;
decorative em-dashes; excessive bolding; "Bold term: explanation" list formatting; bullets for
content that reads better as prose; closing summaries.

Tonal patterns to skip: promotional or tourism-website tone; performative enthusiasm; unsolicited
reassurance; phrases that promise standards of care or safety guarantees.

Wikipedia adds, beyond the user's list: copula avoidance (swapping plain is/are for fancier
being-verbs), formulaic upbeat conclusion sections, and vague attribution openers.
```

## prose-guard lexicon expansion

The general tier should enforce the approved catalog as far as a regex reliably can. The change
splits the new words by how safely they block.

- **Add to the blocking list (general tier):** the clear tells the catalog has and the tool lacks,
  for example embark, harness, bolster, groundbreaking, cutting-edge, innovative, foundational.
  These rarely appear in honest website copy, so a hard block has a low false-positive rate.
- **Add to the advisory sweep only:** the context-dependent common words, for example vital,
  crucial, essential, key, dynamic, journey, passion. These appear in normal sentences, so a hard
  block would be noisy. The sweep surfaces them without blocking the write.

This touches `~/.dotfiles/bin/.local/bin/prose-guard` and needs a `stow -R bin` refresh. The tool
has its own tests; the change keeps the existing tier structure and only extends the word lists.

## Verification

- The drafting skill produces a stated audience-and-purpose brief before any prose. A draft made
  without that brief is a failure of the skill.
- The review skill returns a score table, a band, and a per-sentence findings list on a sample
  page, and its hard gates fire on a planted banned word and a planted care promise.
- The retired `content-cleanup` triggers still reach `content-review`.
- `prose-guard --all` after the lexicon change flags a planted blocking word and surfaces a
  planted advisory word without blocking it. The tool's own tests pass.
- The technical track is unchanged: a docs or code edit behaves exactly as before.

## Risks

- **Over-blocking from the lexicon change.** The blocking and advisory split is the guard. Common
  words go advisory; only clear tells block. The tool's tests catch a regression.
- **Score drift.** Agent scoring is subjective. The calibration samples in the method doc are the
  anchor. The rubric weights are fixed so the same piece scores the same way across sessions.
- **Duplication between the method doc and the guide.** The catalog lives once, in the method doc.
  The guide references it and holds only the ecnordic voice. The plan must not copy the catalog
  into the guide.

## Out of scope, noted for later

- Applying the rubric retroactively to the existing pages as a content audit.
- A 907.life `content-guide.md` that points at the same shared method. The method is built to
  support it; wiring the second site is separate work.
