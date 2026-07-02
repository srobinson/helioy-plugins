---
name: warroom
description: >
  Orchestrate a helioy-bus warroom: tmux agents doing parallel work under one
  orchestrator. Use for warroom, mixture of experts, MoE review, peer consensus,
  sign-off, brainstorm, spec-writing, code-review, engineering, slice-build-loop,
  or any request that dispatches work to parallel agents.
---

# Warroom

## Role

A warroom is a set of specialist agents running in tmux panes, connected through helioy-bus, working toward a shared goal. You are the orchestrator: choose the mode, phase the work, brief agents, monitor progress, synthesize results, apply authoritative changes, and verify gates.

Agents do the research, review, drafting, and implementation. You own scope, evidence, context hygiene, and final judgment.

## First Decision

Do not spawn a warroom when all of these hold:

- The change is mechanically locked: one to three lines, one obvious implementation, no open design choice.
- The design is already adjudicated by a spec, prior review, or earlier item in the same batch.
- Your own verification gate is sufficient evidence.

Use a warroom when parallel agents improve correctness, coverage, speed, or confidence.

| Need | Mode |
|------|------|
| Sign-off on an artifact | Peer Consensus |
| Divergent ideas before deciding | Brainstorm |
| Planning before Linear or implementation | Spec Writing |
| Verification of existing code | Code Review |
| Approved spec implemented as small PRs | Slice Build Loop |

## Agents

Choose runtime by task shape:

| Runtime | Context | Best For |
|---------|---------|----------|
| Claude | 1m context window | UI work, design synthesis, broad research, long specs, or any task where large context is the main constraint. |
| Codex | 250k context window | Backend work, implementation, tests, refactors, and codebase changes where code execution and patch quality dominate. |

For MoE, use both when the artifact benefits from model diversity. For focused execution, pick the runtime that fits the work instead of defaulting to mixed panes.

## Non Negotiables

- Run `whoami` first. Use that agent_id as `reply_to` in every dispatch.
- Run `warroom_status` after spawn, add, remove, recycle, or any membership change.
- Never reuse agent IDs after `warroom_add` or `warroom_remove`; panes renumber and bus IDs churn.
- Route replies to the orchestrator only. Do not wire agent-to-agent `reply_to` by default.
- Bus messages are single-sentence factual signals. Cite IDs, paths, SHAs, PRs, test names, and `file:line` evidence.
- If a message does not request a reply, do not reply.
- Bus pings wake you; they are not truth. Confirm `done`, `green`, `merged`, and `clean` claims from disk, `gh`, git, Linear, logs, or test output.
- Re-read live state before each verdict. Memory-only consensus is false consensus.
- Treat every completed phase and every merged slice as a hard boundary: before the next brief, the continuing pane must be compacted (and the compaction confirmed via `tmux capture-pane`) or the warroom recycled. Re-briefing a stale pane is a defect, not an optimization. See Phase And Churn Control.
- Pane commands are runtime-prefixed: Claude panes take `/compact`, `/code-review`, `/code-hygiene`; Codex panes take `$compact`, `$code-review`, `$code-hygiene`. This doc writes the `/` form throughout; substitute `$` when the target pane runs Codex. A `/`-prefixed command sent to a Codex pane is inert prompt text, not a command.

## Setup

Use the `helioy-warroom` MCP tools.

```python
warroom_discover(query="security review")
warroom_discover(namespace="helioy-tools")

warroom_spawn(name="design", agents=["brand-guardian", "ui-designer"])

# MoE: same prompt, one pane per runtime.
warroom_spawn(name="moe", agents=["helioy-tools:codebase-analyst"])
warroom_add(name="moe", agent="helioy-tools:codebase-analyst", runtime="codex")

warroom_status(name="design")
warroom_kill(name="design")
```

Notes:

