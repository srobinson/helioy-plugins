# Progressive Refinement Workflow

Use this workflow when planning work that benefits from a walking-skeleton + pass-by-pass approach instead of layer-by-layer construction. The analogies that fit are progressive JPEG rendering (the whole image appears fuzzy first, then sharpens with each pass) and pottery (start with a clump, shape evolves with the work). The output is a selector compatible execution graph where each worker issue is a vertical slice of capability, not a horizontal layer of code.

This is the alternative to [Single Agent Planning](single-agent-planning-workflow.md) when architectural risk is concentrated at the boundaries between components and end-to-end validation is cheaper than layer-by-layer verification.

## When To Use

Progressive refinement fits when:

- The system has multiple components or products that must interoperate, and the boundary contracts are new.
- The cost of being wrong about an architectural assumption rises with how deep into layer-by-layer construction you've gone.
- A demoable working system at every checkpoint is more valuable than fully complete layers.
- The user can clearly describe a tracer-bullet first pass that exercises the whole system at low fidelity.
- Refactoring across earlier passes is acceptable as part of the work, not a sign of rework.

Avoid it when:

- The work is genuinely independent across layers (no cross-component contracts to validate).
- Worker issues need to be delegated to specialists who shouldn't see other layers.
- A frozen interface contract has already been validated and only one layer needs to be built behind it.
- Stuart wants strictly non-overlapping worker scopes for review simplicity.

## Source Of Truth

Linear is durable state. The session transcript is not. Every pass description, scope boundary, acceptance criterion, and refactor permission must be recorded in Linear before the planning session ends.

The master parent description holds the **full pass plan** so any reviewer who arrives mid stream sees the arc, not just the current pass.

## Pass Shape

A typical execution graph has 5 to 10 passes, ordered linearly (each pass blocks the next via Linear `blockedBy` relations).

### Pass 1: Tracer Bullet

The smallest possible end-to-end slice. Demonstrates the architecture, not the features. Acceptance criterion is "one command end to end with the most permissive shortcuts allowed."

Pass 1 may use hardcoded values, skip authentication, skip persistence, skip error handling. Its only job is to prove the boundaries between components hold.

### Passes 2 to N-1: Capability Passes

Each pass adds **one conceptual capability** across all touched layers. Examples:

- Pass 2: lifecycle reporting works end to end (state transitions, exit detection).
- Pass 3: a new transport surface is alive (e.g. MCP, HTTP API).
- Pass 4: a new domain concept is wired (e.g. channels, labels).
- Pass 5: an enforcement layer activates (e.g. AuthZ checks, audit log).

A pass description that needs the word "and" twice is two passes.

### Pass N: Hardening

The final pass converts the walking skeleton into a production-ready system. Snapshot tests, performance benches, release infrastructure, documentation. Acceptance criterion is "every promise in the spec is verifiable."

### Pass Issue Title Convention

Each pass worker issue title starts with the pass number:

```text
Pass 1: tracer bullet — sm run + sm get agents end to end
Pass 2: lifecycle close — SIGKILL detection, state transitions, kqueue
Pass 3: MCP transport — daemon hosts MCP, sm mcp stdio bridge
Pass 4: channels — mail durable + nudge surface
Pass 5: IAM stub — Authorizer trait wired, audit log writes
Pass 6: labels and selectors end to end
Pass 7: polish — sm doctor, sm link, sm logs
Pass 8: hardening — cargo-dist, release-please, snapshot tests, benches
```

This prefix lets reviewers and selectors recognize pass-shaped work at a glance.

## Discipline Rules

Three rules are non negotiable for the workflow to deliver on its promise.

### Rule 1: One Conceptual Capability Per Pass

Each pass adds exactly one capability with end-to-end acceptance. Resist "we should have done this in Pass 1 but didn't" — that's a separate pass. If a pass description needs the word "and" twice, split it.

### Rule 2: Earlier Passes Are Refactor Targets

Pass N+1 may rewrite code Pass N introduced. The walking skeleton is scaffolding, not load-bearing heritage. Every pass description must include the line:

```markdown
Refactor permission: earlier-pass code may be rewritten if this pass requires it.
```

Reviewers must not flag legitimate refactor as scope expansion when it serves the current pass's capability.

### Rule 3: End-to-End Acceptance Per Pass

