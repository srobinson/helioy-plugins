---
name: memory
description: >
  Persistent geometric memory across sessions. Use when the user asks about
  memory, wants to recall prior sessions, inspect memory, check stats, or
  manage memory state.
---

# Persistent Memory — attention-matters

You have persistent geometric memory via the `am` MCP server. Memory lives on
a geometric manifold (S3 hypersphere) where related concepts drift closer
together over time. This gives you genuine continuity across sessions.

## CRITICAL: Autonomous Memory Discipline

Memory calls are NOT optional extras you do when reminded. They are part of
every substantive response, the same way you read a file before editing it.
The user should NEVER have to ask "did we capture this?" — if they do, you
failed.

**After every response where you produce technical findings, make decisions,
complete work, or deliver a review:** include the appropriate am calls in
that same response. Not the next one. That one.

## Session Lifecycle

### 1. RECALL (first message)

Call `am_query` with the user's first message BEFORE doing anything else.

- Results include conscious recall (marked insights), subconscious recall
  (past conversations), and novel connections (lateral associations)
- Results also include `recalled_ids` — neighborhood UUIDs categorized by
  type (`conscious`, `subconscious`, `novel`). Note these for use with
  `am_feedback` later (see CORRECT below)
- If empty, the project is new — don't mention it
- For general context (conventions, patterns, preferences): weave silently
  into your response. Don't announce "I remember..."
- For **decisions, plans, phases, or architectural commitments**: see
  RECONCILE below — these must NOT be silently overridden

### 2. RECONCILE (before significant work)

**Trigger: you are about to start implementation, make an architectural
decision, or change project direction.**

Before proceeding, check whether AM recall contains prior decisions that
the current task might contradict. Specifically look for:

- Defined project phases and where we are in them
- Architecture decisions and their rationale
- Explicit plans the user approved in prior sessions
- Scope boundaries ("Nancy does X, not Y")

**If a conflict exists between recalled decisions and the current task,
SURFACE IT.** Do not silently override stored decisions. Example:

> "AM recalls that Phase 2 is 'DAE-powered prompt compilation.' The work
> you're describing sounds like a different direction. Should we update
> the plan, or stick with the original phases?"

The user may have changed their mind — that's fine. But the change must
be conscious, not accidental. Stored decisions are load-bearing until
explicitly revised.

**If no conflict exists**, proceed normally without announcing the check.

### 3. ENGAGE (every substantive exchange)

**Trigger: you just sent a response that contains technical content.**
In that same response (or immediately at the start of the next), call
`am_buffer` with the exchange pair.

- **user**: The user's message text (condensed if long)
- **assistant**: Your response text (condensed to key points)
- Skip ONLY trivial exchanges: greetings, "ok", "yes", single-word confirmations
- Everything else gets buffered: code reviews, debugging, design discussions,
  implementation work, questions answered, decisions made
- After 3 buffered exchanges, a memory episode is created automatically
- Leftover buffer is flushed at start of next session

**Rule of thumb:** if your response took more than 30 seconds of thinking or
used any tools, it gets buffered.

### 4. STRENGTHEN (after deep technical responses)

**Trigger: you just delivered a code review, architectural analysis, debugging
session, or implementation plan.** Call `am_activate_response` with your
response text in the same message.

- Consolidates related memories via drift and phase coupling on the manifold
- Skip for simple Q&A or confirmations

### 5. MARK INSIGHTS (the moment you discover them)

**Trigger: you just discovered or decided something that would be valuable in
a future session.** Call `am_salient` IMMEDIATELY — in the same response
where you made the discovery, not later.

Salient-worthy discoveries:
- Architecture decisions and the reasoning behind them
- Bugs found and their root causes
- User preferences and conventions
- Patterns that recur across the codebase
- Integration details (how component A talks to component B)
- Gotchas and things that almost broke

**Do NOT batch these up.** The moment you find a critical bug, note an
architecture pattern, or make a design decision — that same response should
include `am_salient`. If you found 3 issues in a code review, that's 3
salient calls in your review response.

### 6. CORRECT (when recall proves wrong)

