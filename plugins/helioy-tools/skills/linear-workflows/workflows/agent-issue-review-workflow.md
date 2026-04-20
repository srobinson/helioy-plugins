# Agent Issue Review Workflow

Use this workflow after Linear issues have been drafted and before autonomous execution begins.

## Purpose

Validate issue quality before Nancy or another worker starts implementation.

This workflow reviews, corrects, splits, and sequences issues before product
code changes begin.

## When To Use

Use this workflow when:

- A parent issue has worker issues ready for execution.
- A master issue has group parents and worker issues that need cross checking.
- The work touches multiple files, platforms, roles, or dependencies.
- The user asks for issue review, planning review, Nancy readiness, or agent review.
- The user brings dangling issues from a prior discussion and asks the repo
  agent to organize them for Nancy.

Skip this workflow for single hotfix issues unless the risk is unusually high.

For Nancy execution, "ready" includes selector compatible placement. Worker
issues must be under the authorized Backlog or execution parent named by the
accepted gate. If worker issues are direct children of the master planning
parent, Nancy will keep selecting them as `planning` and autonomous execution
will not start.

If dangling issues are already good enough to execute, do not send them through
another planning loop. Organize them under Backlog, add the gate review issue,
authorize the execution parent, add post execution review, encode blockers, and
then let the selector choose execution.

## Inputs

The reviewer must read:

- The parent or master issue description.
- All child issue descriptions in the execution set.
- Existing Linear comments on those issues.
- Referenced specs, handoff docs, or audit findings.
- Relevant code files or symbols when issue quality depends on current code shape.

Do not review from titles alone.

## Review Assignment

Assign reviewers by natural responsibility, not by issue count.

Common reviewer scopes:

- Frontend UI, routes, components, state, and browser behavior.
- Backend APIs, storage, persistence, migrations, and runtime behavior.
- Platform or Electron constraints.
- UX, content, accessibility, and interaction behavior.
- Test strategy, verification, and release safety.

One reviewer may cover multiple scopes when the issue set is small.

## Review Checklist

For each issue, verify:

- The task can be completed by one autonomous agent in one session.
- The issue has a clear type: audit, planning, refactor implementation, feature implementation, test, review, or release.
- The description names stable files, modules, commands, or symbols.
- The description avoids line number references.
- Acceptance criteria are specific and testable.
- Verification is explicit.
- Dependencies are stated and encoded as Linear relations when order matters.
- The issue does not combine unrelated work.
- The issue does not hide speculative cleanup.
- The issue does not push an individual file past the 500 to 700 line target without a decomposition plan.
- Existing code and symbols are referenced before proposing new duplicates.

For the set as a whole, verify:

- Parent, group parent, and worker hierarchy matches the intended execution shape.
- Nancy execution sets have an accepted gate review issue and authorized worker
  issues under the named Backlog or execution parent.
- No open worker, corrective, or review issue under the authorized parent is
  outside the accepted gate `Execute:` list unless it is intentionally not part
  of the current Nancy run.
- Manual execution order is dependency safe.
- Blocking relations match the execution order.
- Refactoring work that unblocks later tasks is front loaded.
- Research, design, or audit producer issues name their output location.
- Consumer issues name required input artifacts.
- Status values match actual readiness.

## Reviewer Actions

Reviewers may:

- Add Linear comments with precise objections or requested changes.
- Edit issue descriptions when the correction is clear.
- Split an oversized issue into smaller worker issues.
- Create missing worker issues when the gap is concrete.
- Remove or resolve stale comments after the issue has been corrected.
- Recommend dependency or manual order changes.

Reviewers must not:

- Begin implementation.
- Add broad future scope to the active issue set.
- Convert review notes into vague backlog items.
- Leave contradictions between issue descriptions, comments, and status.

## Comment Style

Review comments should be short and actionable.

Use this shape:

```markdown
Concern: [specific issue quality problem]
Required change: [exact edit, split, dependency, or acceptance criterion]
Reason: [execution risk this avoids]
```

When the issue is ready, prefer a terse confirmation:

```markdown
Review passed. Ready for execution.
```

## Exit Criteria

The review is complete when:

- Every worker issue has either passed review or has an unresolved comment blocking execution.
- Oversized issues have been split or explicitly accepted with rationale.
- Dependencies and manual order are aligned.
- Stale comments have been removed or resolved.
- The parent or master issue has a final readiness comment naming the executable set and any remaining blockers.

If blockers remain, the issue set is not ready for Nancy.
