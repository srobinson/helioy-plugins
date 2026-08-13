---
name: social-loop
description: >
  Dispatch social engagement across 11 post types on X and LinkedIn for
  Stuart's @KnowMoreContext (engine) and @HelioyMatters (brand) handles.
  Covers original posts (blog-promo, build-log, product-release), reactive
  posts (proactive-reply, comment-reply, quote-tweet, retweet), threads,
  and DMs (cold, followup, reply). Hands prose drafting to my-voice;
  this skill owns taxonomy, context gathering, state writes, and the
  paste-flow publish for v1. Use when the user invokes /content and picks
  a social action, when content routes a blog-promo, or when the user says
  "tweet this", "reply to that", "DM them", "thread about X",
  or names any of the 11 type slugs directly.
---

# social-loop

Route social work to the right mechanic, gather minimum context, hand prose to `my-voice`, copy the result to the clipboard, open the right surface, and write state back to cm so the next `/content` invocation reflects what just happened.

This skill never drafts prose. All wording goes through `my-voice`.

## Setup

Before doing anything else:

1. `cx_recall` with `tags: ["social-last-post"]`, then `tags: ["social-pending"]`, then `tags: ["dm-thread-open"]`, then `tags: ["engagement-cadence"]` at scope `global/project:helioy`. The four entry types are stored as **tags** on cm `kind: observation` entries — cm's `kind` enum is fixed and does not include these names. State informs handle defaults and cadence checks.
2. Confirm pbcopy is available (macOS default). If not, fall back to printing the draft for manual copy.
3. Note: crosspost MCP is not installed in v1. All publish steps use the paste flow described in the Publish section.

## Inputs

```
type:    one of 11 (see taxonomy) or "help me pick"
context: type-specific (see per-group flows)
target:  X | LinkedIn | both
handle:  @KnowMoreContext | @HelioyMatters
```

For a routed blog promotion, expect `type=blog-promo` with
`context = {url, title, one-line-hook, target}`. Default
`handle=@KnowMoreContext` for that case.

When invoked from `/content` router, all four inputs arrive resolved. When invoked directly by the user, prompt only for what is missing.

## Type taxonomy

| # | Type | Group | Mechanic | LinkedIn xpost |
|---|---|---|---|---|
| 1 | blog-promo | 1 original | gather → my-voice → paste | yes, adapt |
| 2 | build-log | 1 original | gather → my-voice → paste | yes when substantial |
| 3 | product-release | 1 original | gather → my-voice → paste | yes, adapt |
| 4 | proactive-reply | 2 reactive | extract → my-voice → paste | no |
| 5 | comment-reply | 2 reactive | extract → my-voice → paste | no |
| 6 | quote-tweet | 2 reactive | extract → my-voice → paste | no |
| 7 | retweet | 2 reactive | decision-only, no draft | no |
| 8 | thread | 3 multi-beat | mini-interview → my-voice → paste | yes, collapse |
| 9 | dm-cold | 4 DM | interview → my-voice → paste | LI DM optional |
| 10 | dm-followup | 4 DM | interview → my-voice → paste | LI DM optional |
| 11 | dm-reply | 4 DM | paste-in → my-voice → paste-out | n/a |

## Handle awareness

Group 1 posts ask which handle posts. Defaults below are locked for v1; do not silently apply, confirm with the user when handle is not supplied.

| Type | Default handle |
|---|---|
| blog-promo | @KnowMoreContext (engine) |
| build-log | @KnowMoreContext (engine) |
| product-release | @HelioyMatters (brand) |
| proactive-reply | @KnowMoreContext |
| comment-reply | @KnowMoreContext |
| quote-tweet | @KnowMoreContext |
| thread | @KnowMoreContext |
| dm-* | @KnowMoreContext |

Pass `handle` to `my-voice` so prose adapts. v1 uses the single Stuart voice for both handles; the handle string still threads through for future brand-voice extension.

## Group 1 — Original posts

Drafted from scratch with context. blog-promo, build-log, product-release.

### Context gathering

| Type | Required context |
|---|---|
| blog-promo | url, title, one-line hook |
| build-log | what shipped, one technical detail worth zooming, so-what |
| product-release | what released, version or milestone, link, one-line value statement |

If any required field is missing, ask one question at a time until satisfied. Do not invent context.