- Qualified names (`<namespace>:<agent>`) select the namespace prompt; `runtime` controls the adapter.
- Passing the same plugin-qualified agent twice to `warroom_spawn` does not create MoE; both panes use the default adapter. Spawn once, then add the second pane with `runtime="codex"`.
- Named warrooms are idempotent. Spawning the same name kills the old warroom first.
- Prefer a clean upfront spawn. If membership must change mid-build, call `warroom_status` and address only the fresh IDs.
- `pane_id` (`%NNN`) survives pane renumbering. Use it for `tmux capture-pane` and `/compact`.
- If MCP tools are unavailable, fall back to `~/.helioy/warroom.sh <name> "type1 type2 ..."`.

## Phase And Churn Control

Phasing is the load-bearing orchestration skill. A phase must be large enough to justify spawn, briefing, and synthesis, but small enough that agents finish before their context turns stale or saturated.

Before dispatch, define the phase contract:

- Goal: one bounded outcome.
- Inputs: exact files, Linear IDs, PRs, specs, or commands to read.
- Outputs: one artifact, one verdict set, one PR, or one decision batch.
- Done line: exact single-sentence reply shape.
- Gate: how you will verify the phase yourself.
- Closeout: recycle or compact.

Right-sized phases:

- Combine mechanical siblings that share the same context, code path, gate, and reviewer.
- Split work when there are independent artifacts, unrelated modules, multiple repos, long diffs, long research inputs, or more than one expected fix-review loop.
- Do not phase every tiny edit. Ceremony can cost more than the work.
- Do not run an open-ended mega-phase. If an agent must retain many unrelated facts or chase multiple decisions, split before dispatch.

End every phase with one of these actions:

1. **Recycle**: `warroom_kill(name=...)`, then spawn a fresh warroom for the next phase. Default after heavy reads, long implementation, role changes, completed slices, merges, or any context-heavy review.
2. **Compact**: for each continuing pane, run `tmux send-keys -t %NNN '/compact' Enter`. Use this only when continuity matters and the same agents continue into the next closely related phase.

Compaction is not instant, and a bus nudge sent too soon races it: the nudge keystrokes land before the pane starts compacting, so the agent reads the mail first and compacts your brief away. After sending `/compact`, confirm via `tmux capture-pane -t %NNN -p | tail -5` that the pane has started or finished compacting before dispatching the next brief; if you cannot check, `sleep 5` first. Some runtimes never echo the compact command itself, so look for compaction output or a fresh idle prompt, not the command. Remember the prefix rule: Codex compacts with `$compact`, and `/compact` typed there is just text sitting in the input. On any runtime the first Enter can be swallowed (command palettes, pasted-content buffers), leaving the command unsubmitted: if the capture shows it still at the prompt, send a bare `Enter` to submit it.

Compaction also evicts skill priming. A reviewer primed with `/code-review` and `/code-hygiene` loses that context when it compacts, so re-prime after every compaction of a skill-dependent pane: type the skill commands back in with send-keys (runtime prefix applies), verify each submitted, and follow with the "parking for later" note (Mode 3 step 5). Do not rely on the pane restoring its own skills; some runtimes do, none guarantee it.

Never begin the next phase in stale panes that were neither recycled nor compacted.

### Compaction is context hygiene, not your budget

Compaction is about the continuing pane's working memory, not your orchestrator token budget. A pane that just finished a slice carries stale residue, the merged diff, intermediate test failures, the gate run, the merge chatter. That residue is liability, not asset: it raises the odds the agent conflates already-merged state with the new work. The durable knowledge it actually needs (the shapes, layouts, and decisions it just built) lives on merged main and in the spec, and it re-reads that cheaply. So abundant capacity is an argument FOR compacting freely between slices, never a license to skip it. Do not reason "my context looks fine, reuse the pane"; capacity is not the axis, the pane's hygiene is.

Decision at every boundary:

- **Same agent, tightly related next slice** (for example S3a then S3b on one feature): `/compact`, confirm via `capture-pane`, then re-brief. The cheapest correct path. Re-prime skills after compaction (skill priming is evicted).
- **Composition changes, the next work is unrelated or heavy, or the agent has drifted**: recycle (`warroom_kill` plus fresh spawn).
- **Never**: send the next brief into a pane that was neither compacted nor recycled, on the theory that its prior-slice context is an asset. The most common slice-loop defect is re-briefing the un-compacted pane and calling it continuity.

