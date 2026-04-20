---
name: linear-workflows
description: >
  Use when planning, reviewing, or routing Linear work for Nancy or other
  autonomous agents. Applies to issue hierarchy, planning gates, agent issue
  review, execution readiness, and Linear as the source of truth for autonomous
  work. Also use when a repo agent receives dangling Linear issues created in a
  prior discussion and must organize them for Nancy.
---

# Linear Workflows

This skill routes Linear work into the correct workflow before creating or updating issues.

## Core Directive

Linear is the durable planning substrate. Nancy task files are required operational bookkeeping.

Use Linear for planning truth, issue state, gate evidence, comments, and dependency relations. Keep Nancy task files consistent when completing selector work, but do not use local task files to override Linear.

Before starting autonomous execution, the active Linear parent must make the current gate unambiguous:

- What work is authorized.
- What work is explicitly blocked.
- Which issues are executable.
- Which order or dependency constraints apply.
- What evidence proves the gate is ready.

Nancy selector compatibility is required. A Linear issue set that is merely
"ready for execution" is not executable by Nancy unless it matches the selector
shape:

```text
master planning parent
├── accepted gate review issue
└── Backlog or execution parent
    ├── executable issue
    ├── executable issue
    └── post execution review issue
```

Do not leave executable issues as direct children of the master planning parent.
Direct open children that are not `Backlog` or gate review issues are treated as
planning issues by Nancy's selector, which causes planning and review ping pong.

The accepted gate `Execute:` list is a closed authority set. A new issue created
later under the authorized parent is not selectable until the accepted gate text
also authorizes that issue. Current Nancy should pause in
`needs_human_direction` when an accepted gate has an open Backlog child outside
the accepted `Execute:` list. If an older prompt shows `Issue: none` while an
open Backlog child exists, check whether the child is outside the accepted
`Execute:` list before asking an agent to work it.

## Required Preflight

At session start for any Nancy Linear turn:

1. Infer the project from the working directory.
2. Read the selected issue from the prompt.
3. Fetch the selected issue and parent from Linear, when an issue is selected.
4. Read current comments, HANDOVER.md, and unread bus messages.
5. Read the relevant workflow file before creating or updating issues.

If no issue is selected, do not infer work from checkbox order, child issue order, or recent commits. Use the selector closure rule below.

## Dangling Issue Intake

Use this when the user arrives in a repo and names one or more Linear issues
that were created during a prior discussion, but those issues are not yet in a
Nancy selector compatible parent graph.

Goal: organize the issues before execution. Do not implement until the graph is
selector compatible.

1. Identify the repo project from the working directory and fetch each named
   dangling issue from Linear.
2. Fetch each issue's parent, children, comments, labels, state, and relations.
3. Decide whether the issues are worker issues, planning issues, corrective
   issues, or review issues. Preserve existing descriptions and states unless
   they are demonstrably wrong.
4. Find or create the active master parent for the repo task.
5. Find or create one child parent named `Backlog`, or another explicit execution
   parent, under the master parent.
6. Move worker issues under the Backlog or execution parent. Do not leave worker
   issues as direct children of the master parent.
7. Encode dependency order with Linear blocking relations.
8. Create post execution review coverage for each completed worker issue. Use
   either one shared review issue plus Nancy `Review target` selection, or one
   per-worker review issue when the accepted gate authorizes that shape.
9. Create or update one gate review issue under the master parent. Mark it
   `Worker Done` only when it records selector compatible authorization.
10. Use selector compatible gate text with a backticked authorized parent ID and
    an `Execute:` list that includes worker issues and the review issue or
    review issues Nancy must select.
11. If a local Nancy task directory exists, update `HANDOVER.md` and `ISSUES.md`
    as bookkeeping. Linear remains authoritative.
12. Verify by running Nancy's selector when available. The next selected issue
    should be `execution`, `corrective_resolution`, or `post_execution_review`,
    not another planning pass, unless real planning work remains.

