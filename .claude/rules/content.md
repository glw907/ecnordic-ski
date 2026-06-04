# Content Standards

Before writing or editing any website content (pages, posts, or form copy), read the content guide:

**`docs/content-guide.md`**

When drafting or editing **page** content that uses container directives (cards, grids, alerts,
callouts, split sections), also read the directive syntax reference:

**`docs/directive-syntax.md`**

Its source of truth is the registry in `src/lib/markdown/components.ts`; consult that file directly
when adding or changing a directive.

---

## Quick Reference

**Voice:** Friendly, competent coach. Second person ("you") for reader, "we" for EC Nordic.
**Audience:** High school athletes and their parents. Write to both at once.
**Short form:** "East Community Nordic" on first reference, "EC Nordic" after. Never "ECN."
**Cost:** Always state clearly. Training is free; donations are optional.

## Avoiding AI Rhythm

The goal is not to avoid specific constructions. Em dashes, parallel lists, and short declarative sentences are all fine. The problem is deploying them at a fixed rate regardless of whether they serve the sentence. Write with **burstiness**: vary sentence length and paragraph size deliberately.

<anti_patterns>
Check every draft for these before finishing:

1. **Em dash overuse.** Every em dash should be tested: would a period, comma, colon, or parenthesis work better? If yes, use that. Maximum one em dash per paragraph.

2. **Uniform paragraph size.** Not every paragraph should be 3–4 sentences. Use a one-sentence paragraph when a point deserves isolation. Let paragraph length follow the thought, not a template.

3. **Tricolon exhaustion.** Multiple consecutive three-part lists create AI rhythm. Vary list length. Sometimes two items is right.

4. **Paragraph summary restatement.** Don't end paragraphs by restating what they just said. End on substance.

5. **Sweeping contextual openers.** Don't set up wide context before the point. Start close to the point.

6. **Participial phrase endings.** Avoid the pattern "main clause, [verb]-ing at the end" as a recurring habit.

7. **Fabricated social proof.** No "most athletes say" or "everyone agrees" without a real, named source.

8. **Inanimate agency.** Prefer "we" over "the program provides" or "training offers."

9. **Binary "not X, but Y" constructions.** Fine once; a pattern is a tell.

10. **Banned words and phrases.** Do not use any of these:

```
seamless  transformative  robust  pivotal  foster  leverage (figurative)
elevate (figurative)  comprehensive  thriving  curated  tailored  dedicated
meticulous  nuanced  "it's worth noting"  "when it comes to"  "let's explore"
"dive into"  "not only X but also Y"
```
</anti_patterns>

## Self-Critique Pass (MANDATORY)

For any content longer than a paragraph this is not optional. After drafting,
re-read and **flag every sentence** matching the anti-patterns above, then
rewrite the flagged sentences before saving. In particular, test every em dash.
A clause followed by a tacked-on fragment is a tell. The classic shape:

```
tap Yes or No — No needs a reason
```

Fix it with a period, comma, or colon, or fold it into the sentence. Do this
even when you "already read the guide"; reading is not the same as running the pass.

### Automated backstop: the prose guard

The workstation `prose-guard` tool (`~/.local/bin/prose-guard`) runs as a global
`PreToolUse` hook on every Write, Edit, and MultiEdit. Content under `src/content/**/*.md`
gets the `general` tier, which carries this guide's word and phrase lists. When it finds
a tell it denies the write and tells you what tripped, so fix the flagged text instead of
working around it. The guard catches what a regex reads reliably, including banned words,
banned openers, and a stray em-dash appendage. Flat cadence and stacked tricolons slip
through, so the self-critique pass above still does the real work. This tool replaced
the old per-repo `content-style-guard.py`.

## Post Tags (controlled vocabulary)

`training` · `racing` · `results` · `events` · `camp` · `announcements`

Do not invent new tags.

## New Posts

Create at `src/content/posts/YYYY-MM-slug.md`. There is no day in the filename because the route is `[year]/[month]/[slug]`, and a day folds into the slug:

```yaml
---
title: "Post Title"
date: YYYY-MM-DD
draft: false
description: "One sentence. Stands alone as an excerpt."
tags: ["training"]
---
```

## New Pages

Create at `src/content/pages/slug.md`. The slug becomes the URL. Add to nav in `src/lib/components/Nav.svelte` if needed.