### Flow

```
1. Resolve handle (default per table; confirm if absent).
2. Resolve target (X | LinkedIn | both). Confirm if absent.
3. Invoke my-voice via Skill tool with:
     content_type: "X / Twitter Post"   (or "Long-Form / Essay" for LI long version)
     handle: <handle>
     context: <gathered fields>
4. Receive 2-3 variations from my-voice.
5. Present variations to user. User picks A/B/C or asks for edit.
6. If target includes LinkedIn and the post is substantial (build-log >2 sentences,
   blog-promo, product-release): invoke my-voice again with
     content_type: "Long-Form / Essay" + same context, label "LinkedIn adaptation".
7. Publish via paste flow (see Publish section).
8. Write social-last-post.
```

## Group 2 — Reactive posts

Need source content. proactive-reply, comment-reply, quote-tweet, retweet.

### Context gathering

User pastes either a URL or the source post text. Skill extracts the original claim or question. If the user only provides a URL and content extraction is not possible without browsing, ask for the pasted text directly.

### Per-type flow

**proactive-reply** — replying to a post that appeared in the timeline.

```
1. Receive source (URL + pasted text).
2. Identify the claim or question worth engaging.
3. Invoke my-voice with content_type "X / Twitter Reply" + source + handle.
4. Present single draft (replies are not A/B'd).
5. Publish via paste flow on X only.
6. Write social-last-post.
```

**comment-reply** — replying to a comment on a Stuart post.

Same as proactive-reply but include the original Stuart post as additional context to my-voice so the reply lands in-thread.

**quote-tweet** — adding commentary that quotes the source.

```
1. Receive source URL + pasted text.
2. Invoke my-voice with content_type "X / Twitter Post (QT)" + source + handle.
   (my-voice treats QT as a post type with the source as anchor.)
3. Present 2 variations.
4. Publish via paste flow on X only. Include QT URL in the paste instructions.
5. Write social-last-post.
```

**retweet** — decision-only. No draft.

```
1. Receive source URL + pasted text.
2. Apply RT decision rubric:
   - Does it advance Stuart's thesis? (cognitive infrastructure, agent design,
     small composable tools, solo-builder ergonomics)
   - Is the author someone Stuart would amplify? (avoid amplifying low-signal
     accounts even when one post is good)
   - Has Stuart RT'd this author within the last 7 days?
     (check social-last-post; avoid clustering)
3. Output one of: "yes RT", "skip", "consider QT instead — here is why".
4. If RT chosen: instruct user to RT in the X app; no paste.
5. Write social-last-post with type=retweet, url=source.
```

### Stashing

If the user surfaces a target without acting on it, write `social-pending`:

```
cx_store
  scope: global/project:helioy
  kind:  observation
  tags:  ["social-pending", "knowmorecontext", <type_hint>]
         (add "helioymatters" if the engagement is for the brand handle)
  body:
    source_url:   <url>
    captured_at:  <ISO timestamp>
    type_hint:    <proactive-reply | quote-tweet | ...>
    note:         <optional one-liner>
```

The router surfaces stashed targets at the next `/content` invocation. Do not draft; only stash.

## Group 3 — Threads

Multi-beat. Gather the minimum context needed to establish the thread's arc.

### Mini-interview

Ask in order, one at a time:

1. Thesis — one line the reader should leave believing.
2. Beats — 3 to 7 single-line points that build the argument.
3. Closer — what comes next, what Stuart is shipping about this, or the implication that matters.

Capture verbatim. Do not paraphrase before handoff.

### Flow

```
1. Run mini-interview.
2. Invoke my-voice with content_type "X / Twitter Thread" + thesis + beats + closer + handle.
3. Receive thread draft (each post numbered, character counts shown per my-voice convention).
4. Present full thread. User approves whole or edits per-post.
5. If edits requested per-post, re-invoke my-voice for that post only with the edit note.
6. Publish via paste flow:
     - First post copied to clipboard, X compose URL opened.
     - Skill prints subsequent posts with paste instructions to chain as replies
       in the X thread composer.
7. If target includes LinkedIn:
     - Invoke my-voice with content_type "Long-Form / Essay" + thesis + beats + closer
       + label "LinkedIn collapse from thread".
     - Paste flow for LinkedIn long-post.
8. Write social-last-post (one entry per platform).
```

