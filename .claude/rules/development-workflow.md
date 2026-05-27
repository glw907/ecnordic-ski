When the user says "continue development", "next pass", "start the
next pass", "finish pass", "ship pass", or "continue" in the context
of ecnordic-ski's own roadmap, invoke the `site-pass` skill. It handles
both pass start (read STATUS, read plan, execute) and pass end (the
consolidation ritual: code-simplifier, svelte-check, STATUS update, plan
archival, commit + push). For cairn-cms library work (passes 0/A–F,
tracked in `cairn-cms/docs/PLAN.md`), use the `cairn-pass` skill instead.

## Keep the backlog current

`BACKLOG.md` uses the `/log-issue` structured format (numbered `**#N**`
items, `#type`/`#ecnordic` tags, dates, grouped under High/Medium/Low/Done).
Use that format for new items, never plain bullets.

When work completes something tracked in the backlog, close it in the same
pass: mark `[x]`, move it to `## Done` with a completion date, and verify it's
actually done (check real state, don't assume) before closing. Don't leave
resolved items sitting open.
