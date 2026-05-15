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

Needs human direction does not mean task complete. Record the required evidence in Linear, leave the post execution review issue open, and end the turn. The selector should pause on `needs_human_direction` until Stuart resolves the review decision. A later Linear comment starting with `Human direction:` records the answer and lets the selector return to `post_execution_review`.

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

If the reviewer creates a corrective issue after the original gate was accepted,
it must also repair selector authority or explicitly hand off that repair. A
Todo corrective issue under Backlog but outside the accepted `Execute:` list
should make current Nancy pause in `needs_human_direction` until the gate is
repaired. If an older runtime gives agents `Selected Work: Issue: none`, the
agent must still refuse to infer authority from `ISSUES.md`.

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

A later Linear comment starting with `Human direction:` records Stuart's answer and resolves the pause for selector purposes.

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

Use only when the agent cannot reach a defensible position or the correct fix requires a product, scope, or architecture decision.

Required Linear evidence:

- Exact unresolved question.
- Agent position.
- Concrete consequence of each plausible position.
- Smallest decision Stuart must make.
- Work that remains safe to do, if any.
- The post execution review issue remains open.

## Exit Criteria

The current post execution review turn is complete when exactly one selected worker issue has one recorded outcome and the agent ends the turn.

The overall execution parent is ready for selector final completion only when:

- Every completed worker issue in the execution set has a review outcome.
- All corrective issues are closed or explicitly carried as blockers.
- No review issue has unresolved Needs human direction.
- Parent status and comments match the true state of the work.

If corrective issues were created, the next autonomous loop must resolve them before returning to post execution review.
