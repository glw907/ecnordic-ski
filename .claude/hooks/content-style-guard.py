#!/usr/bin/env python3
"""PreToolUse guard: block AI-writing tells in site content before they're saved.

Scans Write/Edit/MultiEdit operations on `src/content/**/*.md` for the
high-confidence tells the EC Nordic content guide bans (docs/content-guide.md):
the em-dash appendage, em-dash overuse, banned words/phrases, and banned
sentence openers. On a hit it exits 2 with a report on stderr, which Claude
Code feeds back to the model and blocks the write. Anything else passes through.

Deliberately high-precision, not exhaustive: it catches the repeatable, regex-
reliable tells and leaves judgment calls (cadence, tricolons) to the mandatory
self-critique pass. A guard that cries wolf gets disabled.

Crib note: structure adapted from anywhere-agents' scripts/guard.py
(stdin JSON -> deny-with-hit-list); rules seeded from docs/content-guide.md.
On any internal error it exits 0 — a hook bug must never block real work.
"""
import json
import re
import sys

# ── Rules, seeded from docs/content-guide.md (the authority) ──────────────
# Whole-word, case-insensitive. The guide bans these in EC Nordic content.
BANNED_WORDS = [
    "seamless", "transformative", "robust", "pivotal", "foster", "leverage",
    "elevate", "comprehensive", "thriving", "curated", "tailored", "dedicated",
    "meticulous", "nuanced",
    # high-confidence additions from the broader anti-slop lists
    "delve", "tapestry", "multifaceted", "testament",
]

BANNED_PHRASES = [
    "it's worth noting", "when it comes to", "at the end of the day",
    "in today's world", "let's explore", "dive into", "look no further",
    "game-changer", "game changer", "state-of-the-art",
]

# Sentence-initial throat-clearers.
BANNED_OPENERS = [
    "moreover", "additionally", "furthermore", "in conclusion", "certainly",
    "it should be noted", "needless to say",
]

EM_DASH = "—"  # —  (en dash U+2013 for ranges is fine and is NOT flagged)
SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def _strip_frontmatter(text: str) -> str:
    """Drop a leading YAML frontmatter block so titles/fields aren't scanned."""
    if text.lstrip().startswith("---"):
        parts = text.split("---", 2)
        if len(parts) == 3:
            return parts[2]
    return text


def _scannable_lines(text: str):
    """Yield prose lines, skipping fenced code, frontmatter, and PLACEHOLDER notes."""
    in_fence = False
    for line in _strip_frontmatter(text).split("\n"):
        s = line.strip()
        if s.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or not s or "PLACEHOLDER" in s:
            continue
        yield s


def scan(text: str):
    """Return a list of (kind, snippet, hint) violations."""
    issues = []
    for line in _scannable_lines(text):
        # Em-dash overuse: 3+ em dashes on a line is spray. A balanced PAIR
        # (2) bounding one appositive — "the camp — four days — is the highlight"
        # — is guide-approved, so the threshold is >2, not >1.
        if line.count(EM_DASH) > 2:
            issues.append((
                "em-dash overuse", line,
                "Three or more em dashes here. Keep at most one interruption (a pair).",
            ))
        # Em-dash appendage: a lone em dash with a short trailing fragment —
        # the exact tell ("tap Yes or No — No needs a reason."). Paired dashes
        # (a parenthetical) are allowed and skipped above by the count check.
        for sent in SENTENCE_SPLIT.split(line):
            if sent.count(EM_DASH) == 1:
                after = sent.split(EM_DASH, 1)[1]
                after = re.sub(r"[*_`)\]]+$", "", after).strip().rstrip(".!?").strip()
                if 1 <= len(after.split()) <= 6:
                    issues.append((
                        "em-dash appendage", sent.strip(),
                        "A clause + tacked-on fragment after a dash is an AI tell. "
                        "Use a period, comma, or colon, or fold it into the sentence.",
                    ))

        low = line.lower()
        for phrase in BANNED_PHRASES:
            if phrase in low:
                issues.append((f"banned phrase: {phrase}", line, "Banned in EC Nordic content. Reword."))
        if "not only" in low and "but also" in low:
            issues.append(("banned construction: not only … but also", line, "Reword without the correlative pair."))
        for word in BANNED_WORDS:
            if re.search(rf"\b{re.escape(word)}\w*\b", low):
                issues.append((f"banned word: {word}", line, "Banned in EC Nordic content. Reword."))
        for opener in BANNED_OPENERS:
            for sent in SENTENCE_SPLIT.split(line):
                # strip markdown list/emphasis markers from the sentence start
                head = re.sub(r"^[\s\-*>#]+", "", sent).lower()
                if head.startswith(opener):
                    issues.append((f"banned opener: {opener}", sent.strip(), "Start with a subject, not a connector."))
    return issues


def _content_being_written(tool_name: str, tool_input: dict) -> str:
    if tool_name == "Write":
        return tool_input.get("content", "")
    if tool_name == "Edit":
        return tool_input.get("new_string", "")
    if tool_name == "MultiEdit":
        return "\n".join(e.get("new_string", "") for e in tool_input.get("edits", []))
    return ""


def main() -> int:
    raw = sys.stdin.read()
    data = json.loads(raw)
    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    # Only guard markdown under src/content/.
    if not re.search(r"src/content/.*\.md$", file_path):
        return 0

    issues = scan(_content_being_written(tool_name, tool_input))
    if not issues:
        return 0

    lines = [
        f"CONTENT STYLE GUARD — blocked write to {file_path}",
        f"Found {len(issues)} AI-writing tell(s). Fix before saving "
        f"(see docs/content-guide.md), then run the self-critique pass.",
        "",
    ]
    for kind, snippet, hint in issues:
        snippet = (snippet[:140] + "…") if len(snippet) > 140 else snippet
        lines.append(f"  [{kind}]  {snippet}")
        lines.append(f"      → {hint}")
    print("\n".join(lines), file=sys.stderr)
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        # Never block real work because of a hook bug.
        sys.exit(0)
