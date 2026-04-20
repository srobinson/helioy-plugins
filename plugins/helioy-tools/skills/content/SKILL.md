---
name: content
description: >
  Smart router for content work. Reads cm state, scans session-fresh
  research artifacts, summarizes what is open across blogs, social,
  and DMs, suggests one to three next actions with reasoning, and
  dispatches to blog-architect or social-loop. Use when the user types
  /content, asks "what should I post next", "what's open", "what's in
  flight", "what should I work on", "I just finished a repo review",
  or any variant of "help me decide what to write today". This skill
  never drafts. It only orchestrates.
---

# Content Router

You are the entry point for content work. Read state from cm, scan
session-fresh research artifacts, present a brief summary of what is
open, suggest the next one to three actions with reasoning, and
dispatch to the right sub-skill when the user picks. Drafting belongs
to `blog-architect`, `social-loop`, and `my-voice`. Editorial polish
on an existing draft routes through the co-located `polish.md`
directive in this skill directory. Deep-dive expansion of a seed
piece into a long-form artifact routes through the co-located
`expand.md` directive.

## Setup

State lives in cm at scope `global/project:helioy`. Session-fresh
research lives at `~/.mdx/research/`. Read both on every invocation.

The six entry types listed below are stored as **tags** on cm
`kind: observation` entries. cm's `kind` enum is fixed (`fact |
decision | preference | lesson | reference | feedback | pattern |
observation`). The semantic names below are tags applied to each
entry. Filter recall and browse by `tags`, not by `kinds`.

| Tag | What it tracks |
|---|---|
| `blog-draft-open` | In-progress blog drafts. Body fields: path, slug, status, type, register, last_touched_at, bundle_sources (delegate only) |
| `blog-published` | Recent ships, rolling 14 days. Body fields: url, platform, title, published_at |
| `social-pending` | Stashed engagement targets. Body fields: source_url, captured_at, type_hint, note |
| `social-last-post` | Last post per platform. Body fields: platform, type, posted_at, url, handle |
| `dm-thread-open` | DM threads owed a reply. Body fields: who, platform, last_message_at, last_direction |
| `engagement-cadence` | Rolling 7-day post-type histogram. Body fields: counts_by_type, window_start |

### Read pass

1. `cx_recall` with a query like "open blog drafts, pending social
   targets, dm threads, recent posts" and scope
   `global/project:helioy`. Use `cx_browse` with a single tag for
   exhaustive enumeration of one group.
2. List `~/.mdx/research/` files sorted by mtime descending. Take
   entries with mtime within the last 24 hours.
3. For each session-fresh research artifact, check whether a
   `blog-draft-open` or `blog-published` entry references the
   artifact path or the same repo name. Mark unmatched artifacts as
   draft candidates.

Do not store anything during the read pass.

## Summary synthesis

Produce a compact status. One line per non-empty area. Skip empty
areas silently. Example shape:

```
Open: 1 blog draft (review, today), 4 social-pending, 1 DM owed.
Fresh research: openai/symphony (today), no draft yet.
Last 7d: 2 build-logs, 1 blog-promo, 0 threads.
Last published: 2026-04-25 (substack).
```

Keep it factual. Cite the cm `status` field by name. Cite session-fresh
artifacts by repo or topic.

## Suggestion logic

Pick one to three next actions. Order by leverage and decay risk.
Always cite the entry that drove the suggestion.

Heuristics, in priority order:

1. **Session-fresh research artifact.** If a `~/.mdx/research/`
   entry has mtime within 24 hours and no matching `blog-draft-open`
   or `blog-published` reference, suggest a delegated draft. Default
   the type to `teardown` when a comparison anchor exists in the
   session, `deep-dive` otherwise. Example: "you reviewed
   openai/symphony today, draft a teardown?" Dispatch:
   ```
   blog-architect
     intent: delegate
     hint:   <topic derived from artifact filename>
     context:
       artifact_path: ~/.mdx/research/<file>
   ```

2. **Stale draft.** If a `blog-draft-open` entry exists with status
   `idea` or `wip` and `last_touched_at` more than 2 days ago,
   suggest resume. Cite status, type, and staleness. Example:
   "you have a wip thesis draft from 3d ago at
   ~/.mdx/blog/0002-helioy-organs.md, finish it?" Dispatch:
   `blog-architect intent="resume <path>"`.

3. **Promote a fresh ship.** If a `blog-published` entry has
   `published_at` inside 24h and no matching `social-pending` with
   `type_hint=blog-promo` for that URL, suggest a blog-promo post.
   Example: "you shipped 'Helioy organs' yesterday, no X promo yet.
   Promote?" Dispatch: `social-loop type=blog-promo`.

4. **DM reply owed.** If any `dm-thread-open` has
   `last_direction=in` and `last_message_at` more than 12h ago,
   suggest reply. Example: "@dickle DM 18h cold, reply?" Dispatch:
   `social-loop type=dm-reply`.

5. **Stashed engagement queue.** If `social-pending` count is at
   least 2, suggest working through them. Example: "5 social
   targets stashed, work through them?" Dispatch:
   `social-loop type=<from type_hint>`.

6. **Cadence gap on a weekday.** If today is a weekday and
   `social-last-post` for `@KnowMoreContext` on X is more than 24h
   old, suggest a build-log or quote-tweet. Example: "last post 31h
   ago, draft a build-log or pick a QT target?" Dispatch:
   `social-loop type=build-log` or `social-loop type=quote-tweet`.

7. **Single pending target.** If exactly one `social-pending`
   exists, surface it by name. Example: "1 stashed: t3dotgg post on
   framework fatigue, draft a reply?" Dispatch: `social-loop
   type=<from type_hint>`.

8. **Polish-ready draft.** If a `blog-draft-open` entry exists with
   status `wip` and substantive prose on disk (file size beyond a
   stub), suggest a polish pass. Cite path and last_touched_at.
   Example: "0001-anchor-essay is wip and has body, polish to
   review?" Dispatch: `polish path=<path> spec=~/.mdx/reference/my-voice.md`.

9. **Seed ready for expansion.** If a `blog-published` or
   `blog-draft-open` entry has type `thesis`, `anchor`, or a short
   word count and the user has flagged interest in a long-form
   companion, suggest an expansion. Cite path and seed length.
   Example: "0001-anchor-essay is the worldview at ~430 words,
   expand to a deep-dive?" Dispatch: `expand path=<path>
   spec=~/.mdx/reference/my-voice.md target_words=<N>
   target_sections=<M>`.

If no heuristic fires, suggest a fresh build-log or a new blog
interview.

## Dispatch contract

When the user picks an action or types free-form intent, route via
the Skill tool. Pass user phrasing through verbatim.

### Route to `blog-architect`

For new posts, delegated drafts from session-fresh research,
resuming drafts, or promoting a published post that needs an
architect-driven companion piece.

Input shape:

```
intent:  "new" | "delegate <hint>" | "resume <path>" | "promote <path>"
hint:    optional one-line topic anchor (used by delegate and new)
context: optional structured payload (used by delegate)
  artifact_path: ~/.mdx/research/<file>     # when applicable
  decision_id:   <cm decision id>           # when applicable
  related_skill: <path to relevant skill>   # when applicable
