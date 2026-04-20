---
name: blog-architect
description: >
  Turn a topic into a published blog post. Runs a structured interview
  for net-new posts, accepts delegated drafting when the session
  already carries context (github reviews, cm decisions, research
  artifacts), resumes in-flight drafts, and promotes already-published
  posts. Hands prose drafting to my-voice, persists markdown to
  ~/.mdx/blog/ before review, and orchestrates the Substack paste
  flow. Use when the user wants to write a post, draft an essay,
  resume a draft, promote a published post, or convert just-completed
  research into a teardown or deep-dive. Owns blog state in cm
  (blog-draft-open, blog-published) and triggers the social-loop
  cascade on publish.
---

# Blog Architect

Turn a topic into a published blog post. Synthesize structure here.
Delegate prose to `my-voice`. Persist every prose return to disk
before the user reviews it. Carry blog state in cm via the
`blog-draft-open` and `blog-published` tags, and trigger `social-loop`
on publish.

## Setup

Run on every invocation, before branching to an intent:

1. Read `~/.mdx/reference/my-voice.md` once. This is the voice source
   of truth. Hand verbatim user phrasing through to `my-voice` so it
   survives the prose pass.
2. Confirm `~/.mdx/blog/` exists. Create it if missing.
3. Read open blog state:
   `cx_recall` with `tags: ["blog-draft-open"]` at scope
   `global/project:helioy`.
4. Resolve the next file prefix using the numbering rule below.

## Intents

Four entry points. The router or the user names one.

```
new                   Run the full interview for a fresh idea.
delegate <hint>       Skip the interview. Discover context, draft now.
resume <path>         Pick up an in-flight draft from its current status.
promote <path>        Skip drafting. Trigger the social cascade.
```

`hint` for `delegate` anchors the discovery query. The hint may be a
topic phrase, a repo name, or a research artifact filename.

## Numbering rule

Generate the next four-digit prefix before creating any new file:

```
disk_max = max integer prefix across files in ~/.mdx/blog/
cm_max   = max integer prefix across path fields in cm
           blog-draft-open entries
next     = max(disk_max, cm_max) + 1, zero-padded to four digits
```

Use `cx_browse` with `tag: blog-draft-open` at scope
`global/project:helioy` to enumerate cm reservations. The first blog
ever drafted is `0001`.

## Persistence rule

Every prose return from `my-voice` writes to disk before the user
sees the prose. The user reviews the persisted artifact, not
in-session text. Revisions re-call `my-voice` and overwrite the file.

The persisted artifact carries a 12-field frontmatter block plus the
prose body. The frontmatter template is in the **File contract**
section.

## New flow

Three phases, then handoff and persistence.

### Phase 1 — Type detection

Ask exactly one question:

> "What kind of post is this — editorial (build-log, thesis, tutorial,
> story) or analytic (deep-dive, teardown, synthesis, interview)?"

Map the answer to one of eight type slugs across two registers.

**Editorial** (narrative-driven, the user as protagonist):

| Slug | Cue |
|---|---|
| build-log | What you shipped, with one zoom-in detail. |
| thesis | A claim you want the reader to leave believing. |
| tutorial | A path from a known starting state to an ending state. |
| story | A sequence with a turning point. |

**Analytic** (system-driven, evidence as protagonist):

| Slug | Cue |
|---|---|
| deep-dive | Layered reveal of a system's behaviour, evidence-grounded. |
| teardown | Side-by-side or component-by-component comparison with receipts. |
| synthesis | Pulls threads together across prior posts; consolidates an argument. |
| interview | Conversation-driven; another voice carries the argument. |

If the user is unsure, present the cues and let them pick.

On type pick, write cm at status `idea`:

```
cx_store
  scope: global/project:helioy
  kind:  observation
  tags:  ["blog-draft-open", "knowmorecontext", <campaign>, <type-slug>]
         (add "helioymatters" if account is the brand handle)
  body:
    path:            ~/.mdx/blog/NNNN-<slug>.md
    slug:            <slug-placeholder>
    status:          idea
    account:         knowmorecontext | helioymatters
    type:            <type slug>
    register:        editorial | tinkerer
    created:         <YYYY-MM-DD>
    last_touched_at: <iso timestamp>
```

Capture the returned entry ID. Carry it through every later
`cx_update` and `cx_forget` call.

### Phase 2 — Narrative extraction

Ask the type-specific questions one at a time. Wait for an answer
before the next question. Capture answers verbatim. They become the
anchors handed to `my-voice`.

