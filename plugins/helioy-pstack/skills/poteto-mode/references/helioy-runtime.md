# Helioy runtime adapter

Use this contract whenever pstack asks for a Task, subagent, model panel, cloud worker, background run, wait loop, or Cursor specific control surface.

Read [`mdx-artifacts`](../../mdx-artifacts/SKILL.md) before choosing any output path.

## Ownership

Pstack owns the method, rubric, playbook, and proof requirements. Helioy warroom owns multi-agent execution, lifecycle, messaging, runtime selection, and cleanup. The parent agent remains the orchestrator and final judge.

Do not create a parallel agent registry, message channel, or lifecycle manager. The orchestration store under `scripts/orch/` may hold program facts during an explicit Orchestrate experiment. Bus remains the live event owner.

## Execution priority

1. Use the Helioy warroom and bus tools when available.
2. Use the runtime's native subagent facility for a bounded local fanout when warroom is unavailable.
3. Run sequentially when neither facility exists. Preserve the rubric, isolated outputs, coverage table, and explicit gaps.

## Tool translation

| Upstream instruction | Claude Code and Codex behavior |
|---|---|
| Spawn a Task or cloud agent | Spawn or add one warroom member. Use a native subagent only for bounded fallback work. |
| `subagent_type` | Discover a matching role. Use `general` when no specialist earns its own prompt. |
| `model` slug | Choose the configured runtime id. Never pass Cursor model slugs to another host. |
| `run_in_background: true` | Dispatch by bus and continue orchestration. |
| `readonly: true` | State a strict no writes boundary in the brief and verify it at the gate. |
| `environment: cloud` | Give the member an isolated worktree or output directory. |
| `environment: local` | Use the current workspace only when the task requires local state. |
| `TaskOutput` or resume polling | Wait for a bus signal. Inspect status or stable pane id when progress evidence is needed. |
| Cursor `/loop` | Use the product wait or recurring monitoring mechanism. |
| Cursor Task list | Use the current plan facility. Preserve every playbook step and record any skip with a reason. |
| `~/.config/helioy/pstack-models.md` | Read `~/.config/helioy/pstack-models.md`. |

## Dispatch contract

Run `whoami` before the first warroom dispatch. Route replies to the orchestrator only. Each brief names:

- goal
- exact scope and write boundary
- inputs and grounding paths
- artifact class and output path selected via `mdx-artifacts`
- acceptance criteria
- verification command or proof surface
- typed completion line

Use one sentence bus replies. Detailed work stays in the named artifact.

Accepted terminal forms:

- `done: <artifact> <evidence>`
- `blocked: <cause> <needed>`
- `review: clean <evidence>`
- `review: issue <severity> <path:line> <fact>`

## Arena

Translate Arena into a warroom Bakeoff:

1. Frame one goal and one rubric.
2. Spawn isolated candidates, preferably across runtime families.
3. Assign separate output paths or worktrees.
4. Commission an independent judge after candidates finish.
5. Select one base, name grafts, and record rejections.
6. Verify the synthesized artifact.

## Swarm

Translate Swarm into warroom Coverage:

1. Declare the complete slice list before dispatch.
2. Assign one owner, output, and gate per slice.
3. Require PASS, ISSUES, or BLOCKED with evidence.
4. Account for every slice and dropout before a clean verdict.
5. Return a compact coverage table and explicit gaps.

## Long programs

For Orchestrate, keep the upstream Frame, Install, Pilot, Scale, Drain, Land, and Close sequence. Use warroom members as workers and bus messages as completion events. Use `scripts/orch/` only as the durable fact store during this explicit experiment.

Run one pilot through verification and landing before scale. Use a rolling window. Stop spawning early enough to drain, verify, and land. Preserve the human merge gate unless the user grants a wider authority.

## Host specific operations

Cursor Automations, Graphite, Bugbot, Slack, ticket mutation, and Cursor UI state have no implicit replacement. Use an available host capability only when it preserves the same semantics and is authorized. Otherwise mark the playbook step blocked or skipped with the missing capability.

For user visible verification, prefer an existing project harness. Then use an available browser, computer, terminal, or project verification skill. Never claim proof from a compilation proxy when the playbook requires the real surface.

## Phase boundary

After a heavy phase, recycle the warroom. Compact only when the same clean members continue into closely related work. Re-read this adapter and the active pstack skill after compaction.