For corrective issues discovered after a gate was accepted, repair selector
authority before restarting Nancy:

1. Put the corrective issue under the authorized execution parent.
2. Make the issue recognizable as corrective by adding label `Corrective` or by
   including `Corrective` in the title.
3. Update the accepted gate issue so its `Execute:` line includes the corrective
   issue identifier as part of the full current authorized set.
4. Run the selector and confirm the next mode is `corrective_resolution` with
   the corrective issue selected.

Minimal repaired shape:

```text
master parent
├── Gate review and execution readiness     Worker Done
└── Backlog                                 Todo
    ├── first worker issue                  Todo or Worker Done
    ├── next worker issue                   Todo
    └── Post execution review               Todo
```

## Selector Closure Rule

The Nancy selector is authoritative for the current turn.

When the selector names an issue, work only that issue.

When the selector says no eligible issue:

1. Check unread bus messages.
2. Fetch the active master parent and authorized execution parent from Linear.
3. Verify all authorized implementation, review target, review issue, and corrective issues are closed or at their required terminal state.
4. Check for open children under the authorized parent that are not listed in
   the accepted gate `Execute:` line. Treat these as selector authority defects,
   not as worker discretion.
5. If the selector pauses on `needs_human_direction` for unauthorized Backlog
   work, repair the accepted gate or record why the issue is intentionally
   excluded.
6. If the active master parent remains open and all gate evidence is satisfied, close the master parent and update required Nancy task bookkeeping.
7. If evidence is missing, report the exact missing gate evidence and stop.

## Workflow Routing

- Use [Nancy Two Agent Planning Gate](workflows/nancy-two-agent-planning-gate.md) when Linear must be populated or reviewed before implementation, especially when audit, scope discovery, or pre execution blockers may exist.
- Use [Agent Issue Review Workflow](workflows/agent-issue-review-workflow.md) when issues already exist and need readiness review before Nancy or another worker starts.
- Use [Post Execution Review Workflow](workflows/post-execution-review-workflow.md) after worker issues have been implemented and need one-target autonomous review outcome recording or corrective issue creation.

## Universal Issue Rules

Every worker issue should:

- Be completable by one autonomous agent in one session.
- Reference stable files, modules, commands, or symbols, not line numbers.
- State acceptance criteria and verification.
- Avoid speculative cleanup.
- Avoid combining unrelated work.
- Name dependencies when order matters.

Planning issues do not authorize product code changes unless the active workflow and parent issue explicitly say so.

## State Ownership

Use Linear as the source of truth for issue state.

- Worker implementation issues end in `Worker Done` unless the task prompt requires `Done`.
- Review issues end in `Done` after required review comments or evidence are recorded.
- Corrective issues end in the terminal state required by their selector.
- Corrective issues created after gate acceptance must be under the authorized
  parent, recognizable as corrective, and included in the accepted gate
  `Execute:` list before Nancy can select them.
- Gate issues end in `Worker Done` when they record authorization or gate acceptance.
- Master parent issues end in `Worker Done` when no authorized child, review, or corrective work remains open and the selector has no eligible issue.

## Selector Compatible Gate Text

When recording a ready gate, include backticks around the authorized parent ID.
The Bash selector currently parses the parent from this exact shape:

```text
Planning complete. Outcome: Ready for execution.
Authorized execution parent: `ISSUE-ID`.
Execute: ISSUE-1, ISSUE-2, ISSUE-3.
```

For blocker gates:

```text
Planning complete. Outcome: Pre execution blockers required.
Authorized blocker parent: `ISSUE-ID`.
Execute blockers only: ISSUE-1, ISSUE-2, ISSUE-3.
```

When repairing authority for later corrective work, update the accepted gate
description with the full current authorized issue set. Do not replace the
existing execution set with only the new corrective issue unless all prior
authorized work is intentionally removed from selector authority.