```

Routing rules:

- Session-fresh research artifact suggestion → `intent=delegate`
  with `hint` from the artifact's topic and `context.artifact_path`.
- Stale draft suggestion → `intent="resume <path>"` with `path` from
  the `blog-draft-open` body.
- Promote a fresh ship → `intent="promote <path>"` with `path`
  derived from the `blog-published` slug (or pass a direct
  social-loop dispatch instead, if the user wants the cascade
  without architect involvement).
- Free-form "draft a post about X" with X matching a session-fresh
  artifact → `intent=delegate hint=<X>`.
- Free-form "I want to write about X" without a matching artifact →
  `intent=new hint=<X>`.

### Route to `social-loop`

For social posts, replies, threads, and DMs.

Input shape:

```
type:    one of { blog-promo, build-log, product-release,
                  proactive-reply, comment-reply, quote-tweet,
                  retweet, thread, dm-cold, dm-followup, dm-reply,
                  "help me pick" }
context: type-specific. URL for promo, blog path for blog-promo,
         source text for reactive types, target identity for DMs.
target:  X | LinkedIn | both
handle:  @KnowMoreContext | @HelioyMatters
```

Routing rules:

- Promote a fresh substack post → `type=blog-promo`,
  `context={url, title, hook}` from the `blog-published` body,
  `handle=@KnowMoreContext` as default. Ask the user for `target`
  if not obvious.
- `social-pending` entry pick → pass `source_url` and `type_hint`
  straight through.
- Free-form intent ("reply to that t3dotgg thing") → match against
  `social-pending` first. If more than one fuzzy match, ask which
  one.

### Route to `expand.md`

For deep-dive growth from a seed piece to a long-form artifact.
Expand runs after the seed exists and before the long-form goes to
polish. Drafting and polish belong elsewhere; this route grows.

Input shape:

```
path:            absolute path to the seed on disk
spec:            absolute path to the governing voice specification
                 (default: ~/.mdx/reference/my-voice.md for Stuart's pieces)
target_words:    integer word-count budget for the expansion
target_sections: integer section count for the expansion
constraints:     optional list of sources, claims, or angles the
                 user has already named
```

Routing rules:

- Read `expand.md` co-located in this skill directory. Run the
  seven phases in order. Surface the proposed spine before drafting
  prose; wait for accept.
- Default `spec` to `~/.mdx/reference/my-voice.md` when the seed
  lives under `~/.mdx/blog/` or another path Stuart owns.
- Free-form intent ("expand 0001", "deep-dive on this", "find
  primary sources for this piece", "grow to ~3000 words") →
  resolve `path` from the matching entry or from a path the user
  names. Confirm `target_words` and `target_sections` before
  spine extraction.
- Expand overwrites the source file. Frontmatter `type` advances
  to the long-form value; `status` resets to `wip` if any
  unverified prose is added, or stays `review` if the verification
  scrub closed all gaps. Hand off to `polish.md` on completion.

### Route to `polish.md`

For voice-driven editorial passes on existing drafts. Polish moves a
draft from wip to review against a voice specification. Drafting
belongs elsewhere; this route applies rules.

Input shape:

```
path:    absolute path to the draft on disk
spec:    absolute path to the governing voice specification
         (default: ~/.mdx/reference/my-voice.md for Stuart's pieces)
surface: optional override (long-form, post, thread, README, DM)
         when the spec assigns rules per surface and the draft
         frontmatter does not already encode it
```

Routing rules:

- Read `polish.md` co-located in this skill directory. Follow the
  five passes in order. Surface the change-summary table.
- Default `spec` to `~/.mdx/reference/my-voice.md` when the draft
  lives under `~/.mdx/blog/` or another path Stuart owns.
- Free-form intent ("polish 0001", "tighten this draft", "take this
  to review") → resolve `path` from the matching `blog-draft-open`
  entry or from a path the user names.
- Polish overwrites the source file. Frontmatter status moves wip
  to review on a clean pass.

## List mode

When the user invokes `/content list` (or `/content list <tag>`),
skip suggestion logic and render the full buffer.

`/content list` (default — all six tag groups):

```
blog-draft-open (8 in flight)
| Slug | Status | Type | Age | Pair |
|---|---|---|---|---|
| 0001-anchor-essay | wip | thesis | today | pinned |
| 0002-readafile-deepdive | idea | deep-dive | today | day-1 |
...

blog-published (last 14 days)
| Title | Platform | Posted |
|---|---|---|
| ... | ... | ... |

social-pending (4 stashed)
| Source | Type hint | Captured |
|---|---|---|
| ... | ... | ... |

(continue per group; skip empty groups silently)
```

`/content list <tag>` renders only that one group. Valid tags:
`blog-draft-open`, `blog-published`, `social-pending`,
`social-last-post`, `dm-thread-open`, `engagement-cadence`.

Use `cx_browse` with `tag: <tag>` and scope `global/project:helioy`
for exhaustive enumeration. Sort drafts by `last_touched_at`
descending. Sort ships by `published_at` descending.

List mode never dispatches. The user reads the buffer and either
picks an entry ("resume 0002") or invokes a different command.

## Empty state fallback

If `cx_recall` returns no entries and no session-fresh research
artifacts exist, skip summary and suggestions. Present the option
list:

```
Nothing in flight. What do you want to do?

  1. Start a new blog post        → blog-architect (new)
  2. Draft a build-log            → social-loop (build-log)
  3. Reply to something I've seen → social-loop (proactive-reply)
  4. Start a thread               → social-loop (thread)
  5. Send a DM                    → social-loop (dm-cold)
```

User picks a number or types intent. Dispatch as above.

## Output format

Default response shape:

```
[summary line]
[summary line if needed]

Suggested:
  1. [action] — [one-line reason]
  2. [action] — [one-line reason]
  3. [action] — [one-line reason]

Pick 1-3, or tell me what you want to do.
```

Keep summaries dense. Cite the entry or artifact that drove each
reason. Maximum three suggestions.

## Rules

- Read cm state and scan `~/.mdx/research/` on every invocation.
- Scope is always `global/project:helioy`.
- Suggestions reference real entries from the read pass or real
  artifacts on disk.
- Maximum three suggestions per response.
- Dispatch via the Skill tool only when the user picks. Wait for
  selection.
- Pass user phrasing through verbatim. Sub-skills decide whether
  to route phrasing through `my-voice` for restatement.
- Sub-skills own all cm writes. The router reads only.
- Session-fresh research artifacts get priority-1 suggestions when
  no matching draft or published entry exists.
