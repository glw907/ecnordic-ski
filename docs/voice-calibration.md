# Voice Calibration Set

Frozen judgment points from the 2026-06-09 drafting-system rebuild: passages Geoff flagged as AI
slop and passages he approved, all produced by the same system on the same day. This is the
regression set for the drafting system. When the guide, method, or skills change, redraft one
section from its brief and judge the output against these marks before trusting the change. It
is also the negative/positive priming for the independent humanize critic.

Refine as we go: when Geoff flags or praises new passages, add them here with the date. When
First-party gold accumulates in the corpus, its entries join the positive set and outrank these.

## Negative set (flagged as overt AI writing)

All five shipped from a system that was following its own rules at the time, which is the point:
each names a pattern that survives rule-following. Quoted in fences; the labels are the payload.

**N1, the summary colon-list.** A sweeping claim sets up a colon, a tidy enumeration pays it off.

```
Everything starts in CrewLAB: the schedule, the waiver, and sign-up. Questions first? Use the
contact form.
```

**N2, the chirpy ease-claim plus metaphor payoff.** App-marketing register; "completes the
picture" is a shape, not a fact.

```
Two minutes gets you on. Install CrewLAB from the App Store or Google Play (or open
app.crewlab.io), tap the invite below, and pick athlete or supporter at sign-up. A parent who
links to their athlete completes the SafeSport picture...
```

**N3, manufactured punch.** Every sentence individually shaped (only-X opener, balanced pair,
dramatic negation). Uniform punchiness is as much a tell as uniform blandness.

```
CrewLAB is the only place the liability waiver exists; there is no paper version. Guardians sign
for athletes under 18, and adult athletes, like a graduate home from college, sign for
themselves. No athlete trains, at practice or at camp, until their waiver is on file.
```

**N4, explainer gloss.** Cute verbs animating inanimate things, semicolon-spliced compression,
aphorism shapes. "Marketing copy written by a college freshman."

```
RSVP before every practice. The calendar holds each session; tap yes or no, and the app asks why
if you tap no. Keep notifications on, because weather changes land there first.
```

**N5, even-weighted triplets.** Two back-to-back balanced three-item sentences; coverage prose
addressed to no one.

```
Camp is July 21 to 24. The whole team goes to a lake near Talkeetna, stays in cabins, and trains
twice a day. Times, gear lists, and sign-up details are on the training page.
```

**N6, the pitch turn (flagged 2026-06-09, post-rebuild).** Mid-paragraph the prose stops
informing and starts selling: product-speak ("the summer piece"), a mythologizing appositive
("where a racer's base actually gets made"), and a value-proposition couplet as the close, which
is a tagline that survived rule 8 by sounding like a concession. Shipped from the corrected
reply-stance system, so the stance alone does not prevent it.

```
So we built the summer piece, the ten weeks where a racer's base actually gets made, and made it
free: coached practice three mornings a week, a plan for the days between, and a camp in July. A
club gives you far more. A free summer with a team around you still goes a long way.
```

**N7, the antithesis close, and the replacement reflex (flagged 2026-06-09).** This was the
*fix* for N6, which is the lesson: repairing a flagged closer by constructing a better closer
regenerates the slop in a new shape. Here the shape is a balanced antithesis pair performing
humility. The default fix for a flagged closing line is deletion; the paragraph already ended at
its last fact.

```
We can't offer what a club offers, and we don't try to. We cover the summer.
```

**N8, the false frame (flagged 2026-06-09).** A different axis from N1 through N7: not style but
logic. The why-we-started frame implied the clubs leave summer uncovered; they train straight
through it, five-plus days a week, so the paragraph "doesn't even make logical sense" to anyone
who knows the local scene. No single sentence was false; the implication was. Caught by no
pipeline step, which is why the skeptic pass now exists (guide rule 9, the critic's second job).

```
We can't offer what a club offers, and we don't try to. We cover the summer.
```

## Positive set (approved)

**P1, the camp passage ("drastically better", approved verbatim).** Same facts as N5. A reply to
a parent asking what the camp actually is: conversation order, uneven attention, one small
opinion ("Fair warning"), a little slack in the sentences.

> Camp is July 21 to 24, up at a lake near Talkeetna. We train twice a day, the kids get the
> lake and the sauna in between, and the team cooks dinner together. Fair warning on the cabins:
> they're dry, meaning outhouses and no showers for four days, and the lake is the bath. Amy
> runs camp, it's free like everything else, and it registers separately in CrewLAB even if your
> athlete has been with us all summer.

**P2, the training page ("a viable draft... a decent functional starting point").** Approved at
full-page length in the same stance. Live at `/training`; the commit of record is `42a560f`.
Representative texture: "running is the cheapest fitness there is and it carries straight over
to skiing", "Plenty of kids show up worried they'll be the slowest one out there. That's what
the groups are for."

## The discriminator, in one line

N-set prose is about the program and addressed to no one; P-set prose answers a particular
imagined reader, spends words unevenly, and permits a small opinion. Form alone does not
separate them: N3's sentences are individually fine, and the corpus's best passages break
surface rules constantly.

## Eval procedure

1. Pick the crewlab "For parents & supporters" card (it produced N2/N3/N4, the hardest case).
2. Redraft it from `docs/content-briefs/crewlab.md` under the changed system, in a fresh context.
3. Judge against this set: does any sentence pattern-match an N entry? Does the section read as
   a reply (P stance) or as coverage? A draft that lands N-side fails the change.
