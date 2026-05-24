---
name: content-cleanup
description: "Final editorial pass on EC Nordic web content (src/content/**/*.md) before committing — flags the ten AI-rhythm patterns from docs/content-guide.md and proposes per-sentence fixes with reasons, applying nothing without approval. Use after drafting or editing any page or post, when the user says /content-cleanup, \"clean up this content\", \"check for AI tells\", or \"editorial pass\". Takes a file path as argument."
user_invocable: true
---

# Content Cleanup

Final editorial pass on EC Nordic web content before committing. Flags and proposes fixes for AI rhythm patterns. Does not rewrite silently — proposes each change with a reason, waits for approval.

## When to Use

After drafting any page or post content, before committing. Invoke as:

```
/content-cleanup src/content/pages/summer-training.md
```

Or on a post:

```
/content-cleanup src/content/posts/2026-05-14-welcome.md
```

## What It Checks

Ten named patterns from `docs/content-guide.md`. The agent flags a sentence **only if it can name the specific pattern**. No "improved the flow" rewrites.

1. **Em dash overuse** — more than one em dash per paragraph, or an em dash where a period/comma/colon would work better
2. **Uniform paragraph size** — every paragraph the same block size; no single-sentence paragraphs for emphasis
3. **Tricolon exhaustion** — multiple consecutive three-part parallel lists
4. **Paragraph summary restatement** — ending a paragraph by restating what it just said
5. **Sweeping contextual opener** — wide-angle setup before the point
6. **Participial phrase ending** — recurring "main clause, [verb]-ing at the end" pattern
7. **Fabricated social proof** — "most athletes say," "everyone agrees," unattributed generalizations
8. **Inanimate agency** — "the program provides," "training offers" where "we" would be more direct
9. **Binary "not X, but Y"** — fine once, a tell when it recurs
10. **Banned words** — seamless, transformative, robust, pivotal, foster, leverage (figurative), elevate (figurative), comprehensive, thriving, curated, tailored, dedicated, meticulous, nuanced, "it's worth noting," "when it comes to," "let's explore," "dive into," "not only X but also Y"

## Steps

1. **Read the file.** Read the full content file provided as the argument.

2. **Read the content guide.** Read `docs/content-guide.md`, specifically the "Avoiding AI Rhythm" section.

3. **Scan for patterns.** Go sentence by sentence. For each flagged sentence, record:
   - The original sentence (quoted exactly)
   - Which pattern it matches (by name from the list above)
   - A proposed replacement
   - One-line reason for the change

4. **Present findings.** Format as a numbered list:

   ```
   1. PATTERN: Em dash overuse
      ORIGINAL: "Training is free — no fees, no tryouts, no barriers."
      PROPOSED: "Training is free. No fees, no tryouts, no barriers."
      REASON: Em dash used where a period works better; the second clause is a new thought.

   2. PATTERN: Fabricated social proof
      ORIGINAL: "Most athletes say the camp does more for team cohesion than the rest of the summer."
      PROPOSED: [delete sentence]
      REASON: Unattributed generalization with no real source.
   ```

   If nothing is flagged, say so explicitly: "No patterns found. Content looks clean."

5. **Ask for approval.** After presenting all findings, ask: "Apply all changes, apply some (specify which), or skip?"

6. **Apply approved changes.** Edit the file, changing only the approved sentences. Do not touch anything else.

7. **Confirm.** Report what was changed.

## Hard Constraints

- **Never change meaning.** Only rhythm and structure. If fixing a pattern would require changing what the sentence says, flag it as "needs human judgment" and skip.
- **Never rewrite more than the flagged sentence.** No surrounding cleanup, no paragraph restructuring beyond the specific fix.
- **Never apply changes without approval.** Present first, edit after.
- **Cite a pattern or leave it alone.** If it doesn't match one of the ten named patterns, don't flag it.
- **Don't introduce new patterns while fixing old ones.** Read proposed replacements against the same checklist before presenting them.