## Group 4 — DMs

Per type. Drafts only; user pastes in the X or LinkedIn app.

### Per-type interview

| Subtype | Questions |
|---|---|
| dm-cold | who (handle + one-line on them), hook (what triggers reaching out), ask (single specific request) |
| dm-followup | who, what they engaged with (post / DM / call), single forward step |
| dm-reply | paste the incoming DM verbatim |

### Flow

```
1. Run per-type interview.
2. Invoke my-voice via Skill tool with:
     content_type: "DM cold" | "DM followup" | "DM reply"   (extended my-voice types)
     handle: <handle>
     context: <interview answers + incoming DM if dm-reply>
3. Present single draft. DMs are not A/B'd; terse beats variations.
4. User approves or edits.
5. Publish via DM paste flow:
     - Copy approved draft to clipboard.
     - Open the recipient's DM URL when known
       (https://x.com/messages/compose?recipient_id=<handle> or LinkedIn equivalent),
       otherwise open the platform DM home and print the recipient handle.
     - Print paste instructions.
6. Write dm-thread-open:
     cx_store
       scope: global/project:helioy
       kind:  observation
       tags:  ["dm-thread-open", "knowmorecontext"]
              (add "helioymatters" if DM sent from the brand handle)
       body:
         who:               <handle>
         platform:          X | LinkedIn
         last_message_at:   <ISO timestamp>
         last_direction:    outbound
```

For dm-reply, capture the entry ID from the original `cx_store` and use `cx_update` to append the new turn instead of creating a duplicate.

## Publish — paste flow (v1)

crosspost MCP is not installed. v1 uses pbcopy + open.

### Per-platform commands

**X post or thread first post:**

```bash
printf '%s' "<approved-text>" | pbcopy
open "https://x.com/compose/post"
```

**X reply:**

```bash
printf '%s' "<approved-text>" | pbcopy
open "<source-post-url>"
```

Print: "Draft copied. Click Reply on the source post and paste."

**X quote-tweet:**

```bash
printf '%s' "<approved-text>" | pbcopy
open "https://x.com/compose/post?text=&url=<source-url>"
```

If the URL-prefilled compose does not carry text, instruct user to paste over the URL field or use Quote action on the source post.

**X DM:**

```bash
printf '%s' "<approved-text>" | pbcopy
open "https://x.com/messages/compose?recipient_id=<handle>"
```

**LinkedIn post:**

```bash
printf '%s' "<approved-text>" | pbcopy
open "https://www.linkedin.com/feed/?shareActive=true"
```

**LinkedIn DM:**

```bash
printf '%s' "<approved-text>" | pbcopy
open "https://www.linkedin.com/messaging/"
```

### Confirmation step

After opening the surface and printing paste instructions, ask:

> "Posted? Paste the URL when live. Type 'skip' to mark this as drafted but not posted."

If URL provided:

```
cx_store
  scope: global/project:helioy
  kind:  observation
  tags:  ["social-last-post", "knowmorecontext", <type-slug>]
         (add "helioymatters" if posted from the brand handle)
  body:
    platform:   X | LinkedIn
    type:       <type slug>
    posted_at:  <ISO timestamp>
    url:        <live URL>
    handle:     @KnowMoreContext | @HelioyMatters
```

If skip:

```
cx_store
  scope: global/project:helioy
  kind:  observation
  tags:  ["social-pending", "knowmorecontext", <type-slug>]
         (add "helioymatters" if relevant)
  body:
    draft_text:   <approved text>
    captured_at:  <ISO timestamp>
    type_hint:    <type>
    note:         "deferred publish; resume from this draft"
```

### Crosspost MCP — deferred

When crosspost MCP lands, replace the paste flow with:

- `crosspost:create_post` for single posts
- `crosspost:create_thread` for threads
- `crosspost:create_dm` (if available) for DMs; otherwise keep paste flow for DMs

The state-write contract does not change.

## State writes

All writes go to cm at scope `global/project:helioy` with `kind: observation`.
The semantic names below are **tags** applied to each entry, not cm kinds.

| Tag | Trigger | Body fields |
|---|---|---|
| social-last-post | Every successful post or RT | platform, type, posted_at, url, handle |
| social-pending | Stashed target or unconfirmed publish | source_url \| draft_text, captured_at, type_hint, note |
| dm-thread-open | Outbound or inbound DM | who, platform, last_message_at, last_direction |
| engagement-cadence | Optional, on each post | counts_by_type increment, window_start (rolling 7d) |