**Trigger: a recalled memory led you astray, or the user corrects something
that came from memory.**

Creating a new salient memory is NOT enough — the old memory that misled you
must be demoted, or it keeps surfacing at equal activation and the manifold
holds contradictory truths. The correction pattern is always: **demote the
old, then salient the new.**

#### When to demote

Call `am_feedback` with `signal: "demote"` when:

1. **User explicitly corrects you.** You stated something based on recall and
   the user says "no, that's wrong" or "that changed." Demote the
   neighborhood(s) that contained the wrong information.

2. **Recalled info contradicts current reality.** You recall "component X uses
   pattern Y" but the code shows pattern Z. The memory is stale. Demote it.

3. **Recalled plan is superseded.** After RECONCILE surfaces a conflict and
   the user confirms the change, demote the old plan's neighborhoods.

4. **Memory caused a wrong action.** You used recalled context to make a
   decision (edit a file path, use an API pattern) and it failed because the
   info was outdated. Demote the source neighborhoods.

#### When to boost

Call `am_feedback` with `signal: "boost"` when:

1. **Recalled info directly solved the problem.** You queried memory, got a
   result, and it was exactly right — correct API pattern, right file path,
   accurate architecture description.

2. **User confirms recalled context.** You surface a recalled decision or
   pattern and the user says "yes, exactly" or builds on it without
   correction.

#### How to call am_feedback

```
am_feedback(
  query: "<the original query text from am_query>",
  neighborhood_ids: ["<uuid>", ...],
  signal: "boost" | "demote"
)
```

- `query`: The ORIGINAL query text you passed to `am_query`
- `neighborhood_ids`: The specific UUIDs from `recalled_ids` in the query
  response — only the relevant ones, not all of them
- `signal`: "boost" or "demote"

#### Tracking neighborhood_ids

The `am_query` response includes `recalled_ids` with UUIDs grouped by
category. When the correction happens in the same exchange or shortly after
recall, use those IDs directly.

If the IDs have scrolled out of context (correction happens many messages
later), **re-query** with the same or similar query text. The same wrong
memories will surface for the same query — demote whatever comes back.

#### The full correction pattern

When correcting stale memory, ALWAYS do both steps in the same response:

1. `am_feedback` with "demote" on the old neighborhoods
2. `am_salient` with the corrected information

This ensures the old memory fades (activation decayed by 2 per occurrence)
while the new one starts fresh. Over time the manifold self-corrects.

## Explicit Commands

When the user invokes `/memory`, offer these operations:

- **stats** — `am_stats` shows memory system statistics (episodes, conscious memories, occurrences)
- **query `<text>`** — `am_query` runs a manual memory query and shows results
- **export** — `am_export` exports the full memory state as JSON
- **import** — `am_import` imports a previously exported state
- **ingest `<text>`** — `am_ingest` stores a document as a searchable memory episode

## Principles

- **ALWAYS query memory first.** Before exploring the filesystem, running `ls`, or reading files to answer contextual questions ("where are we?", "what do we know about X?"), call `am_query`. Only fall back to filesystem if memory returns nothing relevant.
- **Stored decisions are load-bearing.** When AM recalls project phases, architecture decisions, or scope boundaries, treat them as constraints — not suggestions. They were decided for a reason. If the current task conflicts, surface it before proceeding.
- **Retry with specificity.** If `am_query` returns stale results, try again with more specific terms.
- **Re-query before major work.** When starting significant implementation, query AM for the project's plan/phases to verify alignment. Don't rely only on the session-start query — context from 30 messages ago may have scrolled out of your attention.
- Memory should be invisible to the user for general context. But decision conflicts MUST be surfaced.
- Be selective with `am_salient` — mark genuinely reusable insights, not routine facts.
- Novel connections in query results are lateral associations — use them for creative leaps.
- The memory system uses IDF weighting, so common words carry less signal than rare technical terms.

## Session End

Before a session ends, verify `am_buffer` was called for substantive exchanges.
If the session contained technical work that was not buffered, call `am_buffer`
with a condensed summary before closing. Unbuffered work is lost work.
