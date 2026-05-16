# Intake and Triage Workflow

Use this workflow to capture drive by issues without ceremony and to promote captured stubs into selector compatible execution graphs when you revisit them.

## Two Protocols

This workflow has two named protocols:

- **Capture.** Used during unrelated work, by any agent, to record an issue for later triage.
- **Promote.** Used when you revisit captured stubs and want to organize them for Nancy execution.

Capture is fast. Promote is deliberate.

## Capture Protocol

Use this any time an agent is asked to record a Linear issue while working on something else. The goal is to preserve the observation in a known location with minimal ceremony.

Steps:

1. Identify the Linear project for the work, e.g. `transport-matters`, `context-matters`, `nancy`.
2. Find or create the project's inbox issue:
   - Title: `Inbox: <project-slug>`.
   - Status: `Todo`. The inbox stays open indefinitely.
   - Parent: none. The inbox is a top level issue in the project.
3. File the new stub as a child of the inbox.

The stub needs:

- Clear short title.
- Brief description: what was observed, why it matters, where it was noticed.
- Status `Todo`.

Do not author acceptance criteria, do not analyze scope, and do not invent a master parent or Backlog at capture time. Stay shallow. The inbox is the durable handoff point for later triage.

If multiple related observations come up in the same session, file them as separate stubs. Grouping decisions belong in promote, not capture.

## Promote Protocol

Use this when you arrive at the repo, revisit one or more inbox stubs, and want to organize them for Nancy execution.

Steps:

