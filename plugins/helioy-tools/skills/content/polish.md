# Polish — Voice-Driven Editorial Pass

Move a draft from wip to review against a voice specification. The
voice spec carries the rules. This directive applies them. Drafting
belongs to `my-voice` and the surface-specific skills. Polish runs
after the draft is written, with a different mindset.

Read this directive whenever the user asks to polish, tighten,
sharpen, edit, take a draft to review, or apply voice rules to an
existing piece. Voice-agnostic and surface-agnostic by design.

## Setup

Before sweeping anything:

1. Read the governing voice specification end to end. The spec is the
   source of truth. Re-read on every invocation. Do not rely on
   remembered rules; specs evolve.
2. Read the draft end to end before touching any line. Polish reads
   for the whole shape first, then sweeps for violations.
3. Identify the surface (long-form, post, thread, README, DM) and
   the register the spec assigns to it. Different surfaces carry
   different rule subsets. The spec names which rules apply where.
4. If the draft has a published or canonical version that downstream
   readers depend on, invoke the `snapshot` skill before the first
   write. Polish overwrites in place; the snapshot preserves the
   prior version under `.archive/` for diff and rollback. Skip when
   the draft is fresh and has no published trail.

## The five passes

Five passes, in order. Each pass has one focus. Run them sequentially
so you do not lose track of what you are looking for. Mid-pass detours
into a different category leave the original sweep half-finished.

### Pass 1 — Verification

Every claim must survive one question: can the author show this if
asked. Acceptable backing:

- First-person observation, scoped to what the author actually saw
- A reproducible step a reader can re-run
- A primary source quote, attributed
- A concrete artifact: screenshot, log line, env var, token count,
  file path, command output
- A measurement the author already took

Rewrite or remove every claim that fails. Common failure shapes:

- Sweeping universals (everyone, nobody, all systems, any docs)
- Unattributed certainties about external systems
- Claims about other people's tools the author has not run
- Performance assertions without a measurement

Scope down before deleting. Weaker but verifiable beats absent.
"The docs do not show this" is unverifiable; "the docs I read did
not show this" is verifiable.

### Pass 2 — Pattern violations

The voice spec lists rejected patterns. Read the catalogue, then
read the draft. Sweep for each pattern by name. Memory is unreliable;
the spec is not.

Common categories voice specs name (the spec is authoritative; this
list is shape, not content):

- Punctuation tics: which dashes are allowed, which are not
- Rhetorical constructions: parallel-contrast ("X, not Y"),
  negation-as-frame ("This is not X. This is Y."), colon-punchline
  ("The thesis is simple: ..."), triads-as-rhythm
- Opening shapes: performative hooks, rhetorical questions,
  throat-clearing, press-release voice
- Closing shapes: anticipation closers, calls to action,
  reader-invitation language
- Voice register violations: hedging, performed humility, corporate
  framing, superiority framing, hand-holding
- Surface-specific: emoji caps, hashtag rules, character limits,
  numbering rules

Fix in place. Do not rewrite surrounding prose unless the fix
demands it. Surgical changes preserve the author's voice; broad
rewrites overwrite it.

### Pass 3 — Structural rigor

The body must support what the close claims. Read the close, then
read the body backward looking for the structures the close names.

Common gaps:

- The close names a count (three pillars, four layers, two outcomes);
  the body shows fewer. Add the missing structure, or scale the close
  back to what the body actually shows.
- The close commits to a focus; the body has not established the
  ground for that focus. Add the establishing material, or remove
  the commitment.
- The close cites a category; the body never named the category.
  Name it earlier or drop the citation.
- The close references a comparison; the body shows only one side.
  Add the contrast, or remove the comparative framing.

Headings are part of structure. A heading that overpromises the
section beneath it, or underpromises a section that does more, is a
structural violation. Rewrite the heading to match the work.

### Pass 4 — Editorial commitment

Pieces carry shapes. Each shape has an obligation:

- Worldview piece: the author commits. Signal where they will spend
  time, what they will return to, what they are now watching.
- Receipts piece: the author pays. Show the evidence already
  gathered, not just the assertion that evidence exists.
- Method piece: the author argues. Take a position; surveys do not
  qualify.
- Teardown piece: the author dissects. Surface the substrate
  decision the design rests on, not just the surface features.

Polish ensures the commitment matches the shape. A worldview piece
without commitment reads as essay-shaped advertising. A receipts
piece without receipts reads as a teaser. Fix the mismatch by adding
what the shape demands, or by changing what the piece claims to be.

### Pass 5 — Headings, frontmatter, status

After prose is clean:

- Re-read every heading. Apply Pass 2's pattern catalogue. Headings
  fail voice rules at the same rate as paragraphs and are easier to
  miss.
- Update the frontmatter `status` field. A draft another person can
  read without preface has graduated from wip to review.
- Update the `updated` date. Polish is a touch.
- Leave publish-pass fields (post_date, post_url) empty. The publish
  pass owns those.

## Change-summary output

After the five passes, present the changes as a table the author can
audit without re-reading line by line.

```
| Pass         | Location              | Violation                  | Fix
|--------------|-----------------------|----------------------------|----
| Verification | <heading or line>     | <what was unverifiable>    | <how it was scoped or removed>
| Pattern      | <heading or line>     | <which pattern>            | <what replaced it>
| Structural   | <heading or section>  | <what mismatch>            | <what was added or scaled>
| Commitment   | <heading or close>    | <what was missing>         | <what was added>
| Heading      | <heading>             | <which pattern>            | <new heading>
| Frontmatter  | status, updated       | wip, stale date            | review, today
```

One row per material change. Skip cosmetic edits. The table lets the
author re-run any decision without holding the whole diff in head.

## Rules

- Read the voice spec on every invocation. Do not improvise rules
  from memory.
- Read the draft end to end before touching any line.
- Run the passes in order. One focus per pass.
- Fix in place. Surgical changes preserve voice; broad rewrites
  overwrite it.
- Scope down before deleting. Weaker but verifiable beats absent.
- The author owns the final read. The polish pass surfaces a table;
  the author accepts, reverts, or asks for another sweep.
- This directive does not draft. If a section needs new prose,
  dispatch to the relevant drafting skill and return to polish on
  the result.
- Overwrite the source file. Do not persist polished versions to a
  different path. Frontmatter carries the state change.
- Loop until clean. After fixing a sweep's worth of violations, read
  the draft end to end again. New violations sometimes emerge from
  the surrounding rewrites.
- Verbatim outputs from Helioy tools (`cx_*`, `am_*`, `fmm_*`, `md_*`,
  `mdm_*`) captured into a draft are calling-card receipts. Preserve
  them verbatim. Their distinctive structure (scope paths, UUIDv7
  ids, resolution candidates, sort facets, opaque cursors) is what
  prompts curious readers to ask what the tool is. Trim surrounding
  prose, not the captures, even if the capture reads as long or
  tangential to the section's mechanic.