| Type | Questions in order |
|---|---|
| thesis | (1) one-line claim the reader leaves believing, (2) strongest counter, (3) two pieces of grounded evidence, (4) implication that matters |
| build-log | (1) what shipped, (2) one technical detail worth zooming in on, (3) so-what, (4) what is next |
| tutorial | (1) starting state, (2) ending state, (3) load-bearing steps, (4) common gotcha |
| story | (1) setup, (2) turning point, (3) resolution, (4) what does this make the reader feel or do |
| deep-dive | (1) the question this post opens, (2) layers of revelation in order, (3) one piece of unmistakable evidence per layer, (4) the question this opens for the reader |
| teardown | (1) two things being compared, (2) dimensions of comparison, (3) what is surprising in the comparison, (4) implication for the reader |
| synthesis | (1) the through-line across the prior posts, (2) the consolidated argument, (3) the new question this raises |
| interview | (1) who and why them, (2) the question only they can answer, (3) the surprising thing they said, (4) what the reader takes away |

Phase 2 rules:

- One question per turn.
- Echo the answer back only if ambiguous.
- Store exact words. If the user asks for a restatement in their own
  voice, dispatch to `my-voice` and capture the returned line
  verbatim.
- Hold structural follow-ups until the user signals the answer is
  complete.
- The first answer is the social-cascade hook later. Preserve it.

### Phase 3 — Outline synthesis

Produce a structured outline from the captured answers. Format:

```
Title:    <working title, plain text>
Slug:     <kebab-case slug, derived from title>

Section 1 — <heading>
  - <one-line beat>
  - <one-line beat>

Section 2 — <heading>
  - <one-line beat>

[3-6 sections total]
```

Outline shapes by type:

- **thesis**: hook (claim) → counter and rebuttal → evidence one →
  evidence two → implication.
- **build-log**: what shipped → the zoom-in detail → so-what → what
  is next.
- **tutorial**: starting state → step sequence (one section per
  load-bearing step) → gotcha → ending state.
- **story**: setup → turning point → resolution → reader takeaway.
- **deep-dive**: hook (the opening question) → layer one with
  evidence → layer two with evidence → (more layers as needed) →
  the question this opens for the reader.
- **teardown**: setup of the two subjects → dimension one comparison
  → dimension two comparison → (more dimensions) → what is surprising
  → implication.
- **synthesis**: through-line statement → consolidation across prior
  posts → new question raised.
- **interview**: setup (who, why them) → the question only they can
  answer → the surprising thing they said → reader takeaway.

Present the outline. User edits or approves.

On approval, transition cm to `wip`:

```
cx_update
  id: <entry id from Phase 1>
  body:
    slug:            <final slug>
    status:          wip
    last_touched_at: <iso timestamp>
```

Hand off to `my-voice`. On prose return, run the persistence rule and
transition cm to `review`.

## Delegate flow

Skip Phases 1–3. The session already carries the context. The
architect discovers, synthesizes, drafts, and persists in one pass.

### Bundle discovery

When `delegate <hint>` runs without an explicit `context` payload:

1. `cx_recall` with the hint as query, scope `global/project:helioy`,
   limit 5. Capture decision IDs and observation IDs whose body
   matches the topic.
2. List `~/.mdx/research/` files by mtime descending. Take the top
   one to three whose filename or first heading matches the hint.
3. The conversation context itself is already loaded — anchor it as
   "session-internal" without re-reading.
4. Read any feedback or reference memories under
   `~/.claude/projects/.../memory/` whose tags match the type
   (e.g., `teardown` triggers a check for workflow-related feedback).

Type detection in delegate:

- Default to `teardown` when the bundle includes a github review
  artifact and a comparison anchor (an existing local solution).
- Default to `deep-dive` when the bundle is a single research
  artifact without an explicit comparison.
- Default to `synthesis` when the bundle contains two or more
  prior published posts.
- The hint may override the default by naming the type explicitly.

Map the type to a register:

- editorial: build-log, thesis, tutorial, story
- tinkerer: deep-dive, teardown, synthesis, interview

Synthesize the outline using the typed shapes from Phase 3. Populate
each section with anchors drawn from the bundle. Do not present the
outline for approval. The user reviews the persisted prose.

Write cm at status `review` directly (delegate skips `idea` and
`wip`):

```
cx_store
  scope: global/project:helioy
  kind:  observation
  tags:  ["blog-draft-open", "knowmorecontext", <campaign>, <type-slug>]
  body:
    path:            ~/.mdx/blog/NNNN-<slug>.md
    slug:            <slug>
    status:          review
    account:         knowmorecontext | helioymatters
    type:            <type slug>
    register:        editorial | tinkerer
    bundle_sources:  [<id-or-path>, <id-or-path>, ...]
    created:         <YYYY-MM-DD>
    last_touched_at: <iso timestamp>
```

Hand off to `my-voice`. On prose return, run the persistence rule.

### Bundle visibility

When the architect returns the persisted artifact, list the bundle
inline:

