---
name: content
description: >
  Route social publishing and engagement work. Reads current cm state,
  summarizes pending posts and DMs, suggests one to three next actions, and
  dispatches the selected action to social-loop. Use for /content, "what should
  I post next", "what is open", or "help me decide what to write today".
---

# Content Router

Read current social state, present a compact status, suggest the next one to
three actions, and dispatch the user's selection to `social-loop`. Drafting
belongs to `my-voice` through `social-loop`.

## State

State lives in cm at `global/project:helioy`. The following semantic names are
tags on `kind: observation` entries:

| Tag | Purpose |
|---|---|
| `blog-published` | Recent posts available for promotion |
| `social-pending` | Stashed engagement targets |
| `social-last-post` | Most recent post per platform and handle |
| `dm-thread-open` | DM threads awaiting a response |
| `engagement-cadence` | Rolling seven day post type histogram |

## Read pass

1. Recall the five tags at `global/project:helioy`.
2. Use `cx_browse` with a single tag when exhaustive enumeration is required.
3. Do not write during the read pass.

## Summary

Render one line per nonempty area. Keep it factual and compact.

```text
Open: 4 social targets, 1 DM owed.
Last 7d: 2 build logs, 1 blog promo, 0 threads.
Last published: 2026-04-25 on Substack.
```

## Suggestion order

Choose no more than three actions. Order them by leverage and decay risk.

1. Promote a `blog-published` entry from the last 24 hours when no matching
   `social-pending` blog promo exists.
2. Reply to a `dm-thread-open` entry whose last direction is inbound and whose
   last message is more than 12 hours old.
3. Work through `social-pending` when at least two targets exist.
4. Suggest a build log or quote tweet when the primary X handle has been quiet
   for more than 24 hours on a weekday.
5. Surface the sole pending target when exactly one exists.
6. Suggest a fresh build log or thread when no state based suggestion applies.

Every suggestion must cite the entry that caused it.

## Dispatch

Wait for the user to choose. Then invoke `social-loop` with the user's phrasing
preserved.

```text
type:    one of {blog-promo, build-log, product-release, proactive-reply,
                  comment-reply, quote-tweet, retweet, thread, dm-cold,
                  dm-followup, dm-reply, "help me pick"}
context: URL and title for promotion, source content for reactive work, or
         target identity and thread state for DMs
target:  X | LinkedIn | both
handle:  @KnowMoreContext | @HelioyMatters
```

Routing rules:

- Published post promotion uses `type=blog-promo` and passes URL, title, and
  hook from the `blog-published` entry.
- A pending target passes `source_url` and `type_hint` unchanged.
- Free form intent matches `social-pending` before asking for context.
- Ask a single focused question only when a required input cannot be inferred.

## List mode

`/content list` renders all five tag groups. `/content list <tag>` renders one
group. Use `cx_browse` for exhaustive enumeration. Sort published posts by
`published_at`, pending targets by `captured_at`, and open DMs by
`last_message_at`, all descending.

List mode never dispatches.

## Empty state

```text
Nothing in flight. What do you want to do?

  1. Draft a build log
  2. Reply to something I have seen
  3. Start a thread
  4. Promote a published post
  5. Send a DM
```

## Output

```text
[summary line]
[summary line if needed]

Suggested:
  1. [action] · [reason]
  2. [action] · [reason]
  3. [action] · [reason]

Pick 1 to 3, or tell me what you want to do.
```

## Rules

- Read cm state on every invocation.
- Scope is always `global/project:helioy`.
- Suggestions reference observed entries.
- Present at most three suggestions.
- Wait for selection before dispatch.
- `social-loop` owns writes. This router reads only.