Compact or recycle BEFORE the next brief, not after the agent has already started the next slice. Once the next brief is in flight, `/compact` would evict it, so the boundary is the moment to act.

## Message Protocol

All dispatches use orchestrator-only replies:

```python
send_message(to=A, reply_to=ORCHESTRATOR, topic="{project}-{mode}", content=brief)
send_message(to=B, reply_to=ORCHESTRATOR, topic="{project}-{mode}", content=brief)
```

Use `;` recipients only for orchestrator fanout when the exact same brief applies to multiple agents. Still set `reply_to` to the orchestrator.

Every brief must say:

> Reply to the orchestrator only, in one sentence. Keep to facts and evidence. Do not message other agents. Do not summarize unless asked. If this message does not ask for a reply, do not reply.

Prefer typed reply shapes:

- `done: <artifact|branch|PR> <evidence>`
- `blocked: <cause> <needed>`
- `review: clean <evidence>`
- `review: issue <severity> <path:line> <fact>`
- `signoff: I sign off on <X> as currently filed`
- `conditional: I sign off conditional on the following changes: <numbered facts>`

Large artifacts go to files you name and read. Review verdicts ride the bus unless findings cannot fit one sentence and you will read the file to drive fixes.

For no-reply notices, write `FYI no reply needed: <fact>`.

## Mode 1: Peer Consensus

Use after drafting a substantial artifact, such as a Linear plan, spec, design doc, PR, or risky decision, and before treating it as final.

Default composition: same agent prompt on Claude and Codex.

```python
warroom_spawn(name="moe-{topic}", agents=["helioy-tools:codebase-analyst"])
warroom_add(name="moe-{topic}", agent="helioy-tools:codebase-analyst", runtime="codex")
warroom_status(name="moe-{topic}")
```

Variants, in preference order:

1. Same `helioy-tools:*` prompt on Claude and Codex.
2. Cross-role same-runtime panes, such as `code-reviewer` plus `silent-failure-hunter`.
3. Two same-runtime same-role panes. Use only when no better composition exists.
4. Three panes for high-stakes tie-breaking.

Brief both agents independently. Do not ask them to debate each other. The orchestrator synthesizes.

The brief must include:

- Artifact under review: exact Linear IDs, files, PRs, specs, or SHAs.
- Rules: concrete checklist and relevant skill, such as `helioy-tools:linear-workflows`.
- Discipline: find at least one substantive issue or positively justify none found.
- Boundary: agents propose; orchestrator applies writes.
- Reply shape: one sentence to the orchestrator only.
- Sign-off strings:
  - `I sign off on X as currently filed`
  - `I sign off conditional on the following changes:`
- Iteration bound: one critique round, one correction round, then sign off or escalate.

Flow:

1. Agents independently re-read live state and reply to the orchestrator.
2. Orchestrator compares verdicts and evidence.
3. If both clean, accept only if they sign off on the same artifact shape.
4. If either finds an issue, apply the agreed change or send one focused correction brief.
5. Ask both agents to re-read live state and send clean final sign-off.
6. Persist the consensus with `cx_store` or `cx_deposit`.
7. Recycle or compact the warroom before the next phase.

Escalate to the user if the agents disagree after two bounded rounds or if the fix would change scope.

## Mode 2: Spec Writing

Use when planning non-trivial implementation before Linear or code.

Flow:

1. Group work into natural spec units. Each unit should map to one future Linear sub-parent.
2. Phase dependent specs after their prerequisites. Run independent specs in parallel.
3. Dispatch one engineer per spec and one architect reviewer, all replying only to the orchestrator.
4. Engineers write named files, such as `~/.mdx/projects/{project}-spec-{grouping}.md`, then send one `done:` line.
5. After files exist, send the architect a review brief naming the files and criteria.
6. Architect replies with `review: clean ...` or `review: issue ...`.
7. Orchestrator sends one focused fix round to each engineer, then asks the architect to verify deltas only.
8. When all specs are approved, file Linear according to `helioy-tools:linear-workflows`.
9. Consider Peer Consensus on the filed tree.
10. Recycle or compact before the next phase.