```
Drafted at ~/.mdx/blog/NNNN-<slug>.md (status=review).

Bundle used:
  - cm decision <id> (<title>)
  - ~/.mdx/research/<file>
  - ~/.codex/skills/<path> (when a workflow contract anchored the draft)
  - <feedback-memory>.md (when a memory shaped the take)
  - session-internal: <one-line summary of the conversation arc>
```

The user sees what shaped the draft. Missing or wrong sources
prompt a revise loop.

## Resume flow

When invoked with `resume <path>`:

1. Read the file at `<path>`.
2. Find the matching cm entry: `cx_browse` with
   `tag: blog-draft-open` at scope `global/project:helioy`, locate
   the entry whose body carries `path: <path>`. Capture its ID and
   `status` field.
3. Branch on status:
   - `idea` — type picked, no outline yet. Run Phase 2 and Phase 3.
   - `wip` — outline exists, prose pending. Present the outline from
     the file. On approval, run the `my-voice` handoff.
   - `review` — prose exists. Present the persisted artifact path.
     User revises (loop to `my-voice`, overwrite file, no cm write)
     or publishes (publish flow).
   - `scheduled` — file frontmatter has `post_date` set. Confirm
     publish window, then run the publish flow.
4. Carry the entry ID through every later `cx_update` and
   `cx_forget` call.

## Promote flow

When invoked with `promote <path>`:

1. Read the file's frontmatter to extract `title`, `slug`,
   `post_url`, `type`.
