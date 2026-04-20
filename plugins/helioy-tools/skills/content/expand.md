# Expand — Deep-Dive Growth from a Seed

A seed is a worldview compressed into a short piece, typically a few
hundred to a thousand words. An expansion grows the seed to a target
length by adding primary-source evidence and structural depth, while
preserving the worldview the seed established. Drafting belongs to
the surface skills. Polish belongs to `polish.md`. Expand runs
between them: after the seed exists, before the long-form piece is
finalized.

Read this directive when the user asks to expand, deepen, grow, take
from short to long, do more research, find primary sources, or
produce a deep-dive from an existing piece. Voice-agnostic and
surface-agnostic by design.

## Setup

Before researching anything:

1. Read the seed end to end. The thesis, the load-bearing claims,
   the close. The expansion must preserve all three.
2. Read the governing voice specification end to end. Same source of
   truth as `polish.md`. Re-read on every invocation.
3. Read `polish.md` co-located in this directory once. The expansion
   must survive a polish pass at the end; knowing the rules upfront
   prevents writing prose that gets cut.
4. Confirm caller inputs: target word count, target section count,
   any sources or constraints the user already knows.
5. Invoke the `snapshot` skill before the first write to the seed.
   Expansion materially overwrites the seed; the snapshot preserves
   the seed under `.archive/` so the worldview-compressed original
   stays diffable against the long-form result.

## The seven phases

Run sequentially. An expansion that skips phases produces filler.

### Phase 1 — Spine extraction

Identify the load-bearing claims in the seed. A claim is
load-bearing if removing it collapses the argument. List them in
the order they appear. The list of load-bearing claims is the
candidate section spine.

Cross-check against the target section count:

- If load-bearing claims exceed the target, group related claims
  under one section header
- If load-bearing claims fall short, identify the implied claims
  the seed gestures at without naming. Each implied claim that
  deserves its own evidence becomes a new section
- Never invent sections to hit a count. A section with no
  load-bearing claim is filler

### Phase 2 — Evidence inventory

Mark every piece of evidence the seed already carries: first-person
observations, named artifacts, measurements, scoped quotes. These
are the trusted core. The expansion does not re-research them; it
extends them.

For each load-bearing claim, note what evidence the seed already
attached and what is missing. The gap list drives Phase 3.

### Phase 3 — Research

Hit primary sources first. Source preference, in order:

1. Official vendor documentation, dated
2. Source code, with file path and commit reference
3. Official specifications and RFCs
4. Named papers from authoritative venues
5. Vendor-published blog posts from named authors
6. Tracked issues and pull requests with vendor participation
7. Independent technical writeups from practitioners with verifiable
   experience

Skip secondary aggregators when a primary source exists for the
same claim. Capture for every finding: URL, retrieval date, exact
quote where the claim is asserted, the author's role, and a
confidence note. Findings without retrievable URLs are weaker than
findings with them; mark them accordingly.

For claims the seed asserts in first person, reproducible steps
beat secondary sources. If the author already ran the experiment,
re-run it during the expansion to capture exact numbers, exact
output, exact env-var names. The expansion is a chance to harden
the seed's measurements.

Execution mechanics. Research can run in main context or fan out to
subagents. Pick by claim count and source breadth.

- Main context inline. Default for small expansions: 1 to 3 sections
  with new claims drawing from a single source domain. Lower
  coordination cost and stable voice continuity. Costs context
  window space and slows turn cadence as findings accumulate.
- Subagent fan-out. Cluster claims by source domain; dispatch one
  research subagent per cluster (`helioy-tools:deep-research` or
  equivalent). Each subagent returns research log rows in the format
  defined below under "Research log output". The caller stitches rows
  into the canonical log under `## Sources`. Use when claims span
  four or more source domains, or when context window pressure
  threatens the section-drafting phase.

Cluster boundaries follow source domain. Two sections sharing a
source domain belong in one subagent brief. A section spanning three
domains splits across three subagents. Section drafting (Phase 4)
stays in main context regardless of how research executed; this
preserves voice continuity at section seams.

### Phase 4 — Section drafting

Each section has a fixed shape:

- One load-bearing claim or question, named in the heading
- Two to four pieces of evidence, drawn from the inventory and
  research log