Every pass acceptance criterion is "the user can run this command and observe this outcome" — not "the code is clean" or "the types are defined." Pass-end review is "does it work?" before "is it clean?". Without this rule, progressive refinement degenerates into half-built features stacked sideways.

A pass that passes the smoke test but has internal mess is acceptable. A pass with clean code but broken end-to-end behavior is not.

## Author Discipline

For each pass worker issue, the planning agent must:

- Title the issue with the `Pass N:` prefix and a one-line capability summary.
- State the end-to-end acceptance criterion as one or more concrete commands and their observable outcomes.
- Name the files, modules, and symbols expected to be touched. Acknowledge that this list is partial because the pass cuts across layers.
- Encode the `blockedBy` relation to the previous pass.
- Include the standard `Refactor permission` line.
- State which earlier-pass shortcuts this pass is allowed to remove (e.g. "Pass 1 hardcoded the runtime kind; this pass introduces dispatch").
- State which shortcuts this pass is allowed to keep (e.g. "Persistence remains in-memory; Pass 5 introduces sqlite").
- List the verification commands the reviewer will use.

Reviewers reading the issue before execution should see the pass arc in the master parent description and the specific pass scope in this issue.

## Reviewer Immediate Throwback

In progressive refinement, the reviewer is part of the working loop, not a separate phase that runs after batches of work complete.

After the worker marks a pass `Worker Done`, the next selector turn picks the post execution review immediately. The next pass cannot start until the current pass reaches `Done` (review passed) or has authorized corrective issues that the next pass blocks-by.

This is enforced by:

- Each pass `blockedBy` the previous pass (Linear relation).
- Linear `blocks` clears when the blocking issue reaches `Done`, not `Worker Done`. Therefore the next pass is selectable only after the current pass has been reviewed and passed.
- Corrective issues created during a pass review get added to the gate `Execute:` line and `blockedBy` the next pass.

Result: review is immediate and tight. Worker completes, reviewer reviews next turn, throwback creates corrective work that must land before forward progress. The pass arc cannot move on a half-baked foundation.

### Reviewer Knows Scope

The reviewer's prompt names the pass under review. The reviewer must read:

- The pass issue description and acceptance criteria.
- The master parent description for the full pass arc context.
- The previous-pass review outcome to know what shortcuts the previous pass was allowed to keep.

The reviewer must NOT flag as defects:

- Code that the current pass description explicitly allows to remain (deferred to a later pass).
- Refactor of earlier-pass code, when it serves the current pass.
- Internal mess inside a pass that meets its end-to-end acceptance criterion.

The reviewer must flag as defects:

- End-to-end acceptance criterion not met.
- Removal of a previous pass's capability without explicit authorization.
- Introduction of a feature that belongs to a later pass.
- Files that violate workspace size budgets or duplicate existing code unnecessarily.

## Build The Structural Scaffold

Same selector compatible shape as other planning workflows:

```text
master parent
├── gate review issue
└── execution parent (Backlog or named)
    ├── Pass 1: tracer bullet — ...
    ├── Pass 2: capability — ...
    ├── ...
    ├── Pass N: hardening — ...
    └── post execution review issue
```

The master parent description must include a `Pass Plan` section listing all passes with their one-line summaries, so any reviewer can decode the arc:

```markdown
## Pass Plan

1. Pass 1: tracer bullet — minimal end-to-end spawn + list
2. Pass 2: lifecycle — exit detection, state transitions
3. Pass 3: MCP transport — daemon hosts MCP
4. ...
8. Pass 8: hardening — cargo-dist, snapshot tests, benches

Refactor permission: each pass may rewrite earlier-pass code that serves the current pass's capability.
Review rhythm: each pass blocks the next via Linear relation; review is immediate after Worker Done.
```

## Close The Gate