2. If `post_url` is empty, ask the user for the URL.
3. Skip drafting. Trigger the social cascade ("promote on social
   now?"). On yes, build the `social-loop` payload from the file's
   frontmatter and the first paragraph of the prose body as the hook
   fallback.

## Handoff to my-voice

Invoke the `my-voice` skill via the Skill tool with this payload:

```
content_type:      "Long-Form / Essay"
type:              <type slug>
register:          editorial | tinkerer
outline:           <Phase 3 outline or auto-synthesized outline>
anchors:           <verbatim Phase 2 answers, or bundle anchors>
voice_constraints: load by register from ~/.mdx/reference/my-voice.md
```

`my-voice` returns the prose draft. The architect persists the prose
to disk per the persistence rule, then presents the artifact path.

If the user requests revisions, re-call `my-voice` with the same
anchors plus the revision notes. Overwrite the file. No new cm write.

## Status state machine

The `status` field is the single signal for resume state. It lives
on the markdown frontmatter and on the cm body block.

```
idea → wip → review → scheduled → published → archived
```

Transitions and cm writes:

| From → To | Trigger | cm write |
|---|---|---|
| (none) → idea | Phase 1 type pick | `cx_store` blog-draft-open status=idea |
| idea → wip | Phase 3 outline approved | `cx_update` status=wip |
| wip → review | my-voice prose returned, file persisted | `cx_update` status=review |
| (none) → review | delegate prose returned, file persisted | `cx_store` blog-draft-open status=review |
| review → scheduled | post_date set | `cx_update` status=scheduled |
| scheduled → published | post_url captured on publish | `cx_store` blog-published, then `cx_forget` blog-draft-open |
| published → archived | manual | none |

Every cm write also updates `last_touched_at`. The file frontmatter
`status` field tracks the cm `status` field.

## File contract

Path: `~/.mdx/blog/NNNN-<slug>.md`. Numeric four-digit prefix only.

Frontmatter template (12 fields, leave empty rather than omit):

```yaml
---
title: <title>
slug: <slug>
status: idea | wip | review | scheduled | published | archived
account: knowmorecontext      # or helioymatters
surface: blog                 # blog | substack | devto
type: <type slug>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
post_date:                    # filled when scheduled
post_url:                     # filled when published
campaign: <campaign-slug>     # e.g. transport-matters-launch; empty if none
related: []                   # slugs of related posts
---
```

The prose body follows the frontmatter block. No additional metadata
in the body.

## Publish — Substack paste flow

v1 publish target: `knowmorecontext.substack.com`. Ship raw markdown
via paste.

Sequence:

1. Confirm the file exists at `~/.mdx/blog/NNNN-<slug>.md`.
2. Open the directory in Finder so the user can find the file:
   ```
   open ~/.mdx/blog/
   ```
3. Print paste instructions:
   ```
   Ship checklist for knowmorecontext.substack.com:

   1. Open the .md file at ~/.mdx/blog/NNNN-<slug>.md
   2. Copy the prose body (skip the frontmatter block)
   3. Paste into a new Substack post
   4. Set the title:    <title>
   5. Set the subtitle: <one-line subtitle, derived from the first
                         Phase 2 answer or the first prose paragraph>
   6. Review formatting (Substack handles markdown headings and lists)
   7. Publish
   8. Paste the published URL back here
   ```
4. Wait for the URL.

On URL receipt:

```
1. cx_store blog-published:
   scope: global/project:helioy
   kind:  observation
   tags:  ["blog-published", "knowmorecontext", <campaign>, <type-slug>]
   body:
     url:           <user-provided url>
     platform:      substack | helioy.com | devto
     title:         <title>
     slug:          <slug>
     published_at:  <iso timestamp>

2. cx_forget the blog-draft-open entry by ID.

3. Update the file frontmatter:
     status:    published
     updated:   <YYYY-MM-DD>
     post_date: <YYYY-MM-DD>
     post_url:  <user-provided url>
```

Then ask: "promote on social now?"

Future canonical surfaces (deferred): `helioy.com/blog` (canonical
home with RSS, sitemap, git push), `dev.to` (cross-post with
`canonical_url`), Substack (republish surface). When canonical
surfaces ship, the publish flow expands to push to helioy.com first
and cross-post elsewhere with `canonical_url`. The state-write
contract above stays unchanged; only the `platform` field shifts.

## Cascade — social-loop trigger

If the user answers yes to "promote on social now?", invoke
`social-loop` via the Skill tool:

```
type:    blog-promo
context:
  url:    <published url>
  title:  <title>
  hook:   <one-line hook>
target:  user-pick
```

Hook source by type:

| Type | Hook source |
|---|---|
| thesis | the one-line claim |
| build-log | what shipped |
| tutorial | the starting state |
| story | the setup |
| deep-dive | the opening question |
| teardown | what is surprising in the comparison |
| synthesis | the through-line statement |
| interview | the surprising thing they said |

For interview-path drafts, the hook is the verbatim Phase 2 first
answer. For delegate-path drafts, derive the hook from the
matching outline section anchor.

If the user answers no, write a `social-pending` entry:

```
cx_store
  scope: global/project:helioy
  kind:  observation
  tags:  ["social-pending", "knowmorecontext", "blog-promo"]
  body:
    source_url:   <published url>
    captured_at:  <iso timestamp>
    type_hint:    blog-promo
    note:         <title>
```

Either way, return control to the caller.

## cm tag reference

All writes go to scope `global/project:helioy`, cm `kind: observation`.
Semantic names below are tags. cm's `kind` enum is fixed (`fact |
decision | preference | lesson | reference | feedback | pattern |
observation`).

| Tag | When | Body fields |
|---|---|---|
| blog-draft-open | Phase 1 type pick (new) or first persistence (delegate) | path, slug, status, account, type, register, created, last_touched_at, bundle_sources (delegate only) |
| blog-published | URL received | url, platform, title, slug, published_at |
| social-pending | User declined immediate promo | source_url, captured_at, type_hint, note |

Always-tag rule:

- `knowmorecontext` on every cm write (default editorial home).
- `helioymatters` when the entry posts from the brand account.
- The campaign slug when one applies (e.g.,
  `transport-matters-launch`).
- The type slug (e.g., `teardown`, `deep-dive`, `blog-promo`).

The `blog-draft-open` entry is removed via `cx_forget` once
`blog-published` is written. The router relies on this to know what
is in flight.

## Rules

- Every prose return from `my-voice` writes to disk before the user
  sees it.
- The user reviews the persisted artifact path, not in-session prose.
- File numbering reads disk and cm. Use `max(disk_max, cm_max) + 1`.
- Pass `register` to `my-voice` in every payload. The register
  drives voice constraints loaded from
  `~/.mdx/reference/my-voice.md`.
- Hand verbatim user phrasing to `my-voice` for the interview path.
  Hand bundle anchors verbatim for the delegate path.
- Use the 12-field frontmatter on every file. Leave fields empty
  rather than omit.
- Update cm on every status transition. Update `last_touched_at` on
  every cm write.
- Trigger the social cascade only after the user confirms "promote
  on social now?" with yes.
- Tag `knowmorecontext` on every cm write. Add the brand, campaign,
  and type tags as applicable.
- Substack ships via paste. Confirm the URL with the user before
  writing `blog-published`.

## Anti-patterns

- Returning prose to the user without persisting it first.
- Using `percent_complete` or any numeric progress signal in cm.
  Status alone carries the resume state.
- Asking interview questions on the delegate path.
- Discovering bundle context from the user's prompt instead of from
  cm and `~/.mdx/research/`.
- Numbering files from disk only. Cm reservations count.
- Drafting prose inside this skill. Prose is `my-voice`'s job.
- Rewriting `my-voice` voice constraints in this file.
- Date-prefixed filenames (`YYYY-MM-DD-<slug>.md`) or status-suffixed
  filenames (`<slug>_draft.md`). Numeric prefix only.
- Forgetting to remove `blog-draft-open` after `blog-published` is
  written. The router will keep surfacing a closed draft.
- Inventing a hook for the social cascade instead of mapping per
  the type table.
