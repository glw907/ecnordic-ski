# ECXC Content Guide

The generative authority for ecxc.ski prose. This is what a drafter reads before writing, and it
is organized to be used at draft time: rules first, then the container budgets, then a recipe per
content type with a real exemplar to imitate. The avoid-catalog sits at the back; prose-guard and
the review gates enforce it, so it is not the working memory a draft is written from.

How drafting works: build the brief first (`docs/content-briefs/<page>.md`: the verifiable facts,
the audience questions, the one next step, the container plan), then write recipe by recipe from
the brief. The shared method (`~/.claude/docs/web-content-method.md`) carries the full procedure;
the real-world exemplar library is `docs/coach-voice-corpus.md`. Draft with the `content-draft`
skill, gate-check with `content-review`.

The audience, always: high school athletes and their parents, read together. The register: a
competent coach talking at a trailhead. Write to "you", act as "we".

---

## Load-bearing rules

Break one of these and the prose reads wrong, whatever else it does well.

1. **Every sentence carries a fact.** A time, a place, a name, a rule, a price, a thing that
   happens. If a sentence's only job is to explain why the previous sentence is good, cut it.
   The reader can see the benefit.
2. **A gap is an `[ASK]`, never padding.** Missing a fact? Write `[ASK: what time does the
   Tuesday carpool leave?]` and keep going. Abstraction in place of a fact is how slop enters a
   draft, and a visible question is cheaper to fix than a paragraph of filler.
3. **People do things.** We lend roller skis. You sign the waiver. A coach posts the workout.
   Never "the program provides", "CrewLAB keeps you informed", "training builds fitness".
4. **Say it once.** Each fact lives in one container per page. If two sections both want the
   need-blind line, one of them loses it and links or gestures instead.
5. **Fit the container.** Budgets below. Site copy renders into fixed UI elements, and overflow
   breaks the page, so the budget is part of the recipe, not a suggestion.
6. **When the facts end, stop.** No closing tagline, no motivational send-off, no sentence that
   restates the section. The CTA is the only ending a page needs.

## Container budgets

Derived from the shipped pages. Overflowing a tile or card is a layout bug, not a style choice.

| Container | Budget |
|---|---|
| Page lede | 1–3 sentences, works standalone as a summary |
| `passage` | one paragraph, 80–120 words |
| `card` | 1–3 short paragraphs, 50–150 words |
| `aside` (glossary) | 1–3 sentences, 25–50 words |
| `alert` | one paragraph, 40–90 words |
| `grid` bullet | 25–60 words each, 3–5 bullets, vary the shapes |
| `panel` (in `split`) | one paragraph, 50–120 words |
| `cta` | 30–60 words plus the link |
| `program` tile body | 1–2 sentences, 15–25 words |
| `zone` | 1–2 sentences, 15–30 words |
| `day` tile | one line, 5–12 words |
| `faq` answer | 1–3 sentences |
| Post paragraph | 2–4 sentences |

## Recipes

Each recipe is a shape plus one real exemplar. Imitate the exemplar's stance and density, not its
wording. All exemplars below shipped on this site or come from the corpus; none are invented.

### Page lede

State what the thing is and the two or three facts a first-time reader needs, in the program's
own voice. No scene-setting, no wide-angle opener.

> We meet Monday, Wednesday, and Friday from June 1 to August 19, 2026. Practice starts at
> 10:30 AM sharp, and late arrivals miss the group.

Every clause is checkable, and "late arrivals miss the group" does the expectation-setting that a
paragraph about commitment would do worse.

### Section body (`passage`, `card`)

Facts in the order a newcomer needs them: what, when, where, what it costs, what to bring or do.
One idea per sentence. The corpus's APU entry is the density bar:

> Training is typically located at Hillside, APU, and Kincaid. Athletes will also take special
> training sessions to run in the mountains or ski other trails.

Named places, no adjectives. If a body paragraph has no proper noun or number in it, it is
probably padding.

### Grid bullets

Bold lead naming the action or item, then the facts. Vary the bullet shapes: different sentence
counts, not the same architecture five times. The shipped check-in bullet is the bar:

> **Do the daily check-in.** Each day it asks how you slept and how you are feeling. A few taps,
> no typing. Miss a day and there is a catch-up button on your Home tab. Only you and the
> volunteers see it, and it is how we notice when you are running down.

A real mechanism does the reassuring. The last sentence earns its place because it tells the
athlete something true about how coaching works here.