1. Pick the stub or stubs that belong together as one unit of work.
2. Read each stub's title, description, and any comments. Confirm the work is real and the scope is roughly understood.
3. Decide the readiness path:
   - **Need review.** Stubs are short. Scope or acceptance criteria incomplete. Leave the gate review issue `Todo` for Nancy's planner to verify on iter 1. See [Agent Issue Review Workflow](agent-issue-review-workflow.md) for what the planner will check.
   - **Ready to execute.** You know exactly what you want. Author the accepted gate body and mark the gate review issue `Worker Done`. See [Single Agent Planning Workflow](single-agent-planning-workflow.md) for the co authoring exit checklist.
   - **Design via warroom (recommended for non-trivial triage).** Scaffold the shell only, then let a mixture-of-experts warroom design the worker breakdown, PER scope, and gate body. Orchestrator populates after consensus. See [Design-via-warroom protocol](#design-via-warroom-protocol) below.
   - **Ratify via warroom.** Orchestrator authors the full tree first, then warroom peer-consensus audits the filed tree per `helioy-bus:warroom` Mode 1 before the gate flips. Default composition is `helioy-tools:codebase-analyst` on Claude and Codex (same prompt, different model). Cheaper than Design when drafting confidence is genuinely high and the work is small; otherwise prefer Design — high drafting confidence is exactly the state where prescription and catch-22s leak past the author. When both panes emit the clean sign-off phrase, flip the gate to `Worker Done` and comment with warroom name, agent IDs, and bus topic for traceability.
4. Create a master parent in the same project. Title should describe the objective, not the stubs. Example: `Codex transport continuity`, not `Fix 3 stubs from Inbox`.
5. Create `Backlog` as a child of master, status `Todo`.
6. Create worker issues under `Backlog` based on the source stubs (and any direct observations the user provided). Stubs do NOT move during triage — they stay in their inbox. A single stub may decompose into multiple workers, several stubs may collapse into one worker, and stubs may be reframed entirely as the design clarifies. The stub is source material; the worker is what gets executed.
6a. Apply the residue check to each worker body you author. Drive-by capture leaves behind seven recurring patterns that must not propagate into worker bodies (whether the body started from stub content or from a fresh draft):
   - **Line numbers.** Replace `path/file.rs:NN-MM` with file + stable symbol (e.g. `ScopePath::validate`). Universal rule; line numbers rot the moment the file changes.
   - **Open design calls.** Resolve in the gate body and restate the resolution in the worker as binding, OR leave the worker `Todo` for a planner. Do not carry "Pick one before implementation" into the worker body — the worker reads its own issue first and will relitigate.
   - **Capture-only footers.** Strip `Capture only. Needs triage before execution.` from any text reused from a stub. The worker is triaged; the footer is factually wrong.
   - **Missing Acceptance and Verification.** Each worker body needs its own observable-behavior acceptance criteria and verification commands. The gate body alone is not enough.
   - **Stale file paths.** Verify every cited path against the live filesystem. Capture-era references rot. Cite stable symbols when possible, paths only when the file is the entity (config, build script).
   - **Prescriptive code blocks and hand-named literals.** Rewrite wire-shape TOML blocks, struct definitions, and literal error strings as capability and observable behavior. Universal rule.
   - **Planning-session narrative.** Strip "Why one master, not two", "Why this beats X", "Sequencing rationale" sections. Order is encoded by `blocks` / `blockedBy` relations and the gate's `Required order:` line; the prose duplicates relation state and adds noise. Workers, selectors, and PER agents act on capability and structure, not retrospective justification.
7. Encode blocker dependencies as Linear `blocks` and `blockedBy` relations.
8. Create the post execution review issue as a child of `Backlog` (or master, per chosen shape). Title `Post execution review: <objective>`.
9. Create the gate review issue as a direct child of master. Title `Gate review: <objective>` or `Gate review and execution readiness`. Body: proposed accepted gate text per the [Selector Compatible Shape](../SKILL.md#selector-compatible-shape) section in the skill.
10. Set the gate review issue status per the readiness decision in step 3.
11. Close out the source stubs. After the gate status is set (Worker Done for authorized paths, Todo for Need-review), mark each source stub `Done` and remove its parent (set parentId to null). The stub becomes a top-level closed issue — a historical record that the observation existed, no longer bound to the inbox. Stubs that the design reframed away from get `Canceled` with a one-line comment naming the worker that absorbed (or superseded) them. The triage output carries the work forward; the stub does not.

The inbox stays open across promotions. Only its stub statuses change at sign-off.

## Design-via-warroom protocol

When step 3 selects "Design via warroom", replace promote steps 4-10 with the following. Source issues for this path can be inbox stubs OR top-level observations the user points at directly — capture is optional when the planning session is focused.

1. **Scaffold the shell.** Create the master parent, the `Backlog` execution parent under master, and a gate-review issue as a direct child of master with a placeholder body (`pending MoE design`). No workers, no PER yet. The shell exists so the warroom panes have stable Linear IDs to anchor against.
2. **Spawn the warroom.** `helioy-bus:warroom` Mode 1, mixture of experts. Default composition: `helioy-tools:codebase-analyst` on Claude + Codex (same agent prompt, different model).
3. **Load the skill in both panes first.** Before the brief, send each pane a one-line message: `Invoke the Skill tool on helioy-tools:linear-workflows before anything else.` This is the load-bearing step — it puts both panes on the same frame (Selector Compatible Shape, Universal Issue Rules, gate body templates, residue checklist) before they see the design question. Skip this step and the panes default to whatever Linear-convention priors they hold.
4. **Send the brief.** Project context, source-issue Linear IDs (the issue you were pointed at), repo path, the design question. Reply discipline peer-to-peer (`reply_to` set to the other pane's `agent_id`); orchestrator CC only on every exchange. Topic `{master}-design`.
5. **Converge.** Panes design and exchange proposals for: worker breakdown (titles + bodies), PER body, gate `Execute:` line, design-call resolutions, and required-order. Sign-off phrases per the warroom skill: `I sign off on <breakdown> as currently proposed` or `I sign off conditional on the following changes:` followed by a numbered list. Orchestrator applies any agreed changes; agents do not write to Linear.
6. **Populate.** Orchestrator writes the converged tree to Linear in one pass — worker issues under `Backlog`, PER issue, then the gate body. Source stubs do not move; they stay in their inbox during populate. Apply the step 6a residue-stripping pass as the writes go in.
7. **Flip the gate.** Set the gate review issue to `Worker Done`. Comment with warroom traceability: warroom name, bus topic, agent IDs, per-item change provenance.
8. **Close out source stubs.** Mark each source stub `Done` and remove its parent (set parentId to null). Stubs that the design reframed away from get `Canceled` with a one-line comment naming the worker that absorbed or superseded them.
9. **Persist.** `cx_store` one `decision` at repo scope (the structural call + binding design-call resolutions). `cx_store` one `lesson` at project scope if the warroom surfaced patterns that recur across triages (e.g. new defect classes worth folding into step 6a).

The Ratify-via-warroom path uses the standard Promote Protocol (steps 4-10 author the full tree) then runs the warroom on the filed tree. Design is the preferred mode for non-trivial work; Ratify is the cheaper option only when drafting confidence is genuinely high and the work is small.

## Corrective Authority Repair

For corrective issues discovered after a gate was accepted, repair selector authority before restarting Nancy:

1. Put the corrective issue under the authorized execution parent.
2. Make the issue recognizable as corrective by adding label `Corrective` or including `Corrective` in the title.
3. Update the accepted gate issue so its `Execute:` line includes the corrective issue identifier as part of the full current authorized set.
4. Run the selector and confirm the next mode is `corrective_resolution` with the corrective issue selected.

Minimal repaired shape:

```text
master parent
├── Gate review and execution readiness     Worker Done
└── Backlog                                 Todo
    ├── first worker issue                  Todo or Worker Done
    ├── next worker issue                   Todo
    └── Post execution review               Todo
```

## Promote Sanity Check

After promote, the master parent should match the [Selector Compatible Shape](../SKILL.md#selector-compatible-shape). Run a quick check:

- Master has exactly one gate review issue and one execution parent as direct open children.
- No other direct open children. The inbox is in the project, not under master.
- Execution parent's open children are worker issues plus the post execution review issue.
- Every worker issue identifier appears in the gate review body's `Execute:` line.
- The post execution review issue identifier appears in the `Execute:` line.
- Every source stub used by the triage is either `Done` (parent removed) or `Canceled` (with a one-line comment naming the absorbing worker). No source stub remains open in the inbox after sign-off.

If any check fails, the selector will downgrade to `planning` mode or pause in `needs_human_direction`.

## Inbox Hygiene

The inbox is a holding area for unprocessed observations, not a backlog. Triage or cancel each stub within a couple of revisit sessions. If a stub has lived in the inbox without triage for longer, it has become a backlog item by neglect. Either cancel it with a one-line reason or feed it into a triage session.

Stubs do not move out of the inbox during triage — they remain in place while the orchestrator and (optionally) a warroom design the worker breakdown. At triage sign-off, stubs that informed the design close out as `Done` with parent removed; stubs reframed away get `Canceled` with a one-line note. The stub is a journal entry, not a work artifact; closing it out preserves history without keeping it bound to the inbox.

If a stub turns out to be wrong before triage, cancel it (status `Canceled`) with a one-line comment. Do not delete. Cancellation preserves history.
