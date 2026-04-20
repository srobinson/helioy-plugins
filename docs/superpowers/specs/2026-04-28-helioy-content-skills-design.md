---
date: 2026-04-28
topic: helioy-content-skills
status: draft
owner: stuart
---

# Helioy content skills design spec

## Goal

Lower the activation cost of social engagement and blog publishing for a solo builder. The user knows what to write about but struggles with narrative layout for blogs and decision overhead for social posts. The skill suite handles the routing and structure; the existing `my-voice` skill handles prose.

## Architecture

Three new skills, plus a small extension to the existing `my-voice` skill.

```
~/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/
├── content/SKILL.md          # router (~120 lines)
├── blog-architect/SKILL.md   # interview → outline → draft → publish
├── social-loop/SKILL.md      # taxonomy → dispatch → engagement
└── my-voice/SKILL.md         # extended with DM content types
```

Approach: smart router with state held in cm, fat sub-skills, my-voice handles all prose.

## Identity context

| Handle | Role | Status |
|---|---|---|
| @KnowMoreContext | Engine, voice, distribution | Live |
| @HelioyMatters | Brand, dormant, landing page | Live, no posts |

Email convention: `knowmorecontext@alphab.io` (personal), `helioy@alphab.io` (brand). Catchall on alphab.io covers all variants.

## Component 1 — `content` (router)

### Invocation contract

User invokes `/content`. Router reads state from cm, synthesizes a summary of what is open, suggests 1-3 next actions with reasoning, dispatches to `blog-architect` or `social-loop` on user pick.

The router never drafts. It only orchestrates.

### State model — cm entries at scope `global/project:helioy/repo:helioy-plugins`

| Kind | Purpose | Fields |
|---|---|---|
| `blog-draft-open` | Track in-progress blog drafts | path, percent_complete, last_touched_at, type |
| `blog-published` | Recent ships, rolling 14 days | url, platform, title, published_at |
| `social-pending` | Stashed engagement targets | source_url, captured_at, type_hint, note |
| `social-last-post` | Last post per platform | platform, type, posted_at, url |
| `dm-thread-open` | DM threads owed a reply | who, platform, last_message_at, last_direction |
| `engagement-cadence` | Rolling 7-day post-type histogram | counts_by_type, window_start |

State is read at invocation. If cm is empty, router falls back to "what do you want to do today?"

### Decision flow

```
Invoke /content
  → Read state (six kinds above)
  → Synthesize summary
  → Present 1-3 suggested next actions with reasoning
  → User picks action OR types free-form intent
  → Dispatch to blog-architect or social-loop with context
  → Sub-skill writes back updated state to cm on completion
```

## Component 2 — `blog-architect`

### Invocation contract

```
Input  (from router):
  - intent: "new" | "resume <path>" | "promote <path>"
  - optional topic hint

Output (to router):
  - state writes (blog-draft-open transitions, blog-published)
  - markdown file at ~/.mdx/blog/YYYY-MM-DD-<slug>.md
  - on publish: returns URL, triggers social-loop cascade
```

### Interview structure — three phases

**Phase 1 — Type detection.** One question routes to the appropriate question scaffold.

> "Is this a build log, a thesis/argument post, a tutorial, or a story?"

**Phase 2 — Narrative extraction.** Three to six questions, asked one at a time, type-specific. User answers verbatim; skill captures phrasing for later voice handoff.

| Type | Questions in order |
|---|---|
| Thesis | (1) one-line claim the reader leaves believing? (2) strongest counter? (3) two pieces of grounded evidence? (4) implication that matters? |
| Build log | (1) what shipped? (2) one technical detail worth zooming in on? (3) so-what? (4) what is next? |
| Tutorial | (1) starting state? (2) ending state? (3) load-bearing steps? (4) common gotcha? |
| Story | (1) setup? (2) turning point? (3) resolution? (4) what does this make the reader feel or do? |

**Phase 3 — Outline synthesis.** Skill produces a structured outline (sections plus one-line beats per section), shows it, user edits or approves. State write: `blog-draft-open` at ~30 percent.

