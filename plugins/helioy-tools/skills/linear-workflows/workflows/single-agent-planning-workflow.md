# Single Agent Planning Workflow

Use this workflow when you and one agent sit together for a focused planning session to design a unit of work. The output is a selector compatible execution graph that Nancy can run.

This is the lighter alternative to the [Nancy Two Agent Planning Gate](nancy-two-agent-planning-gate.md). Use the two agent gate when scope is unknown, when audit driven discovery is required, or when you want cross verification between two agents. Use this workflow for well understood feature work that does not need that much ceremony.

## Purpose

Capture planning state directly into Linear during a single co authoring session, ending with a selector compatible execution graph and an accepted gate.

## Source Of Truth

Linear is durable state. The session transcript is not. Every decision, scope boundary, acceptance criterion, and dependency must be recorded in Linear issues before the session ends.

## Session Shape

A typical session has four phases:

1. **Frame the objective.** The user describes the work. The agent restates the objective, asks about scope boundaries, and identifies relevant existing code, files, and prior decisions.
2. **Author worker issues.** The agent drafts each worker issue with title, description, acceptance criteria, verification, and dependencies. The user reviews and corrects each one in flight.
3. **Build the structural scaffold.** Create master parent, `Backlog`, post execution review issue, gate review issue.
4. **Close the gate.** The agent writes the accepted gate text. The user decides whether Nancy's planner should verify it (`Todo`) or run immediately (`Worker Done`).

## Author Discipline

For each worker issue, the agent must:

- Reference stable files, modules, commands, or symbols. Avoid line number references.
- State acceptance criteria explicitly.
- Name verification (tests, builds, manual checks).
- Encode dependencies as Linear blocking relations.
- Keep the issue completable by one autonomous agent in one session.
- Reference existing code and symbols before proposing duplicates.

Do not author worker issues for speculative cleanup, future features, or work outside the framed objective.

## Exit Checklist

A single agent planning session is complete only when every item below is true:

1. Master parent exists with the objective recorded in the description.
2. `Backlog` (or named execution parent) is a direct child of master.
3. Every worker issue is under `Backlog` with acceptance criteria and verification.
4. Blocker dependencies are encoded as Linear relations.
5. Post execution review issue exists under master or `Backlog` per chosen shape.
6. Gate review issue exists as a direct child of master.
7. Gate review issue body holds proposed accepted gate text in the [Selector Compatible Shape](../SKILL.md#accepted-gate-body).
8. Gate review status reflects confidence:
   - `Worker Done` if the user is confident the plan is complete and correct.
   - `Todo` if the user wants Nancy's planner agent to verify before execution.

If any item fails, the session is not complete. Leave the work mid stream and resume rather than running Nancy on a partial graph.

## Confidence Encoding

The gate review issue status is how the user signals confidence to Nancy:

| Status | Selector behavior |
|---|---|
| `Worker Done` | Nancy iter 1 lands on `execution` mode. First unblocked worker is selected immediately. |
| `Todo` | Nancy iter 1 lands on `planning` mode against the gate review issue. The planner runs a readiness pass and either marks the gate `Worker Done` or contests. |

Both paths are valid. Pick by how well you know the work.

## Out Of Scope

This workflow does not cover:

- Drive by issue capture. See [Intake and Triage Workflow](intake-and-triage-workflow.md).
- Scope discovery from scratch. See [Nancy Two Agent Planning Gate](nancy-two-agent-planning-gate.md).
- Reviewing already drafted issues. See [Agent Issue Review Workflow](agent-issue-review-workflow.md).
- Reviewing completed work. See [Post Execution Review Workflow](post-execution-review-workflow.md).
