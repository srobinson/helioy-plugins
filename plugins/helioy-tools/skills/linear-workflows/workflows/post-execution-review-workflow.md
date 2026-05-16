# Post Execution Review Workflow

Use this workflow after autonomous workers have completed implementation issues.

## Purpose

Review one completed worker issue per turn against its Linear specification, code changes, and verification evidence.

The review succeeds for the selected worker issue when the reviewing agent records one outcome in Linear: Review passed, Corrective issues created, or Needs human direction.

## Source Of Truth

Linear is durable state.

Review outcomes, corrective issues, and remaining objections must be recorded in Linear. HANDOVER.md may coordinate loop state, but it cannot replace Linear comments, issue descriptions, statuses, or dependency relations.

## Linear Shape

Post execution review is represented by either:

- One shared review issue plus one Nancy `Review target` per turn, or
- One per-worker review issue when the accepted gate authorizes that shape.

The accepted gate must authorize the review issue or review issues by including identifiers in the gate's `Execute:` line. Each review issue must be recognizable by title or label:

- Title starts with `Post execution review`, or
- Label is `Post Execution Review`, or
- Description contains a type line beginning `Post execution review`.

Each agent turn reviews exactly one completed worker issue and then ends. Do not review another target in the same turn.

If the selector includes a `Review target` line in the prompt, that is the only worker issue in scope for the current turn.

If the selector returns a shared review issue with no `Review target`, do not inspect source or perform an execution set review. Reconcile the selected review issue state from existing `Reviewed worker issue:` markers. If every authorized worker issue has a recorded marker, no corrective issue is open, and no review outcome is `Needs human direction`, mark the review issue `Done` and end the turn. Otherwise record the gap as a comment and end the turn.

## Loop Order

The natural loop order is:

1. Resolve open corrective issues from prior review.
2. Review the single selected worker issue.
3. Create new corrective issues when defects or gaps are found.
4. Record one outcome for the selected worker issue.
5. End the turn.

On a new turn, resolve open corrective issues before returning to post execution review.

Do not continue reviewing more completed work while known corrective issues remain open.

Do not mark a shared post execution review issue `Done` or `Worker Done` while a `Review target` is present.