The accepted gate body uses the standard format from [Accepted Gate Body](../SKILL.md#accepted-gate-body). The `Required order:` line is mostly linear (each pass before the next):

```markdown
Planning complete. Outcome: Ready for execution.
Authorized execution parent: `BACKLOG-ID`.
Execute: PASS-1-ID, PASS-2-ID, PASS-3-ID, PASS-4-ID, PASS-5-ID, PASS-6-ID, PASS-7-ID, PASS-8-ID, REVIEW-ID.
Required order: PASS-1-ID before PASS-2-ID before PASS-3-ID before PASS-4-ID before PASS-5-ID before PASS-6-ID before PASS-7-ID before PASS-8-ID.
```

The post execution review issue is shared across the whole pass set (one review issue, reviewed one pass per turn) unless the user opts into per-pass review issues.

## Confidence Encoding

The gate review status signals confidence to Nancy:

| Status | Selector behavior |
|---|---|
| `Worker Done` | Nancy iter 1 lands on execution mode. Pass 1 is selected immediately. |
| `Todo` | Nancy iter 1 lands on planning mode against the gate review. The planner runs a readiness pass and either accepts the gate or contests the pass plan. |

For progressive workflows, lean `Todo` more often than other workflows: the pass plan is the strongest signal of quality and benefits from planner verification.

## Exit Checklist

A progressive refinement planning session is complete only when every item below is true:

1. Master parent exists with the objective AND the full `Pass Plan` section recorded in the description.
2. `Backlog` (or named execution parent) is a direct child of master.
3. Every pass is a worker issue under `Backlog` with:
   - `Pass N:` title prefix
   - End-to-end acceptance criterion as observable command outcomes
   - `Refactor permission` line
   - Explicit list of shortcuts this pass removes and keeps
4. Pass dependencies are encoded as Linear `blockedBy` relations (Pass N blocked-by Pass N-1).
5. Post execution review issue exists.
6. Gate review issue exists as direct child of master.
7. Gate review body holds proposed accepted gate text with the full pass set in the `Execute:` line.
8. Gate review status reflects confidence (`Todo` recommended for progressive plans).

If any item fails, the session is not complete.

## Pass-Specific Review Cadence

Unlike batched post execution review, progressive refinement reviews one pass per turn AND requires the review to complete before the next pass starts. The cadence:

```
Pass N worker iter completes
  ↓
Pass N status → Worker Done
  ↓
selector picks Pass N post execution review (next turn)
  ↓
reviewer reviews Pass N against its acceptance criteria
  ↓
  outcome: Review Passed
    → Pass N status → Done
    → Pass N+1 unblocks (blockedBy relation clears)
    → next selector turn picks Pass N+1
  
  outcome: Corrective Issues Created
    → corrective issues blocked-by Pass N+1
    → corrective issues added to gate Execute: line via authority repair
    → corrective work lands before Pass N+1 begins
    → after correctives, re-review Pass N
```

This is the same machinery as standard post execution review, but the linear pass dependencies make the rhythm tight by construction.

## Comparison To Other Workflows

| Workflow | Worker scope | Acceptance shape | Review cadence |
|---|---|---|---|
| [Single Agent Planning](single-agent-planning-workflow.md) | Layer or component | "Code complete, criteria met" | Batched post execution review |
| [Two Agent Planning Gate](nancy-two-agent-planning-gate.md) | Layer or component | "Planning issue reviewed" | Loop during planning; standard PER for execution |
| **Progressive Refinement** | One capability across layers | "End-to-end command works" | Immediate per-pass (enforced by blocking) |
| [Agent Issue Review](agent-issue-review-workflow.md) | Pre-existing issues | "Issue quality verified" | Inline review |

## Out Of Scope

This workflow does not cover:

- Drive by issue capture. See [Intake and Triage](intake-and-triage-workflow.md).
- Scope discovery from scratch when the user can't yet describe a tracer-bullet pass. See [Two Agent Planning Gate](nancy-two-agent-planning-gate.md).
- Reviewing already drafted issues. See [Agent Issue Review](agent-issue-review-workflow.md).
- Reviewing completed work in a workflow that batches review. See [Post Execution Review](post-execution-review-workflow.md). Progressive uses post execution review's machinery but with per-pass cadence enforced by blocking.

## Lessons For Reuse

The first time this workflow runs end-to-end, record in the master parent comment thread:

- Which pass found the architectural surprise (validates the choice of progressive).
- Which pass needed an unplanned refactor of an earlier pass (validates the refactor-permission rule).
- Which pass took longer than its scope suggested (signal of pass-sizing bias).
- Whether the per-pass review cadence prevented or caused thrashing.

These notes inform whether progressive refinement should be the default for similar future work or stay an opt-in.
