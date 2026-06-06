---
name: content-review-reminder
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/content/.*\.md$
---

**Website content edited.** Before committing, run the `content-review` skill on this file to score
it against the audience-first rubric and catch AI tells. The band (publish, hold, or redraft) is the
go/no-go. This is website content, so use the web-content register, not the technical voice.