Needs human direction does not mean task complete. Record the required evidence in Linear, leave the post execution review issue open, and end the turn. Use [Outcome Classification](#outcome-classification) so the selector can distinguish an agent loop from a product or scope decision. Route gate authority drift through [Workflow Repair Routing](#workflow-repair-routing). A later Linear comment starting with `Human direction:` records Stuart's answer and lets the selector return to `post_execution_review`.

## Review Scope

Review exactly one completed worker issue per agent turn. The selected worker issue is named by the `Review target` line in the prompt, or by the selected per-worker review issue when the gate uses that shape.

Record every per-worker outcome as a comment on the post execution review issue. The comment must start with:

```markdown
Reviewed worker issue: ISSUE-ID
```

This marker is selector state for the shared review issue shape. Without it, Nancy may select the same worker issue again.

For each worker issue, inspect:

- Issue description and acceptance criteria.
- Parent or execution gate instructions.
- Linear comments and handoff notes.
- Code changes associated with the worker.
- Tests, builds, logs, or verification evidence.
- Any files or symbols named by the issue.

Do not review from status alone.

## Review Checklist

For the selected worker issue, verify:

- The implementation satisfies the issue acceptance criteria.
- Verification evidence matches the issue requirements.
- The implementation stays within authorized scope.
- No rename, Electron, UI reshape, migration, release, or downstream work was started unless explicitly authorized.
- Existing behavior is preserved unless the issue explicitly scoped a behavior change.
- New or changed files remain within the 500 to 700 line target, or a corrective decomposition issue exists.
- The implementation uses existing code and symbols where appropriate instead of duplicating logic.
- Tests or checks cover the risk introduced by the change.
- The issue status and comments accurately reflect reality.

## Corrective Issues

Create corrective issues when review finds a concrete defect, gap, missing test, incomplete acceptance criterion, unsafe scope expansion, or required cleanup caused by the executed work.

Corrective issues must:

- Be completable by one autonomous agent in one session.
- Reference the completed worker issue that produced the finding.
- State the defect or gap.
- Name affected files, modules, commands, or symbols.
- Avoid line number references.
- State acceptance criteria and verification.
- Be placed under the active execution parent or an agreed corrective parent.
- Block downstream issues when the defect affects their correctness.
- Be selector authorized before Nancy is expected to run them. For the current
  Bash selector, that means the corrective issue is under the authorized parent,
  is recognizable by label `Corrective` or title containing `Corrective`, and is
  included in the accepted gate `Execute:` list.

Do not create vague cleanup backlog items. If the finding is not actionable, record it as a comment or mark it Needs human direction.

## Corrective Authority Repair

If the reviewer creates a corrective issue after the original gate was accepted, the accepted gate must authorize it before Nancy can select it.

Prefer repairing selector authority in the same turn by extending the accepted gate `Execute:` line. If the reviewer misses that step, the selector emits `workflow_repair` and routes a reviewer agent through [Workflow Repair Routing](#workflow-repair-routing). Treat this as workflow drift that agents can repair.

If an older runtime gives agents `Selected Work: Issue: none`, the agent must still refuse to infer authority from `ISSUES.md`.

## Workflow Repair Routing

Stable anchor: `#workflow-repair-routing`.

This section answers: what does Nancy do when I forget to update the gate?

Nancy emits `workflow_repair` for Layer A selector authority defects:

- A Todo or in progress child exists under the authorized execution parent but is missing from the accepted gate `Execute:` line.
- A post execution review issue was closed while an authorized worker lacks a `Reviewed worker issue:` marker.
- The Linear hierarchy is deeper than the selector supports.

The selected prompt still names a real issue. It looks like:

```markdown
## Selected Work

- Mode: `workflow_repair`
- Issue: `REVIEW-ID` Post execution review
- Repair instruction: Extend accepted gate `GATE-ID` Execute line to include `ISSUE-ID`.
- Eligibility: Workflow repair required: open Backlog issue outside accepted gate Execute list
```

The mode instructions reuse post execution review. When `Repair instruction:` is present, the agent must repair only gate authority:

1. Fetch the selected post execution review issue and the named accepted gate.
2. Extend the gate `Execute:` line to include the missing identifier or identifiers.
3. Record the documented repair resolution comment.
4. End the turn without worker review, source review, or reconciliation.

Before rendering the prompt, Nancy records one durable attempt comment on the selected post execution review issue. If no review issue exists, Nancy records it on the master parent. The comment body is exactly one JSON line:

```json
{"repair_attempts":{"target_issue":"ISSUE-ID","repair_instruction":"TEXT","iteration_timestamp":"YYYY-MM-DDTHH:MM:SSZ"}}
```

`target_issue` is the selected post execution review issue when one exists. Required fields are `target_issue`, `repair_instruction`, and `iteration_timestamp`. The selector treats two consecutive identical attempts, same `target_issue` and same `repair_instruction`, with no later resolution as a loop. On the next selector run it emits `agent_stuck` instead of routing another `workflow_repair` turn.

A human or agent clears the counter by adding this exact one line resolution comment after the repair is complete:

```json
{"repair_attempts_resolved":{"target_issue":"ISSUE-ID","repair_instruction":"TEXT","iteration_timestamp":"YYYY-MM-DDTHH:MM:SSZ","resolution":"TEXT"}}
```

The repair agent uses that resolution JSON line as the confirmation comment on the accepted gate for the successful edit. A human can use the same line on the accepted gate or the attempt stream. The selector clears the counter when it reads a matching resolution line after the attempts.

## Review Comments

Use comments for evidence and decisions. Use issues for executable work.

Outcome comment shape:

```markdown
Reviewed worker issue: ISSUE-ID
Outcome: Review passed | Corrective issues created | Needs human direction
Reviewed by: Codex | Claude | [agent name]
Evidence: [what was inspected]
Action: [none, corrective issue IDs, or human direction needed]
```

## Outcome Classification

Stable anchor: `#outcome-classification`.

When the outcome is `Needs human direction`, extend the outcome comment with one `Classification:` line. The line must stand alone and use exactly one of these values:

```markdown
Classification: loop
Classification: decision
```

`loop` means the agent is stuck in a repeated technical or workflow loop and needs Stuart to break the loop. Required body fields:

```markdown
Reviewed worker issue: ISSUE-ID
Outcome: Needs human direction
Classification: loop
Reviewed by: Codex | Claude | [agent name]
Evidence: [what was inspected]
What was tried: [specific repair or review attempts]
What kept repeating: [the repeated failure, selection, or state transition]
Last two relevant issue IDs: ISSUE-ID, ISSUE-ID
Smallest unblock the agent can imagine: [the smallest human action that would unblock the loop]
Action: Human direction needed
```

`decision` means the agent has reached a product, scope, or architecture question that cannot be resolved from the current issue contracts. Required body fields:

```markdown
Reviewed worker issue: ISSUE-ID
Outcome: Needs human direction
Classification: decision
Reviewed by: Codex | Claude | [agent name]
Evidence: [what was inspected]
Question: [the exact unresolved question]
Agent position: [the agent's recommended answer]
Alternative positions: [other plausible answers and consequences]
Smallest decision needed: [the smallest Stuart decision that unblocks work]
Safe work while waiting: [work that remains safe, or none]
Action: Human direction needed
```

A later Linear comment starting with `Human direction:` records Stuart's answer and resolves the pause for selector purposes. Use the `repair_attempts_resolved` JSON line in [Workflow Repair Routing](#workflow-repair-routing) for gate authority loops instead.

## Outcomes

A post execution review turn must end in exactly one outcome.

### Review Passed

Use when the selected worker issue satisfies its contract.

Required Linear evidence:

- Review passed comment.
- Verification evidence is linked or summarized.
- No open corrective issues remain for the reviewed scope.

### Corrective Issues Created

Use when review finds executable follow up work.

Required Linear evidence:

- Corrective issue identifiers.
- Confirmation that the accepted gate authorizes the corrective identifiers, or
  an explicit Needs human direction note if the agent cannot safely update gate
  authority.
- Dependency relations when order matters.
- Clear instruction that the next loop must resolve open corrective issues before continuing review.

### Needs Human Direction

Use only when the agent cannot reach a defensible position after the [Outcome Classification](#outcome-classification) test, or the correct fix requires a product, scope, or architecture decision. Do not use this outcome for gate authority drift covered by [Workflow Repair Routing](#workflow-repair-routing).

Required Linear evidence:

- Exact unresolved question.
- Agent position.
- Concrete consequence of each plausible position.
- Smallest decision Stuart must make.
- Work that remains safe to do, if any.
- The post execution review issue remains open.

## Re-opening PER on Gate Amendment After Closure

A master has one PER per cycle. When the master's accepted gate is amended with new workers *after* the PER has closed (status `Done`), the PER must be reopened to cover the union surface. The selector cannot replay a `Done` PER — `Done` is terminal.

Common triggers:

- Road testing surfaces new defects after PER closed (workers were added to the gate's `Execute:` line under the active master).
- A new design call resolution lands in the gate body and authorizes additional implementation workers.
- A late-arrival corrective wave is filed under the existing master rather than spawning a new master.

The repair procedure:

1. **Reopen the existing PER issue.** Move status from `Done` to `Todo` (or another non-terminal state). Do not file a second PER; there is one PER per master.
2. **Amend the PER acceptance** to mirror the union of the original-cycle scope and the new wave's surface. Every new docs criterion, help inspection, source stub, generated-artifact parity check, and verification surface introduced by the amended gate must appear in the PER acceptance, alongside the original-cycle bullets.
3. **Update PER `blockedBy`** to include the new wave's terminal workers (typically a road-test audit umbrella or the last worker of the new wave). The PER must not be selectable until the new wave's last worker is `Worker Done`.
4. **Record the reopen in the gate body and the PER body.** The gate-body `Required order` line and `Worker mapping` entry for the PER state that the PER is reopened and covers the union surface. The PER body's `Dependencies` section names the new blockers and notes the previous closure timestamp covered the original-cycle scope only.
5. **Record the reopen as a Linear comment on the PER** so the audit trail is durable: `Reopened on YYYY-MM-DD to cover <new wave name>; original closure at <timestamp> covered the original-cycle scope only.`

Why one PER per master, not a new PER per wave:

- The PER's role is to confirm the integrated result against the master's accepted contract. The contract is the gate body, and the gate body now encodes both waves. A second PER would either duplicate the original-cycle bullets or leave them unverified after the amendment.
- Linear's `Reviewed worker issue:` selector state and the `Post Execution Review` label point at one PER artifact per master. Splitting into two PERs requires labeling discipline that the current selector does not enforce.
- The original PER's prior closure is preserved in its history and acceptance changelog. Reopening is additive: the original-cycle review outcomes stay valid; the new wave's surface gets added.

If the reopen lifecycle is not the right shape — for example, the new wave is so large it warrants its own master parent — file a new master with its own gate, PER, and Backlog, and treat the new work as an independent execution unit. That is a separate workflow choice; this section covers the case where the existing master keeps the wave.

## Exit Criteria

The current post execution review turn is complete when exactly one selected worker issue has one recorded outcome and the agent ends the turn.

The overall execution parent is ready for selector final completion only when:

- Every completed worker issue in the execution set has a review outcome.
- All corrective issues are closed or explicitly carried as blockers.
- No review issue has unresolved Needs human direction.
- Parent status and comments match the true state of the work.

If corrective issues were created, the next autonomous loop must resolve them before returning to post execution review.
