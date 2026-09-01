# Helioy runtime adapter

Use this contract whenever pstack asks for a Task, subagent, model panel, cloud worker, background run, or wait loop.

Warroom is the counterparty. Read [`warroom`](../../../../helioy-bus/skills/warroom/SKILL.md) for every execution rule. This file translates pstack vocabulary into warroom and restates nothing warroom already owns. Read [`mdx-artifacts`](../../mdx-artifacts/SKILL.md) before choosing any output path.

## Ownership

Pstack owns the method, rubric, playbook, and proof requirements. Helioy warroom owns multi-agent execution, lifecycle, messaging, runtime selection, and cleanup. The parent agent remains the orchestrator and final judge.

Do not create a parallel agent registry, message channel, or lifecycle manager. Bus remains the live event owner.

## Execution priority

1. Use the Helioy warroom and bus tools when available.
2. Use the runtime's native subagent facility for a bounded local fanout when warroom is unavailable.
3. Run sequentially when neither facility exists. Preserve the rubric, isolated outputs, coverage table, and explicit gaps.

## Rules owned by warroom

Follow warroom and cite the section. Do not paraphrase these into a pstack brief; a compressed copy drifts.

| Rule | Warroom section |
| --- | --- |
| The orchestrator never reads a diff, log, file, or report, for answers or for QC. Commission a bounded verdict and judge it. Pstack calls this **principle-guard-the-context-window**. | Orchestrator Context Is The Budget |
| Audit the existing area and produce a Reuse Map before any plan or first slice. | The Spine, Mode 1: Scout & Plan |
| Context line first, then skill invocation. Confirm each line landed with `capture-pane`. Re-prime after compaction. | Priming & Compaction |
| Recycle at a phase boundary by default. Compact only for clean members continuing into closely related work, and confirm it landed before the next brief. | Phase & Churn Control |
| Reply shapes, single sentence bus messages, and orchestrator only `reply_to`, including the `signoff:` and `conditional:` strings Peer Consensus requires. | Message Protocol |
| Run `warroom_status` after any membership change. Never reuse agent IDs. Use `pane_id` for `capture-pane` and `/compact`. | Non-Negotiables |
| The same qualified agent twice is not MoE. Spawn once, then `warroom_add` with an explicit `runtime=`. | Setup |
| While a reply is outstanding, do not poll. No `sleep`, `capture-pane`, `warroom_status`, artifact check, or inbox read used only to monitor. | Wait for bus nudges |

## Tool translation

| Upstream instruction | Helioy behavior |
| --- | --- |
| Spawn a Task or cloud agent | Spawn or add one warroom member. Use a native subagent only for bounded fallback work. |
| `subagent_type` | Discover a matching role with `warroom_discover`. Use the reserved `general` pane when no specialist earns its own prompt. |
| `model` slug | Pass the warroom runtime id the skill names (Runtimes). |
| `run_in_background: true` | Dispatch by bus and continue orchestration. Do not poll while the reply is outstanding. |
| `readonly: true` | Use warroom's no writes wording, which binds any subagent the member spawns, and verify the tree is pristine before the verdict. |
| `environment: cloud` | Give the member an isolated worktree or output directory. |
| `environment: local` | Use the current workspace only when the task requires local state. |
| `TaskOutput` or resume polling | Wait for the bus nudge, then call `get_messages`. Confirm the claim through a cheap signal or a commissioned check, never a self read. |
| Task list | Use the current plan facility. Preserve every playbook step and record any skip with a reason. |

## Runtimes

Pstack skills name warroom runtime ids directly: `claude`, `claude-opus`, `codex`, `grok`, `grok-fast`. Warroom's Runtimes table owns what each is, its context size, its skill invocation syntax, and its quirks. Omitting the runtime runs a role on the parent chat model. Never run a diversity panel on one family silently.

## Dispatch contract

Call the bus `whoami` tool, not the shell binary, before the first warroom dispatch. Its agent_id is `reply_to` in every dispatch. Each brief names:

- goal
- exact scope and write boundary
- inputs and grounding paths
- artifact class and output path
- acceptance criteria
- verification command or proof surface
- typed completion line

Reply shapes are warroom's. Detailed work stays in the named artifact.

## Artifact paths

Warroom's mode required paths win inside a warroom mode: the scout report, spec, and brainstorm paths named in Modes. `mdx-artifacts` governs every other output path.

## Scout first

Any pstack playbook touching existing code runs Mode 1 before its first Arena candidate, Swarm slice, or implementation brief. The Reuse Map and its recorded dispositions travel into every downstream brief. A candidate or slice that adds a helper, type, table, runner, or command for a capability the Reuse Map already names is a defect.

## Arena

Arena is a pstack composition over warroom modes, not a warroom mode of its own.

1. Frame one goal and one rubric.
2. Spawn isolated candidates across runtime families.
3. Assign separate output paths or worktrees.
4. Run `warroom_status` before commissioning the judge. Adding the judge renumbers panes and churns bus IDs.
5. Judge through Mode 5: Peer Consensus, using its sign off strings.
6. Select one base, name grafts, and record rejections.
7. Verify the synthesized artifact.

## Swarm

Swarm is a parallel Mode 4 over a declared slice list.

1. Declare the complete slice list before dispatch.
2. Assign one owner, output, and gate per slice.
3. Require PASS, ISSUES, or BLOCKED with evidence.
4. Account for every slice and dropout before a clean verdict.
5. Return a compact coverage table and explicit gaps.

## Long programs

A standing multi-PR program is a warroom Slice Build Loop with a `show-me-your-work` trail as its durable record. Run one pilot slice through verification and landing before scale. Use a rolling window. Stop spawning early enough to drain, verify, and land. Preserve the human merge gate unless the user grants a wider authority.

## Host specific operations

Upstream playbooks may still name a host capability this runtime lacks (a merge queue, a ticket mutation, a chat channel). Use an available capability only when it preserves the same semantics and is authorized. Otherwise mark the playbook step blocked or skipped with the missing capability.

For user visible verification, prefer an existing project harness. Then use an available browser, computer, terminal, or project verification skill. Never claim proof from a compilation proxy when the playbook requires the real surface.

## Phase boundary

Warroom owns recycle and compact mechanics. The pstack addition is one line: re-read this adapter and the active pstack skill after any compaction, because compaction evicts them.