Every spec brief must include required inputs, decisions already made, exact output path, exact required contents, completion line, and verification gate.

## Mode 3: Code Review

Use when implementation exists and needs verification against a spec, issue, or PR.

Flow:

1. Run the baseline gate first, such as `cargo check`, `cargo test`, `pnpm test`, or the repo's `just ci`.
2. Default focus is functionality unless the user asked for full or security review. Ask only when the requested depth is unclear.
3. Dispatch reviewers in parallel. Use one reviewer per issue, PR, or coherent code area.
4. Each dispatch names SPEC, CODE, Linear issue or PR, scope, focus, explicit do-not-flag list, key checks, and reply shape.
5. Prime reviewers with skills: instruct them in the brief to invoke `/code-review` (correctness bugs, reuse, simplification) and `/code-hygiene` (decomposition, duplication, boundaries) before reading the diff, so the pass runs on those disciplines rather than ad hoc judgment. State that the no-writes rule extends to any subagents the reviewer spawns: a finder subagent will happily edit the shared checkout mid-review unless told otherwise, and the reviewer must verify the tree is pristine before delivering a verdict. To pre-load instead, type the skill commands into the pane with `tmux send-keys` (runtime prefix applies: `/` on Claude, `$` on Codex), verify each submitted via capture-pane, and immediately follow with a one-line "parking for later" note (the skills are priming for an upcoming brief; do not review anything now) so the invocation does not trigger an ad hoc pass on whatever sits in the working tree. The parking note MUST carry its own expiry: "when the review brief arrives over the bus, proceed immediately without asking for further confirmation." Without it, a cautious reviewer treats the brief as ambiguous against the standing hold and stalls on a should-I-proceed menu nobody is watching. Verify EVERY send-keys line submitted, the parking note included, not just the skill commands: any line can be left sitting unsubmitted in the input box, and a busy pane eats Enters; if the capture shows text still at the prompt, send a bare `Enter` and re-check.
6. Reviewers reply to the orchestrator only: `review: clean <evidence>` or `review: issue <severity> <path:line> <fact>`.
7. Create follow-up work only for genuine findings. Do not change sub-parent status for review findings.
8. Synthesize a concise table: area, reviewer, verdict, evidence, follow-up.
9. Recycle or compact before the next phase.

## Mode 4: Brainstorm

Use when exploring a problem space and collecting diverse perspectives before deciding.

Flow:

1. Send the same problem statement in parallel, with each agent's task tailored to its expertise.
2. Tell agents not to coordinate with peers.
3. Each agent writes to `~/.mdx/projects/{project}-{agent-role}--brainstorm.md`.
4. Each agent sends one `done:` line to the orchestrator.
5. Read the files, compare independent convergence, identify contradictions, and present the synthesis.
6. Transition to Spec Writing, direct execution, or Peer Consensus.
7. Recycle or compact before the next phase.

## Mode 5: Slice Build Loop

Use when an approved spec must land as small, PR-sized slices.

Default composition: one engineer pane on the stronger build model and one reviewer pane on the adversarial reader. Escalate the reviewer to Peer Consensus only for high-blast-radius slices: durability, identity, rekeying, deletion, migration, or commit seams.

Review weight scales with blast radius, even inside a running warroom. A small mechanical PR (handful of files, clear gate, no contract change) gets the orchestrator's own diff read plus the gate, not a queued adversarial pass; the reviewer pane existing is not a reason to use it. Reserve the full loop for slices that change contracts, persistence, identity, deletion, or cross-surface seams. The same applies to spec reviews: one architect pass plus one correction round, then orchestrator spot-checks; never a third full round over citation mechanics.

Per slice:

