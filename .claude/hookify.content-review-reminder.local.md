---
name: content-review-reminder
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/content/.*\.md$
---

**Website content edited.** Before committing, run the `content-review` skill on this file: the
four hard gates plus findings are the go/no-go (scores only if asked). This is website content,
so use the web-content register, not the technical voice. Characterization snapshots pin the
rendered page HTML, so after any content change run `npx vitest run -u` and commit the
regenerated snapshots with the content.