- One concrete artifact: code block, table, log line, screenshot
  reference, env-var assignment, command output, citation block
- A close that hands off to the next section

Draft sections in spine order. Preserve the seed's voice. Quote the
seed's exact phrases for thesis-bearing lines so the expanded piece
reads as continuous with the original, not as a rewrite.

Word-count discipline: treat the target as a budget. Evidence sets
actual length. If a section runs short with no real evidence to add,
the section was not load-bearing; collapse it into a neighbour. If a
section runs long, split it on the natural seam.

### Phase 5 — Bridges

The reader should never wonder why the piece is now talking about
this. After all sections exist, re-read the joints. Each section
closes on the bridge to the next. Common bridge shapes:

- Implication: this claim opens the next question
- Comparison: this design choice contrasts with the next system
- Counter-case: this works here, but the next section shows where
  it does not
- Escalation: this is the small version; the next section shows the
  full one

Bridges are short. One sentence to two sentences at the end of the
section. Long bridges leak voice and signal padding.

### Phase 6 — Verification scrub

Every new claim added in the expansion must survive the verification
test from `polish.md` Pass 1: can the author show this if asked.
Acceptable backing follows the same list:

- First-person observation, scoped to what the author actually saw
- Reproducible step a reader can re-run
- Primary source quote with attribution and retrieval date
- Concrete artifact: screenshot, log, env var, token count, file
  path, command output, code reference

Sweep every section for new claims that fall through. Scope down or
remove. The expansion failure mode is sweeping universals added
during section-drafting to fill space; the verification scrub
catches them before the polish pass does.

### Phase 7 — Polish handoff

Reset the frontmatter:

- `type` to `deep-dive` (or the long-form type the surface uses)
- `status` to `wip` if the expansion introduced unverified prose,
  or directly to `review` if the verification scrub closed all gaps
- `updated` to today
- `word_count` if the spec carries this field

Hand off to `polish.md`. The expanded prose runs through five passes
the same way any draft does. Headings, structural rigor, editorial
commitment, and pattern catalogue all apply at the new length. The
expansion is not finished until polish has run.

## Research log output

Before the expanded prose, produce a research log the author can
audit without re-running searches.

```
| Section | Claim                  | Source                | Date       | Quote / artifact            | Confidence
|---------|------------------------|-----------------------|------------|------------------------------|-----------
| <name>  | <claim from spine>     | <URL or path>         | <YYYY-MM-DD> | <exact quote or artifact ref>| high/med/low
```

One row per material citation. Citations from the seed carry over
with `Source: seed` and the seed's own retrieval reference. The log
becomes a sibling artifact to the expanded draft, persisted at the
caller's chosen path or inline at the bottom of the expanded file
under a `## Sources` heading.

## Section spine output

Before drafting prose, surface the proposed spine for the author to
accept or revise:

```
Target: <N> sections, ~<W> words
Spine:
  1. <heading> — <load-bearing claim> — <evidence count>: seed/<n>, new/<m>
  2. <heading> — <load-bearing claim> — <evidence count>: seed/<n>, new/<m>
  ...
```

Wait for accept before drafting. A bad spine produces a bad
expansion; the spine is the cheapest place to revise.

## Rules

- Read the voice spec and `polish.md` on every invocation. The
  expansion must survive a polish pass at the end.
- Read the seed end to end before extracting the spine.
- Preserve the seed's voice. Quote thesis-bearing lines exactly so
  the expansion reads as continuous with the original.
- Primary sources first. Vendor docs, source code, RFCs, named
  papers before secondary aggregators.
- Capture URL, retrieval date, exact quote, and confidence for
  every external source. Findings without URLs carry less weight
  and must be marked.
- Phase 3 research can fan out to subagents clustered by source
  domain. Phase 4 section drafting always runs in main context;
  voice continuity at section seams beats parallelism.
- Word-count target is a budget the evidence overrides. Collapse
  sections short on evidence; split sections that run long.
- Surface the spine before drafting prose. Wait for accept.
- Run the verification scrub before handoff. The expansion's
  failure mode is filler-by-universal-claim; catch it here, not
  during polish.
- Hand off to `polish.md` on completion. The expansion is not done
  until polish has run.
- Overwrite the source file. Frontmatter type, status, and updated
  date carry the state change. Do not branch the path.
