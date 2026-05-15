# Content Standards

Before writing or editing any website content — pages, posts, or form copy — read the content guide:

**`docs/content-guide.md`**

## The short version

- **Voice:** Friendly, competent coach. Not corporate, not cheerleader.
- **Audience:** High school athletes and their parents — write to both at once.
- **Person:** "you" for reader, "we" for ECN.
- **ECN:** Write out "East Community Nordic" on first reference, then "ECN."
- **Cost:** Always state clearly — training is free, donations optional.
- **Benefit restatement:** State the fact. Trust the reader. Don't follow up with a sentence explaining why the fact is good.

## Post tags (controlled vocabulary)

`training` · `racing` · `results` · `events` · `camp` · `announcements`

Do not invent new tags.

## New posts

Create at `src/content/posts/YYYY-MM-DD-slug.md` with front matter:

```yaml
---
title: "Post Title"
date: YYYY-MM-DD
draft: false
description: "One sentence. This becomes the excerpt — write it to stand alone."
tags: ["training"]
---
```

## New pages

Create at `src/content/pages/slug.md`. The slug becomes the URL path (`/slug`).

Add to nav in `src/lib/components/Nav.svelte` if it should appear in primary navigation.
