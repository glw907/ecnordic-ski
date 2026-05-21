When the user says "continue development", "next pass", "start the
next pass", "finish pass", "ship pass", or "continue" in the context
of ecnordic-ski work, invoke the `cairn-pass` skill. It handles both
pass start (read STATUS, read plan, execute) and pass end (the
consolidation ritual: code-simplifier, svelte-check, STATUS update, plan
archival, commit + push).
