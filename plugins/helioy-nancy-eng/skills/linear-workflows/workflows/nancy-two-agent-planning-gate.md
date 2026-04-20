# Nancy Two Agent Planning Gate

Use this workflow when Linear must be populated or reviewed before implementation.

## Purpose

Create a reviewed Linear issue graph before autonomous execution starts.

The planning gate discovers scope, records decisions, collects executable work in Backlog, and ends with one explicit outcome.

## Source Of Truth

Linear is durable state.

Use issue descriptions, issue statuses, child issues, and dependency relations for planning state.

Use HANDOVER.md only for coordination between the two live agents.

## Bootstrap Shape

Create this skeleton before starting the two agent loop:

```text
master planning parent
├── group planning parent
├── group planning parent
├── gate review parent
└── Backlog
```

The master planning parent defines:

- Planning objective.
- Current gate type.
- Work in scope.
- Work out of scope.
- Expected outcome options.
- Linear as source of truth.

Each group planning parent defines:

- Planning area.
- Expected output.
- Files, modules, commands, or systems to inspect.
- Constraints.
- Completion evidence.

The gate review parent defines:

- How the final planning output is checked.
- How one outcome is selected.
- How Backlog becomes authorized execution work.

Backlog contains executable work discovered during planning.

## Issue Placement

Use this placement rule throughout the planning gate:

```text
Planning groups contain planning.
Backlog contains discovered executable work.
Gate review authorizes the next execution set.
```

Planning groups may be updated directly. Add child issues under a planning group only when the planning work itself needs a smaller single session planning task.

Create implementation, refactor, test, migration, release, and corrective work under Backlog.

Backlog issues are candidates until gate review authorizes them. They should state:

- Type.
- Scope.
- Affected files, modules, commands, or symbols.
- Acceptance criteria.
- Verification.
- Dependencies or blockers.
- What later work they unblock, when relevant.

Backlog candidate status stays Todo during planning. A Backlog issue is executable work waiting for gate authorization, not planning work that has been completed.

When a planning issue creates or updates Backlog candidates, Claude reviews the planning issue and the produced Backlog candidates together. If accepted, Claude marks the source planning issue Worker Done. The Backlog candidates remain Todo and blocked by gate review until authorized.

## Agent Roles

Codex authors issues.

- Reads HANDOVER.md before acting.
- Creates or updates one focused planning issue at a time.
- Encodes findings, decisions, constraints, dependencies, and discovered work in Linear.
- Places executable work in Backlog.
- Records the current issue, review request, open decisions, and next intended action in HANDOVER.md when coordination state is needed.
- Leaves authored or updated planning issues open for Claude review.

Claude reviews issues.

- Reviews the latest Codex created or updated planning issue and any Backlog candidates it produced.
- Checks scope, sequencing, worker suitability, missing constraints, stale assumptions, and overreach.
- Marks the source planning issue Worker Done when accepted.
- Records non-blocking concerns in the relevant Linear issue or asks Codex to carry them into Backlog on the next turn.
- Records contest findings in HANDOVER.md when changes are needed.
- Leaves contested planning issues open.

## Reviewer Exit Rule

Each Claude review turn ends with one action:

1. Accept.
   Mark the reviewed source planning issue Worker Done. Backlog candidates remain Todo.
2. Contest.
   Leave the planning issue open and record the required change in HANDOVER.md.
3. Needs human direction.
   Use only when the agents cannot make a defensible decision. Record the unresolved question, positions, and consequences in Linear.

Non-blocking concerns do not prevent acceptance.

Questions to Stuart are not a normal review exit. Escalate only through Needs human direction.

Backlog candidate acceptance does not change the Backlog issue status. Accept the source planning issue instead.

## Author Review Loop

Repeat until the planning gate reaches one outcome:

1. Codex creates or updates one planning issue.
2. Codex records the review target and request in HANDOVER.md.
3. Claude reviews that planning issue and any Backlog candidates it produced.
4. If accepted, Claude marks the source planning issue Worker Done.
5. If contested, Claude records the objection in HANDOVER.md.
6. Codex resolves any open contest before creating new scope.

Worker Done means reviewed and accepted.

For planning issues that create Backlog candidates, Worker Done applies to the source planning issue. The Backlog candidate remains Todo until execution.

## Planning Rules

During a planning gate:

- Audit the current system before proposing work.
- Prefer existing code, prompts, scripts, and workflow conventions.
- Keep issue scope one session sized.
- Reference stable files, modules, commands, and symbols.
- Avoid line number references.
- Encode dependency order with Linear relations when order matters.
- Keep comments optional. Required planning state belongs in issue descriptions and issue relations.

## Planning Outcomes

A planning gate ends in exactly one outcome.

### Ready For Execution

Use when Backlog contains a reviewed executable set and no prerequisite blockers are required.

Gate review must:

- Name the authorized Backlog issues.
- Create or identify the execution parent.
- Place authorized executable issues under that parent when they are ready to run.
- State required order.
- Encode dependencies when order matters.
- Update the master planning parent with the outcome.

### Pre Execution Blockers Required

Use when prerequisite work must land before downstream planning or implementation is reliable.

Gate review must:

- Name the blocker issues.
- Create or identify the blocker execution parent.
- Place authorized blocker issues under that parent when they are ready to run.
- State what each blocker unblocks.
- State required order.
- Encode dependencies when order matters.
- Update the master planning parent with the outcome.

### Needs Human Direction

Use when the agents cannot reach a defensible shared position.

Gate review must record:

- Exact unresolved question.
- Codex position.
- Claude position.
- Consequence of each position.
- Smallest decision Stuart must make.
- Safe work while waiting, if any.

## Gate Review Checklist

Before closing the planning gate, verify:

- Planning groups contain accepted planning output.
- Backlog contains discovered executable work.
- Backlog issues are one session sized.
- Dependencies are encoded when order matters.
- One outcome is selected.
- Master planning parent records the outcome and next action.

## Outcome Text

Ready for execution:

```text
Planning complete. Outcome: Ready for execution.
Authorized execution parent: ISSUE-ID.
Execute: ISSUE-1, ISSUE-2, ISSUE-3.
Required order: ISSUE-1 before ISSUE-2. ISSUE-3 is independent.
```

Pre execution blockers required:

```text
Planning complete. Outcome: Pre execution blockers required.
Authorized blocker parent: ISSUE-ID.
Execute blockers only: ISSUE-1, ISSUE-2, ISSUE-3.
Required order: ISSUE-1 before ISSUE-2. ISSUE-3 is independent.
Downstream planning remains blocked until these land and a fresh audit runs.
```

Needs human direction:

```text
Planning paused. Outcome: Needs human direction.
Decision needed: [smallest unresolved decision].
Codex position: [position and consequence].
Claude position: [position and consequence].
Safe work while waiting: [none or issue identifiers].
```