### Alert

The rule, flat, and what it means in practice. No hedging, no apology.

> You need a helmet for every roller-ski and mountain-bike session. No helmet, no wheels. We hold
> to this every time.

### Aside (glossary)

Define the term for someone who has never heard it, in one or two plain sentences.

> Spenst is explosive jumping work: short, powerful bounds and hops that build the spring a
> skier needs.

### FAQ answer

Answer in the first word where possible (Nothing. / No. / Yes.), then the one or two facts that
follow from it.

> **What if I miss a session?** Come to the next one. The weekly plan includes work you can do on
> your own, posted on CrewLAB.

### CTA

What to do, where, and the one precondition. Then the link. Questions-fallback in one sentence.

> A signed liability waiver has to be on file before your first session. You sign it in CrewLAB,
> and only there.

### Micro-copy (`program`, `zone`, `day` tiles)

Telegraphic and concrete. A tile is a label with one fact of texture, not a pitch.

> Hill intervals and bounding.

> New to organized training and racing. You join to learn the work and build your base from the
> ground up.

### Bio panel

Lead with the checkable credentials (years, places, results), one or two personal facts at the
end. If the page has several bios, give each a different closing shape; a repeated closer formula
("When he's not Xing...") reads as a template.

> She raced for Western Colorado, where she was a seven-time All-American and won the 1997
> national title in the 15K freestyle, the first woman in school history to take an individual
> skiing national championship.

### Posts

Training updates, results, and announcements are more personal than pages: "I" for the coach
writing, "we" for the program, names of athletes, trails, and times. The lede works as the
excerpt. Tags come from the controlled vocabulary only: training, racing, results, events, camp,
announcements. The exemplar lede sits in a fence because it carries an em dash, which site copy
may use and this guide's own prose may not:

```
We had a full crew at Kincaid on Wednesday — 14 athletes showed up for the bounding workout,
which is probably the best turnout we've had all summer.
```

State a fact, advance to the next fact. When the facts end, the post ends; no reflective close.

## Voice notes

- **Both readers at once.** The athlete gets the directness ("you'll get faster", "show up ready
  to work"); the parent gets the practical answers (cost, supervision, waivers, pickup) woven in,
  not quarantined in a parents' section.
- **Warm, not gushing.** "This is hard work. It's also worth it." Never "an amazing opportunity".
- **Cost is stated plainly, every time it comes up:** training is free; donations are optional
  and need-blind; no athlete is ever required to donate.
- **ECXC naming:** "East Community Cross Country" on first reference, "ECXC" after. The program
  serves runners and skiers both; the sport word stays flexible (nordic skiing, cross-country
  skiing, XC skiing), varied by context.
- **Acronyms and jargon get defined on first use**, usually in an `aside` glossary: spenst, OD,
  Besh Cup, NSAA.
- **Sentence lengths vary on purpose.** 8–15 words is the page average; short sentences land
  rules and prices; longer ones carry lists and logistics. Paragraphs break at 2–3 sentences.
- **Punctuation does different work.** Period separates, colon defines, comma continues. Em
  dashes in site copy are for a true interruption or pivot, at most one per paragraph, written
  with a space on each side, and never where a period works. En dash for ranges: 4:00–6:00 PM,
  May–August.

## The avoid-catalog

The enforcement layer, not the drafting layer. prose-guard carries the machine-checkable subset;
the shared method (`~/.claude/docs/web-content-method.md`, section 3) carries the full
Signs-of-AI-writing catalog. The short version, for orientation:

```
Words that register as generated: seamless, transformative, robust, pivotal, foster, leverage
(figurative), elevate (figurative), comprehensive, thriving, curated, tailored, dedicated,
meticulous, nuanced, vibrant, passionate, empower, journey (as metaphor).

Constructions: "not just X, it's Y" and all negative parallelism; "Whether you're a beginner or
a seasoned racer"; benefit restatement (state a fact, then a sentence on why it's good);
participial endings ("...building the fitness that carries a season"); sweeping openers;
fabricated social proof; inanimate agency; formal connectors (Moreover, Additionally,
Furthermore); meta-commentary; reflective endings; "Bold term: explanation" deployed at a fixed
rate; three-item lists by reflex; every paragraph the same size.
```

The deeper rhythm problem is uniformity: same sentence length, same paragraph size, same bullet
architecture, every section ending on a punchy line. The fix is in the recipes (vary the shapes)
rather than in any banned list.
