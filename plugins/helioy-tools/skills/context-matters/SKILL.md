---
name: context-matters
description: >
  Storage policy for the cm context store. Use when deciding whether
  to persist a fact, decision, or lesson via cx_store/cx_deposit. The
  cm MCP server documents the tools themselves; this skill governs
  what belongs in the store and what does not.
---

# Context Matters — Storage Policy

The `plugin:helioy-tools:cm` MCP server exposes the `cx_*` tools and their parameters.
This skill is the editorial policy: what earns a slot in the store.

## Store

- **Ideas, decisions, directions** — "we wired up rust-dist in project X
  this way because Y." The reasoning behind a choice, not just the choice.
- **Progression and results** — what was tried, what worked, what failed,
  and the conclusion that fell out of it.
- **Backlog and TODOs** — "this feature needs more thought before we
  build it." Open threads that another session would otherwise re-litigate.
- **Cross-context knowledge** — anything a future session in a different
  repo or project would benefit from knowing.
- **User feedback and corrections** — store immediately as `kind: feedback`.
  Highest recall priority.

## Do NOT store

- **Git history** — it is already in the git log. Commits, SHAs, blame.
- **Line numbers** — transient; the file changes and the number rots.
- **File paths inside a repo** — rarely useful. An agent can locate a
  file by name with a single search. Only store a path when it is a
  durable external reference (config location, install root, etc.).
- **Code snippets that mirror the source** — read the source, do not
  cache it.
- **Routine session activity** — "I read three files and ran the tests."
  No future decision turns on it.
- **Filler that sounds like evidence** — commit name-drops, history
  lessons, padding. Every token must change a decision the reader
  will make. If it does not, cut it.

## Scope

`global > project > repo > session`. Ancestor walk: narrower scopes
inherit broader ones. Pick the narrowest scope where the entry is
actually reusable. Cross-project insight goes to `global`. A
project-wide convention goes to `global/project:<id>`. A codebase
quirk goes to `global/project:<id>/repo:<id>`. Session scope is
ephemeral and rarely worth using.

## Operating rules

1. Call `cx_recall` after receiving a task — query 1-3 keywords, not a sentence.
2. Store as you discover, not at session end. Memory written later is
   memory rewritten.
3. When the user corrects you, store the correction as `kind: feedback`
   before continuing.
4. Use `cx_update` or `supersedes` when an entry is wrong. Do not let
   stale entries accumulate alongside corrections.
5. Do not mention the context store to the user unless asked.

## CLI fallback

`cm stats` — store statistics. `cm serve` — start MCP on stdio.
