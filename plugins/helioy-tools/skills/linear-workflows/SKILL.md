---
name: linear-workflows
description: >
  Use when planning, reviewing, or routing Linear work for Nancy or other
  autonomous agents. Covers issue capture, triage, planning gates, agent issue
  review, execution readiness, and Linear as the source of truth for autonomous
  work.
---

# Linear Workflows

This skill routes Linear work into the correct workflow before creating or updating issues.

## Core Directive

Linear is the durable planning substrate. Nancy task files are required operational bookkeeping.

Use Linear for planning truth, issue state, gate evidence, comments, and dependency relations. Keep Nancy task files consistent when completing selector work. Do not use local task files to override Linear.

Before autonomous execution starts, the active Linear parent must make the current gate unambiguous: what work is authorized, what is blocked, which issues are executable, the dependency order, and the evidence that proves readiness.

## Selector Compatible Shape

Nancy's selector requires this structural shape under any executable master parent:

```text
master parent
├── gate review issue
└── execution parent (titled `Backlog` or named explicitly)
    ├── worker issue
    ├── worker issue
    └── post execution review issue
```

Per layer:

- **Master parent.** Durable container. Stays open while authorized work remains.
- **Gate review issue.** Direct child of master. Title matches `Gate review` or `execution readiness` (selector regex, case insensitive). Status encodes readiness: `Todo` means a planner must approve before execution; `Worker Done` means accepted gate, body holds authorization.
- **Execution parent.** Child of master, titled `Backlog` or named in the accepted gate. Wraps the worker issues.
- **Worker issues.** Children of the execution parent. Encode order with Linear `blocks` and `blockedBy` relations. Each must appear in the accepted gate's `Execute:` line.
- **Post execution review issue.** Recognizable by title prefix `Post execution review`, label `Post Execution Review`, or description type line starting `Post execution review`. Must appear in the accepted gate's `Execute:` line.

Direct open children of the master that are not `Backlog` and do not match the gate review pattern are treated by the selector as planning issues. This causes planning and review ping pong.

### Accepted Gate Body

Two valid outcome shapes. The selector parses these exact patterns:

The selector regex is unanchored and matches the FIRST occurrence in the body. Two hygiene rules follow from this:

- Do not bold or italicize the Outcome value. `Outcome: **Ready for execution**` fails the match; `Outcome: Ready for execution` succeeds.
- Do not re-use the keywords `Outcome:`, `Execute:`, `Authorized execution parent:`, or `Authorized blocker parent:` anywhere in the body except on their canonical lines. A prose mention like "per the Execute: line below" captures first and yields zero authorized IDs, which silently routes the gate into `workflow_repair`. If you need to refer to the Execute list in prose, call it "the authorization list" or rewrite the sentence.

```text
Planning complete. Outcome: Ready for execution.
Authorized execution parent: `ISSUE-ID`.
Execute: ISSUE-1, ISSUE-2, ISSUE-3, REVIEW-ID.
Required order: ISSUE-1 before ISSUE-2. ISSUE-3 is independent.
```

```text
Planning complete. Outcome: Pre execution blockers required.
Authorized blocker parent: `ISSUE-ID`.
Execute blockers only: ISSUE-1, ISSUE-2, ISSUE-3.
Required order: ISSUE-1 before ISSUE-2.
Downstream planning remains blocked until these land and a fresh audit runs.
```

The `Execute:` line is a closed authorization set. Issues added under the authorized parent later are not selectable until the gate body is updated to include them. This includes corrective issues created during post execution review.

#### Open design calls

If any worker carries an unresolved design question at promote time, the gate body resolves it before authorizing the worker. Format:

```
## Design call resolution: <topic>

<Resolution statement. Marked binding for the worker. One-line rationale.>
```

The worker body MUST restate the resolution. Workers read their own issue first; chaining back to the gate to discover binding choices is exactly how relitigation leaks in.

## Issue Lifecycle

Issues move through five named states:

1. **Captured.** Drive by stub recorded by any agent during unrelated work. Status `Todo`. Parent: `Inbox: <project>`. The stub stays in the inbox during triage and closes out at triage sign-off (`Done` with parent removed, or `Canceled` if the design reframed it away). The stub is source material for triage, not the triaged worker itself.
2. **Triaged.** A worker issue authored during triage, informed by one or more captured stubs and/or direct observations the user provides. Status `Todo`. Parent: `Backlog` under a real master. Triaged workers are new issues, not reparented stubs — one stub may decompose into multiple workers, several stubs may collapse into one, and stubs may be reframed entirely.
3. **Authorized.** Listed in the accepted gate's `Execute:` line. Gate review issue is `Worker Done`.
4. **Executed.** Implementation complete. Status `Worker Done`.
5. **Reviewed.** Post execution review outcome recorded. Status `Done`.

Capture and triage are separate steps on purpose. Capture stays fast and shallow. Triage adds structure when you revisit the work.

For new feature work where the planning happens up front in a focused session, capture is skipped. Triage happens during the session.

## Workflow Routing

Pick the workflow by where you are in the lifecycle.

