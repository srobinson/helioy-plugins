# Single Agent Planning Workflow

Use this workflow when you and one agent sit together for a focused planning session to design a unit of work. The output is a selector compatible execution graph that Nancy can run.

This is the lighter alternative to the [Nancy Two Agent Planning Gate](nancy-two-agent-planning-gate.md). Use the two agent gate when scope is unknown, when audit driven discovery is required, or when you want cross verification between two agents. Use this workflow for well understood feature work that does not need that much ceremony.

## Purpose

Capture planning state directly into Linear during a single co authoring session, ending with a selector compatible execution graph and an accepted gate.

## Source Of Truth

Linear is durable state. The session transcript is not. Every decision, scope boundary, acceptance criterion, and dependency must be recorded in Linear issues before the session ends.

## Session Shape

A typical session has five phases:

1. **Frame the objective.** The user describes the work. The agent restates the objective, asks about scope boundaries, and inventories the surface.
   - For unfamiliar code, spawn a research subagent rather than reading full source files into context. Brief the subagent with the question, the directories to look in, and the shape of the expected answer.
   - Surface lessons and prior decisions from cm and from related master bodies.
   - Enumerate any open design calls — binding decisions the planner must make before authoring. Surface them now so phase 2 can resolve them rather than discover them mid author.
2. **Resolve open design calls.** Pre resolve the low controversy ones (state the call and the rationale; let the user reverse). Interview the user on the genuinely contested ones. Each resolution becomes a `Design call resolution` block in the gate body and a `Binding decisions from the gate` section in any worker body it constrains.
3. **Author worker issues.** The agent drafts each worker issue with title, description, acceptance criteria, verification, and dependencies. The user reviews and corrects each one in flight.
4. **Build the structural scaffold.** Create master parent (if missing), `Backlog`, post execution review issue, gate review issue.
5. **Close the gate.** The agent writes the accepted gate text. The user decides whether the gate ships in `Backlog` (awaiting MoE Issue Review or manual review), `Todo` (Nancy's planner verifies), or `Worker Done` (authorized for execution).

## Scope Discovery During Framing

Framing can reveal that the master's scope is wrong:

- It should absorb scope from an adjacent master (double work that would be avoided by combining).
- It should split because two unrelated change surfaces got bundled.
- It should re sequence relative to siblings.

When this happens, propose the restructure to the user before authoring workers. Update affected masters' cross links and statuses (cancel absorbed masters with a redirect comment; update sibling masters' "after X PER passes" references). Restructuring is normal iteration, not a deviation.

## Author Discipline

For each worker issue, the agent must:

- Reference stable files, modules, commands, or symbols. Avoid line number references.
- State acceptance criteria explicitly as observable behavior.
- Name verification as commands (tests, builds, manual checks).
- Encode dependencies as Linear blocking relations.
- Keep the issue completable by one autonomous agent in one session.
- Reference existing code and symbols before proposing duplicates.
- Strip planning narrative from worker bodies. See [Strip Planning Context from Worker Bodies](../SKILL.md#strip-planning-context-from-worker-bodies).

Default to **fewer, broader workers**, not more, narrower ones. "Bounded" does not mean "narrow." A worker can do substantial coherent work (multiple files, large LOC) as long as it is one coherent change in one direction. Phase level migrations typically need 4-6 workers, not 10. When tempted to split, ask: would the same author execute both halves in one head state? If yes, one worker.

Do not author worker issues for speculative cleanup, future features, or work outside the framed objective.

## Exit Checklist

A single agent planning session is complete only when every item below is true:

1. Master parent exists with the objective recorded in the description.
2. `Backlog` (or named execution parent) is a direct child of master.
3. Every worker issue is under `Backlog` with acceptance criteria and verification.
4. Blocker dependencies are encoded as Linear relations.
5. Post execution review issue exists under `Backlog`.
6. Gate review issue exists as a direct child of master.
7. Gate review issue body holds proposed accepted gate text in the [Selector Compatible Shape](../SKILL.md#accepted-gate-body), including a `Design call resolution` block for every open call resolved during the session.
8. Gate review status reflects confidence:
   - `Worker Done` if the user is confident the plan is complete and correct.
   - `Todo` if the user wants Nancy's planner agent to verify before execution.
   - `Backlog` if the user wants to run [MoE Issue Review](moe-issue-review-workflow.md) or manual review before authorizing.

If any item fails, the session is not complete. Leave the work mid stream and resume rather than running Nancy on a partial graph.

## Confidence Encoding

The gate review issue status is how the user signals confidence to Nancy:

| Status | Selector behavior |
|---|---|
| `Backlog` | Gate is authored but not yet authorized. The user is reviewing or running MoE Issue Review before deciding. Nancy ignores until status changes. |
| `Todo` | Nancy iter 1 lands on `planning` mode against the gate review issue. The planner runs a readiness pass and either marks the gate `Worker Done` or contests. |
| `Worker Done` | Nancy iter 1 lands on `execution` mode. First unblocked worker is selected immediately. |

All three paths are valid. Pick by how well you know the work.

## After SAP

When the gate is in `Backlog`, the natural next step is [MoE Issue Review](moe-issue-review-workflow.md) against the authored worker set + PER + gate body. After MoE passes (or after manual review), the user flips the gate status to `Todo` or `Worker Done`.

## Out Of Scope

This workflow does not cover:

- Drive by issue capture. See [Intake and Triage Workflow](intake-and-triage-workflow.md).
- Scope discovery from scratch. See [Nancy Two Agent Planning Gate](nancy-two-agent-planning-gate.md).
- Reviewing already drafted issues. See [Agent Issue Review Workflow](agent-issue-review-workflow.md).
- Fresh eyes audit pass against drafted issues. See [MoE Issue Review Workflow](moe-issue-review-workflow.md).
- Reviewing completed work. See [Post Execution Review Workflow](post-execution-review-workflow.md).
