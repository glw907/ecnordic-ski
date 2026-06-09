When the user says "continue development", "next pass", "start the
next pass", "finish pass", "ship pass", or "continue" in the context
of ecxc-ski's own roadmap, invoke the `site-pass` skill. It handles
both pass start (read STATUS, read plan, execute) and pass end (the
consolidation ritual: code-simplifier, quality gate, reviewer fan-out,
STATUS update, plan archival, commit + push, then roll into the next
pass). cairn-cms is a separate standalone repo; this site consumes
`@glw907/cairn-cms` from the npm registry by version range.

## Pass rhythm

Plan and execute in the same session; STATUS.md's starter prompt and the
committed plan are crash insurance, not a handoff. Execute tasks in the
main loop and clear the gate (`npm run check` 0/0, `npm test` exit 0,
`npm run build`) before moving on. Dispatch the `site-implementer` agent
only for tasks independent enough to run in parallel, or for a
high-blast-radius change that wants worktree isolation; it inherits the
session model, and `model: sonnet` downshifts a mechanical fan-out. When
most of a pass's tasks are independent, or at the review gate of a large
pass, suggest the Workflow tool and let the user opt in.

## Keep the backlog current

`BACKLOG.md` uses the `/log-issue` structured format (numbered `**#N**`
items, `#type`/`#ecnordic` tags, dates, grouped under High/Medium/Low/Done).
Use that format for new items, never plain bullets.

When work completes something tracked in the backlog, close it in the same
pass: mark `[x]`, move it to `## Done` with a completion date, and verify it's
actually done (check real state, don't assume) before closing. Don't leave
resolved items sitting open.