| Situation | Workflow |
|---|---|
| Recording a drive by issue during unrelated work | [Intake and Triage](workflows/intake-and-triage-workflow.md), capture protocol |
| Revisiting captured issues, ready to organize for execution | [Intake and Triage](workflows/intake-and-triage-workflow.md), promote protocol |
| Issues already exist, scope or quality is uncertain | [Agent Issue Review](workflows/agent-issue-review-workflow.md) |
| High-confidence or high-blast-radius issue set needs iterated fresh-eyes audit until exhaustion | [MoE Issue Review](workflows/moe-issue-review-workflow.md) |
| Designing new work in a focused co authoring session | [Single Agent Planning](workflows/single-agent-planning-workflow.md) |
| Designing work that benefits from walking skeleton + pass-by-pass refinement instead of layer-by-layer construction | [Progressive Refinement](workflows/progressive-refinement-workflow.md) |
| Discovering scope from scratch with audits and two agent verification | [Nancy Two Agent Planning Gate](workflows/nancy-two-agent-planning-gate.md) |
| Worker issues have been implemented, awaiting review | [Post Execution Review](workflows/post-execution-review-workflow.md) |
| Building a client deliverable pack from an approved brief | [Tender Production](workflows/tender-production-workflow.md) |

## Required Preflight

At session start for any Nancy Linear turn:

1. Infer the project from the working directory.
2. Read the selected issue from the prompt.
3. Fetch the selected issue and parent from Linear, when an issue is selected.
4. Read current comments, HANDOVER.md, and unread bus messages.
5. Read the relevant workflow file before creating or updating issues.

If no issue is selected, do not infer work from checkbox order, child issue order, or recent commits. Use the selector closure rule below.

## Selector Closure Rule

The Nancy selector is authoritative for the current turn.

When the selector names an issue, work only that issue.

When the selector says no eligible issue:

1. Check unread bus messages.
2. Fetch the active master parent and authorized execution parent from Linear.
3. Verify every authorized worker, review target, review issue, and corrective issue is closed or at its required terminal state.
4. Check for open children under the authorized parent that are not listed in the accepted gate `Execute:` line. Treat these as selector authority defects, not as worker discretion.
5. If unauthorized Backlog work exists, treat it as selector authority drift. Nancy auto routes it through `workflow_repair`; see [Workflow Repair Routing](workflows/post-execution-review-workflow.md#workflow-repair-routing).
6. If the active master parent remains open and all gate evidence is satisfied, close the master parent and update required Nancy task bookkeeping.
7. If evidence is missing, report the exact missing gate evidence and stop.

## Universal Issue Rules

Every worker issue must:

- Be completable by one autonomous agent in one session.
- Reference stable files, modules, commands, or symbols. Never use line numbers — they rot the moment the file changes.
- Frame file and symbol references as entry points the worker reads in current source. Not exhaustive lists, not pinned anchors.
- Verify every cited path against the live filesystem before promoting. Capture-era references rot when files move or are renamed.
- Describe capability and observable behavior. Do not prescribe implementation. No code blocks defining structs, enums, function bodies, or wire shapes — the worker chooses the shape from current source.
- State acceptance criteria as observable behavior. State verification as commands.
- Avoid speculative cleanup.
- Avoid combining unrelated work.
- Name dependencies when order matters.
- Strip planning-session narrative. See [Strip Planning Context from Worker Bodies](#strip-planning-context-from-worker-bodies) below for the rule and concrete rewrites.

Planning issues do not authorize product code changes unless the active workflow and parent issue explicitly say so.

## Strip Planning Context from Worker Bodies

Every token in a worker body costs the executing agent context budget. Planning narrative burns budget the worker needs for current source, and invites relitigation: the worker reads the planner's argument and re-runs the analysis instead of executing the agreed outcome. PER agents pay the same tax.

Worker bodies state capability, constraints, acceptance, and verification. They do not narrate how the planner got there.

Patterns to strip:

- **Historical recap.** "Prior worker did X. Field test showed Y." Reduce to: `Source: ALP-XXXX field test. Symptom: Y.`
- **Comparative reasoning.** "kubectl/git/etc. does X, therefore...". Binding decisions belong in the gate's `Design call resolution`, not re-derived in the worker.
- **Mechanism explanations.** "The asymmetry is visible because X was introduced by ALP-YYYY but Z was never migrated." Replace with the entry point. Let the worker read current source.
- **Scope-policing rationale.** "X is unaffected because it already does Y." One bullet under `## Out of scope` is enough.
- **Structural-choice justification.** "Why one master, not two", "Why this beats X", "Sequencing rationale". Encoded already in Linear relations and the gate's `Required order:` line.
- **Cross-references inside narrative.** Cross-references inside prose force the worker to chase them. Bind decisions in the gate body. Treat the worker body as self-sufficient.

Heuristic: if you find yourself writing `because`, `which is inconsistent with`, or `the prior worker did X, so` — you are writing planning context. Cut it.

## State Ownership

Linear is the source of truth for issue state. `Worker Done` carries different meaning by issue type:

| Issue type | `Worker Done` means |
|---|---|
| Worker (executable) | Implementation complete, awaiting post execution review. |
| Gate review | Authorization recorded. Body holds accepted `Execute:` list. |
| Planning | Planning content reviewed and accepted by the reviewer agent. |
| Corrective | Corrective fix complete, awaiting review. |
| Master parent | All authorized children terminal, no eligible selector work. |

`Done` means:

| Issue type | `Done` means |
|---|---|
| Worker | Post execution review recorded `Review Passed` outcome. |
| Post execution review | All review outcomes recorded, no open corrective, no unresolved human direction. |
| Corrective | Selector terminal state per its workflow. |
| Gate review | Not used. Gate review terminates at `Worker Done`. |

Corrective issues created after a gate is accepted must be added to the gate's `Execute:` line before Nancy can select them. See [Post Execution Review Workflow](workflows/post-execution-review-workflow.md) for the repair procedure.
