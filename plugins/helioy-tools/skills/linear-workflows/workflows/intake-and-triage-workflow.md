# Intake and Triage Workflow

Use this workflow to capture drive by issues without ceremony and to promote captured stubs into selector compatible execution graphs when you revisit them.

## Two Protocols

This workflow has two named protocols:

- **Capture.** Used during unrelated work, by any agent, to record an issue for later triage.
- **Promote.** Used when you revisit captured stubs and want to organize them for Nancy execution.

Capture is fast. Promote is deliberate.

## Capture Protocol

Use this any time an agent is asked to record a Linear issue while working on something else. The goal is to preserve the observation in a known location with minimal ceremony.

Steps:

1. Identify the Linear project for the work, e.g. `transport-matters`, `context-matters`, `nancy`.
2. Find or create the project's inbox issue:
   - Title: `Inbox: <project-slug>`.
   - Status: `Todo`. The inbox stays open indefinitely.
   - Parent: none. The inbox is a top level issue in the project.
3. File the new stub as a child of the inbox.

The stub needs:

- Clear short title.
- Brief description: what was observed, why it matters, where it was noticed.
- Status `Todo`.

Do not author acceptance criteria, do not analyze scope, and do not invent a master parent or Backlog at capture time. Stay shallow. The inbox is the durable handoff point for later triage.

If multiple related observations come up in the same session, file them as separate stubs. Grouping decisions belong in promote, not capture.

## Promote Protocol

Use this when you arrive at the repo, revisit one or more inbox stubs, and want to organize them for Nancy execution.

Steps:

1. Pick the stub or stubs that belong together as one unit of work.
2. Read each stub's title, description, and any comments. Confirm the work is real and the scope is roughly understood.
3. Decide the readiness path:
   - **Need review.** The stubs are short. Scope or acceptance criteria are incomplete. Leave the gate review issue `Todo` for Nancy's planner to verify on iter 1. See [Agent Issue Review Workflow](agent-issue-review-workflow.md) for what the planner will check.
   - **Ready to execute.** You know exactly what you want. Author the accepted gate body and mark the gate review issue `Worker Done`. See [Single Agent Planning Workflow](single-agent-planning-workflow.md) for the co authoring exit checklist.
4. Create a master parent in the same project. Title should describe the objective, not the stubs. Example: `Codex transport continuity`, not `Fix 3 stubs from Inbox`.
5. Create `Backlog` as a child of master, status `Todo`.
6. Reparent each stub from the inbox into `Backlog`. Update the stub descriptions to add acceptance criteria, scope notes, and dependencies if missing.
7. Encode blocker dependencies as Linear `blocks` and `blockedBy` relations.
8. Create the post execution review issue as a child of `Backlog` (or master, per chosen shape). Title `Post execution review: <objective>`.
9. Create the gate review issue as a direct child of master. Title `Gate review: <objective>` or `Gate review and execution readiness`. Body: proposed accepted gate text per the [Selector Compatible Shape](../SKILL.md#selector-compatible-shape) section in the skill.
10. Set the gate review issue status per the readiness decision in step 3.

The inbox stays open across promotions. Only its stubs move.

## Corrective Authority Repair

For corrective issues discovered after a gate was accepted, repair selector authority before restarting Nancy:

1. Put the corrective issue under the authorized execution parent.
2. Make the issue recognizable as corrective by adding label `Corrective` or including `Corrective` in the title.
3. Update the accepted gate issue so its `Execute:` line includes the corrective issue identifier as part of the full current authorized set.
4. Run the selector and confirm the next mode is `corrective_resolution` with the corrective issue selected.

Minimal repaired shape:

```text
master parent
├── Gate review and execution readiness     Worker Done
└── Backlog                                 Todo
    ├── first worker issue                  Todo or Worker Done
    ├── next worker issue                   Todo
    └── Post execution review               Todo
```

## Promote Sanity Check

After promote, the master parent should match the [Selector Compatible Shape](../SKILL.md#selector-compatible-shape). Run a quick check:

- Master has exactly one gate review issue and one execution parent as direct open children.
- No other direct open children. The inbox is in the project, not under master.
- Execution parent's open children are worker issues plus the post execution review issue.
- Every worker issue identifier appears in the gate review body's `Execute:` line.
- The post execution review issue identifier appears in the `Execute:` line.

If any check fails, the selector will downgrade to `planning` mode or pause in `needs_human_direction`.

## Inbox Hygiene

The inbox is a holding area for unprocessed observations, not a backlog. Promote or cancel each stub within a couple of revisit sessions. If a stub has lived in the inbox without triage for longer, it has become a backlog item by neglect. Either cancel it with a one line reason or promote it.

If a stub turns out to be wrong, cancel it (status `Canceled`) with a one line comment. Do not delete. Cancellation preserves history.