### Draft handoff to my-voice

On outline approval, blog-architect invokes `my-voice` via the Skill tool with:

- The outline
- The verbatim Phase 2 answers (so my-voice anchors on user phrasing)
- `content_type: "Long-Form / Essay"` (existing my-voice content type)

`my-voice` returns the prose draft. blog-architect presents it. User edits or approves. State write: `blog-draft-open` at ~70 percent.

### Publish adapters

| Target | v1 | Mechanic |
|---|---|---|
| Substack | yes | Convert markdown → styled HTML via pandoc → open in browser → paste instructions |
| Astro / git-push | deferred | Until helioy.com or srobinson.org Astro work lands |

The Substack adapter writes the .md file, runs pandoc to produce styled HTML, opens it locally, prints clear paste instructions for `knowmorecontext.substack.com`. On confirm-published, user provides the URL. Skill writes `blog-published` to cm, removes `blog-draft-open`, then asks: "promote on social now?"

## Component 3 — `social-loop`

### Invocation contract

```
Input (from router or direct):
  - type:    one of 11 (or "help me pick")
  - context: type-specific (URL, blog path, source text, DM target)
  - target:  X | LinkedIn | both
  - handle:  @KnowMoreContext | @HelioyMatters

Output:
  - draft(s) presented for approval
  - on approval: publish via existing crosspost MCP
  - state writes (social-last-post, social-pending, dm-thread-open)
```

### Type taxonomy — 11 types in 4 mechanic groups

| # | Type | Group | LinkedIn xpost? |
|---|---|---|---|
| 1 | blog-promo | 1 (original) | yes, adapt |
| 2 | build-log | 1 (original) | yes when substantial |
| 3 | product-release | 1 (original) | yes, adapt |
| 4 | proactive-reply | 2 (reactive) | no |
| 5 | comment-reply | 2 (reactive) | no |
| 6 | quote-tweet | 2 (reactive) | no |
| 7 | retweet | 2 (reactive) | no (decision-only, no draft) |
| 8 | thread | 3 (multi-beat) | yes, collapse to LI long-post |
| 9 | dm-cold | 4 (DM) | LinkedIn DM optional |
| 10 | dm-followup | 4 (DM) | LinkedIn DM optional |
| 11 | dm-reply | 4 (DM) | n/a |

### Group 1 — Original posts

Drafted from scratch with context. Flow:

```
Gather context (blog URL, what shipped, release notes)
  → invoke my-voice with type "X post" + context + handle
  → present draft (2-3 variations per my-voice convention)
  → user picks or edits
  → if target includes LinkedIn: invoke my-voice for LI-adapted version
  → publish via crosspost MCP
  → write social-last-post
```

### Group 2 — Reactive posts

Need source URL or pasted text. Flow:

```
User pastes URL or text
  → skill extracts the original post's claim or question
  → for retweet: decision-only — skill says "yes RT / skip / QT instead?"
  → for others: invoke my-voice with type "X reply" or "X post (QT)" + source
  → present draft
  → publish via crosspost MCP (X only)
  → write social-last-post
```

If user stashes a target without acting, write `social-pending` so router surfaces it later.

### Group 3 — Threads

Same Phase 2 interview pattern as blog-architect, scaled down: thesis plus 3-7 beats. Flow:

```
  → user provides thesis (one line)
  → user provides 3-7 beats (one line each)
  → invoke my-voice with type "X thread" + outline
  → present full thread (each post numbered, character counts shown)
  → user approves whole thread or edits per-post
  → publish as thread via crosspost MCP create_thread
  → if LinkedIn target: invoke my-voice to collapse thread into long-form LI post
  → write social-last-post
```

### Group 4 — DMs

Per type:

| Subtype | Initial questions |
|---|---|
| dm-cold | who, what is the hook, what is the ask? |
| dm-followup | who, what did they engage with, what is next? |
| dm-reply | user pastes the incoming DM, skill drafts response |