Always-tag rule: every cm write tags `knowmorecontext` (default editorial
home). Entries posted from `@HelioyMatters` add the `helioymatters` tag.
Tag the type slug (e.g. `blog-promo`, `quote-tweet`, `dm-cold`) and the
campaign slug if applicable (e.g. `transport-matters-launch`).

Use `cx_store` for new entries. Capture the returned entry ID for any
entry that may be updated or forgotten later (`dm-thread-open` for the
same recipient, `social-pending` that resolves to a published post).

When marking a `social-pending` resolved (user came back and posted),
`cx_forget` the pending entry by ID after writing the corresponding
`social-last-post`.

## Cadence checks

Before drafting a Group 1 post, read `engagement-cadence` and `social-last-post` from cm via `cx_recall` with `tags: ["engagement-cadence"]` and `tags: ["social-last-post"]` respectively. If the same type was posted within the last 24 hours, surface a one-line warning:

> "Last build-log was 6 hours ago. Continue, switch type, or stash for later?"

Do not block. The user decides.

## my-voice handoff contract

When invoking my-voice via the Skill tool, pass:

```
content_type: <one of>
  "X / Twitter Post"
  "X / Twitter Reply"
  "X / Twitter Post (QT)"
  "X / Twitter Thread"
  "Long-Form / Essay"        (for LinkedIn adaptations)
  "DM cold"
  "DM followup"
  "DM reply"

handle: @KnowMoreContext | @HelioyMatters

context: type-specific dict
  blog-promo: { url, title, one-line-hook }
  build-log: { what_shipped, technical_detail, so_what }
  product-release: { what, version, url, value_statement }
  reactive: { source_url, source_text, our_angle? }
  thread: { thesis, beats[], closer }
  dm-cold: { who, hook, ask }
  dm-followup: { who, engaged_with, forward_step }
  dm-reply: { who, incoming_dm }
```

my-voice owns the prose. Do not edit my-voice output before showing to the user. Edits happen after user feedback, by re-invoking my-voice with the edit note.

## Rules

- NEVER draft prose in this skill. All wording goes through my-voice.
- NEVER auto-publish in v1. Paste flow only. Crosspost MCP integration is deferred.
- NEVER skip the state write. Every successful post produces a `social-last-post` entry tagged correctly.
- NEVER amplify the same author twice within 7 days without surfacing it (RT decision rubric).
- NEVER use a fictitious cm `kind` like `social-last-post` in `cx_store`. cm's `kind` enum is fixed; semantic names are tags.
- ASK for handle when ambiguous. Defaults are surfaced, not silently applied.
- ONE question at a time during interviews.
- Replies and DMs get one draft, not three. Originals get 2-3 variations.
- Capture verbatim user phrasing during interviews; pass through to my-voice unedited.
- During interviews, do not bundle structural or downstream questions
  while the user is still building an answer. Wait for explicit
  completion before asking about thread shape, beat ordering, or
  follow-up beats.
- If the user provides raw notes or asks for an interview answer to be
  restated in their voice, dispatch to `my-voice` for the restatement
  and capture the returned line verbatim. Never paraphrase locally.
- @KnowMoreContext content is Tinkerer-register on every surface (X
  originals, threads, blog-promo, build-log). Closers are present-tense
  practice statements. Forbidden: "Subscribe", "Follow along", "Let me
  know what you think", any second-person reader invitation. The work
  earns the follow.
- Audience for @KnowMoreContext: the layman AI practitioner, the
  future Helioy customer. The Tinkerer provides insight to assist
  them; do not write down and do not assume engineering depth.
- ALWAYS tag `knowmorecontext` on every cm write. Add `helioymatters` for entries posted from the brand handle. Tag the type slug and the campaign slug.

## Anti-patterns

- Drafting prose locally instead of invoking my-voice.
- Asking for handle when routed context already supplied it.
- Writing `social-last-post` before the user confirms posted.
- Skipping cadence check on Group 1.
- Stashing into `social-pending` without `type_hint` (router cannot dispatch).
- Forgetting to re-open or update `dm-thread-open` on dm-reply.