1. Brief the engineer with numbered deliverables, spec section, extraction or removal map, branch expectations, tests, and done line: `done: <branch> <sha> PR#<n>` or `blocked: <one sentence>`.
2. On `done:`, verify the PR yourself with `gh pr view N`; never trust the bus line alone.
3. Brief the reviewer for one adversarial pass against the PR. Prime the reviewer with `/code-review` and `/code-hygiene` first, per Mode 3 step 5 (in the brief, or pre-loaded by send-keys with a "parking for later" note). Findings are Blocker, Major, or Minor with `file:line`.
4. Reviewer replies `review: clean <evidence>` or `review: issue <severity> <path:line> <fact>`.
5. Orchestrator sends the engineer one focused fix round. Every fix needs a failing-before and passing-after test where feasible.
6. Reviewer verifies deltas only.
7. Orchestrator runs `gh pr checks N`, `just ci`, or the repo gate against real services.
8. Surface only dual-clean, gate-green PRs to the human. The human holds the merge gate.
9. After the slice, recycle by default. Compact only if the same agents continue into a tightly related next slice. A merged slice IS a boundary: compact (confirm via `capture-pane`) or recycle BEFORE the next slice's brief, not after the agent has started it. Re-briefing the un-compacted pane is the most common slice-loop defect, and a healthy orchestrator token budget is never a reason to skip it (see "Compaction is context hygiene, not your budget").

Deletion slices require a forward-removal map first: delete, keep, trim, and extracted reusable core.

## Shared Practices

- Use `tmux capture-pane -t %NNN -p` to check progress without messaging agents.
- Specs and docs cite symbols, never file:line. Line numbers rot with every commit; a file path plus symbol name (`run_routes.py _http_error_from_manager`) survives and is greppable. Brief spec writers to express traceability as field -> file+symbol, and brief reviewers to flag line anchors as findings. Bus review verdicts still use `path:line` for code findings; those are read once against a named sha, not stored.
- Pin the baseline for citation checks. A spec or doc review that verifies code references must name the ref it verifies against (`git show main:path`, never the bare working tree): the shared checkout often sits on an open PR branch, and reviewing against the wrong ref produces confidently false findings that contaminate the correction round. The orchestrator should also return the shared checkout to the baseline branch after gating a PR, before dispatching any unrelated review.
- Read artifact files after completion. The bus is not the artifact.
- Store durable outcomes with `cx_store` or `cx_deposit` when a decision, lesson, consensus result, or reusable pattern emerges.
- Use `warroom_kill` plus fresh spawn when context is heavy, agents drift, panes get noisy, or the next phase changes role composition.
- Use `/compact` only for continuing panes that need local continuity.

## Anti Patterns

| Do NOT | Instead |
|--------|---------|
| Use background subagents for warroom work | Spawn tmux agents that can receive bus nudges and iterate. |
| Wire `reply_to` between agents by default | Route all replies to the orchestrator and synthesize there. |
| Run peer debate on the bus | Collect independent verdicts, then send one focused correction or final sign-off request. |
| Send long prose, diffs, logs, or essays over the bus | Send one sentence with IDs, paths, SHAs, tests, and `file:line` evidence. |
| Reply to FYI or no-reply messages | Do not reply unless the message asks for one or blocks progress. |
| Start the next phase in stale panes | Recycle or send `/compact` to every continuing pane first. |
| Reuse a just-finished slice's pane for the next slice because your context budget looks fine | Compaction is the agent pane's hygiene, not your token budget; `/compact` (confirm via capture-pane) or recycle before the next brief, regardless of capacity. |
| Phase every tiny task | Combine mechanical siblings with shared context and gate. |
| Run mega-phases that saturate context | Split by artifact, module, repo, decision boundary, or review loop. |
| Trust a `done`, `green`, `clean`, or `merged` bus line | Verify from disk, `gh`, git, Linear, logs, or tests. |
| Reuse agent IDs after add or remove | Run `warroom_status` and use the fresh IDs. |
| Ask reviewers to write files by default | Use bus verdicts unless findings need a file and you will read it. |
| Ship fix rounds without tests | Pair fixes with failing-before and passing-after evidence where feasible. |
| Use same-runtime same-role agreement as strong signal | Prefer mixed runtime MoE or cross-role diversity. |
| Let agents apply authoritative artifact changes during consensus | Agents propose; orchestrator applies and verifies. |