Flow:

```
  → invoke my-voice with type "DM <subtype>" (NEW my-voice content type)
  → present draft (one option, terse — DMs are not where you A/B)
  → user approves
  → for X: skill copies to clipboard, opens DM in browser
  → for LinkedIn DM: same paste flow
  → write dm-thread-open with target + last_message_at
```

DMs do not auto-publish. Skill drafts and copies; user pastes in the X or LinkedIn app. Same reasoning as the Substack paste flow.

### Handle awareness

For Group 1 posts, social-loop asks which handle posts:

- @KnowMoreContext (engine — default for blog-promo, build-log, replies)
- @HelioyMatters (brand — default for product-release)

Handle context flows to my-voice so prose adapts. v1 uses single voice for both handles.

## Glue — cross-skill cascade

The blog→social link is the most important cascade.

```
blog-architect publish step succeeds
  → writes blog-published to cm
  → asks: "promote on social now?"
  → if yes: invokes social-loop skill with:
      type=blog-promo
      context={url, title, one-line hook from Phase 2 first answer}
      target=user-pick (X / LinkedIn / both)
  → if no: writes social-pending so router surfaces it later
```

The "one-line hook" is reused from the Phase 2 first answer (per type: thesis claim / what shipped / starting state / setup), so the user does not re-answer it.

## my-voice extension

One change required to existing `my-voice` skill: add three new content types.

```
DM cold:     terse, specific, single ask, no boilerplate
DM followup: warm reference to their engagement, single forward step
DM reply:    match incoming tone, advance the thread
```

Estimated addition: ~30 lines in `my-voice/SKILL.md`.

## Success criteria for v1

The skill suite is done when:

1. `/content` invocation reads cm state and presents 1-3 next actions in under 2 seconds.
2. `blog-architect` runs Phase 1 type detection plus Phase 2 narrative extraction (3-6 questions) plus Phase 3 outline synthesis, hands off to my-voice, lands a markdown file in `~/.mdx/blog/`.
3. `blog-architect` Substack publish flow opens styled HTML in a browser with paste instructions.
4. `social-loop` dispatches all 11 types correctly. The 7 types that produce drafts hand off to my-voice and present results.
5. Blog publish auto-cascades into social-loop with `blog-promo` context.
6. State writes back to cm correctly so the next `/content` invocation reflects what just happened.
7. `my-voice` extended with three DM content types.

## Deferred for v2+

| # | Item | Reason / source |
|---|---|---|
| 1 | Proactive scheduling and daily nudge via /loop | Decided B for v1, hybrid scheduling deferred |
| 2 | Astro / git-push publish adapter for helioy.com | Pending Astro port |
| 3 | srobinson.org publish adapter | Platform decision pending |
| 4 | Cohort-watching for engagement input | v1 paste-only is sufficient |
| 5 | MCP X timeline read | Pending X API access |
| 6 | Polls | Out of v1 scope |
| 7 | Spaces / Live audio | Out of v1 scope |
| 8 | Brand-voice variant for @HelioyMatters | v1 uses single Stuart voice |
| 9 | LinkedIn DM auto-paste-helper polish | v1 manual paste is sufficient |
| 10 | Substack API publish (replace paste flow) | API undocumented and brittle, paste is reliable |
| 11 | Strategic content placement decision (which surface for which content) | Separate decision from skill design |

## Open questions for implementation

These are not blockers but worth noting before plan writing:

1. **State scope confirmation.** Spec uses `global/project:helioy/repo:helioy-plugins`. Confirm this is the right scope vs `global/project:helioy` (more cross-session reuse).
2. **pandoc dependency.** Substack adapter assumes pandoc is installed. Confirm or pick alternative converter.
3. **crosspost MCP capabilities.** Confirm crosspost supports `create_thread` for threads and the LinkedIn endpoints we assume.
4. **my-voice DM voice file.** Decide whether DM voice notes go in `~/.mdx/reference/my-voice.md` or a separate `my-voice-dm.md`.
