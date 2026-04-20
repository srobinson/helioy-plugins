# Post Execution Review Workflow

Use this workflow after autonomous workers have completed implementation issues.

## Purpose

Review completed worker issues against their Linear specification, code changes, and verification evidence.

The loop succeeds when Codex and Claude agree that completed work is acceptable, or when all discovered defects have been captured as executable corrective issues.

## Source Of Truth

Linear is durable state.

Review findings, consensus, corrective issues, and remaining objections must be recorded in Linear. HANDOVER.md may coordinate loop state, but it cannot replace Linear comments, issue descriptions, statuses, or dependency relations.

## Loop Order

The natural loop order is:

1. Resolve open corrective issues from prior review.
2. Review completed worker issues.
3. Create new corrective issues when defects or gaps are found.
4. Stop review and return to step 1 on the next iteration if new corrective issues were created.

On a new turn, resolve open corrective issues before returning to post execution review.

Do not continue reviewing more completed work while known corrective issues remain open unless both agents record that the open issues are independent and do not affect the remaining review.

## Agent Roles

Codex reviews first.

- Reads the worker issue, parent context, comments, code changes, and verification evidence.
- Checks whether implementation matches the issue contract.
- Adds review comments or creates corrective issues when gaps are found.
- Records the reviewed issue, findings, corrective issues, and next intended action in HANDOVER.md when coordination state is needed.

Claude reviews second.

- Reads the same issue context, Codex review comments, corrective issues, and evidence.
- Confirms, rejects, narrows, or expands Codex findings.
- Removes or resolves stale review comments when corrected.
- Records remaining objections and consensus state in HANDOVER.md when coordination state is needed.

The loop exits only when both agents agree that review is complete for the current execution set, or when the outcome is Needs human direction.

## Review Scope

Review each completed worker issue independently before reviewing the execution set as a whole.

For each worker issue, inspect:

- Issue description and acceptance criteria.
- Parent or execution gate instructions.
- Linear comments and handoff notes.
- Code changes associated with the worker.
- Tests, builds, logs, or verification evidence.
- Any files or symbols named by the issue.

Do not review from status alone.

## Review Checklist

For each completed worker issue, verify:

- The implementation satisfies the issue acceptance criteria.
- Verification evidence matches the issue requirements.
- The implementation stays within authorized scope.
- No rename, Electron, UI reshape, migration, release, or downstream work was started unless explicitly authorized.
- Existing behavior is preserved unless the issue explicitly scoped a behavior change.
- New or changed files remain within the 500 to 700 line target, or a corrective decomposition issue exists.
- The implementation uses existing code and symbols where appropriate instead of duplicating logic.
- Tests or checks cover the risk introduced by the change.
- The issue status and comments accurately reflect reality.

For the execution set, verify:

- Dependencies were completed in a valid order.
- Corrective issues created by review are sequenced before downstream work they affect.
- No completed issue relies on an unresolved corrective issue without that dependency being recorded.
- Parent status reflects the true state of the execution set.

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

Do not create vague cleanup backlog items. If the finding is not actionable, record it as a comment or mark it Needs human direction.

## Review Comments

Use comments for evidence and decisions. Use issues for executable work.

Finding comment shape:

```markdown
Review finding: [specific defect or gap]
Evidence: [what was inspected]
Action: [corrective issue created, comment resolved, or human direction needed]
```

Consensus comment shape:

```markdown
Post execution review passed for ISSUE-ID.
Reviewed by Codex and Claude.
No corrective issues remain open for this worker issue.
```

## Outcomes

A post execution review must end in exactly one outcome.

### Review Passed

Use when both agents agree the reviewed worker issue or execution set satisfies its contract.

Required Linear evidence:

- Review passed comment.
- Verification evidence is linked or summarized.
- No open corrective issues remain for the reviewed scope.

### Corrective Issues Created

Use when review finds executable follow up work.

Required Linear evidence:

- Corrective issue identifiers.
- Dependency relations when order matters.
- Clear instruction that the next loop must resolve open corrective issues before continuing review.

### Needs Human Direction

Use only when agents cannot reach a defensible shared position or the correct fix requires a product, scope, or architecture decision.

Required Linear evidence:

- Exact unresolved question.
- Codex position.
- Claude position.
- Concrete consequence of each position.
- Smallest decision Stuart must make.
- Work that remains safe to do, if any.

## Exit Criteria

The workflow is complete when:

- Every completed worker issue in the execution set has a review outcome.
- All corrective issues are either closed or explicitly carried as blockers.
- Both agents agree in Linear that the execution set passed review, or the review is marked Needs human direction.
- Parent status and comments match the true state of the work.

If corrective issues were created, the next autonomous loop must resolve them before returning to post execution review.
