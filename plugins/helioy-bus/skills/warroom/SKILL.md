---
name: warroom
description: >
  Orchestrate a multi-agent warroom for collaborative work via helioy-bus. You are the orchestrator;
  agents do the building. Patterns: peer-consensus (most valuable — mixture of experts pairing one
  Claude pane and one Codex pane to cross-check an artifact with explicit sign-off), brainstorm,
  spec-writing, code-review, engineering. Match pattern to task.
  Use when the user says "warroom", "mixture of experts", "MoE review", "claude and codex review this",
  "get them to sign off", "reach consensus", "peer review this", "spec this out", "brainstorm this",
  "review the code", or otherwise dispatches parallel work to tmux agents.
---

# Warroom: Multi-Agent Collaboration via helioy-bus

## What This Is

A warroom is a set of specialist agents running in tmux panes, connected via helioy-bus, collaborating on a shared goal. You are the orchestrator: brief, phase, monitor, synthesize, decide, course-correct. All implementation work goes to the agents — your context is the most expensive resource in the system, so spend it on driving them, not on building.

## Common Patterns

| Pattern | When | Flow |
|---------|------|------|
| **Peer Consensus** ⭐ | Cross-checking a substantial artifact you drafted (Linear plan, spec, design, code) | Two panes audit independently, debate peer-to-peer, both sign off with an exact phrase. Best as a **mixture of experts**: same agent on Claude and Codex so two different models cross-check the same artifact. Orchestrator on CC only; orchestrator applies any agreed changes. |
| **Brainstorm** | Exploring a problem space | Parallel: same brief to all → collect → synthesize convergence |
| **Spec-writing** | Planning before implementation | Phased: write → review → iterate → approve |
| **Engineering** | Building features or assets | Phased or parallel: dispatch → monitor → collect → review |
| **Code-review** | Verifying implementation | Parallel: dispatch all → collect findings → synthesize |

Peer Consensus is the most valuable pattern: cheapest defensible quality bar (two adversarial readers, fixed sign-off phrase, two rounds typical) and catches what a solo drafter misses precisely when confidence is high. Mix patterns as needed — a project might start with brainstorm, transition to spec-writing, dispatch engineering, run code-review, and end with a peer-consensus sign-off.

## Setting up a warroom

Use the `helioy-warroom` MCP tools.

```
warroom_discover(query="security review")     # find available agents
warroom_discover(namespace="helioy-tools")

warroom_spawn(name="design", agents=["brand-guardian", "ui-designer"])

# MoE: same agent prompt, one pane per runtime
warroom_spawn(name="moe", agents=["helioy-tools:codebase-analyst"])
warroom_add(name="moe", agent="helioy-tools:codebase-analyst", runtime="codex")

warroom_status(name="design")
warroom_kill(name="design")
```

Notes:

- Qualified names (`<namespace>:<agent>`) select the namespace's prompt; the `runtime` argument controls which adapter loads it. `helioy-tools:codebase-analyst` runs cleanly on either runtime, which is what makes MoE work end-to-end.
- Named warrooms are idempotent: spawning with the same name kills the old warroom first.
- After spawning, `warroom_status(name=…)` confirms agent registration and pane liveness. Agent IDs follow `{repo}:{agent-type}:{session}:{window}.{pane}`.
- If MCP tools are unavailable, fall back to `~/.helioy/warroom.sh <name> "type1 type2 …"`.

## Mode 1: Peer Consensus ⭐

Use after drafting a substantial artifact (Linear plan, spec, design doc, non-trivial PR) and you want it cross-checked before treating it as final. Especially valuable when your own drafting confidence is high — that is exactly the state where subtle defects ship.

### Mixture of experts: the default composition

Run **the same agent prompt on Claude and on Codex**. Two different models, trained on overlapping but distinct data, with different code-style priors and different blind spots, audit the same artifact. This is the load-bearing reason peer consensus catches defects that same-model review misses:

- Each model's training cutoff is different. Patterns canonical to one may be deprecated to the other.
- Each model has its own confident-failure modes. Two same-model panes can reinforce the same error; two different models almost never do.
- Same prompt + different model controls the variable: any disagreement is signal about the artifact, not noise from differing personas.

Default composition (after the helioy-bus runtime patch):

```
warroom_spawn(name="moe-{topic}", agents=["helioy-tools:codebase-analyst"])
warroom_add(name="moe-{topic}", agent="helioy-tools:codebase-analyst", runtime="codex")
```

### Variants (in order of preference)

1. **Mixture of experts (default)** — same `helioy-tools:*` agent on both adapters as shown above.
2. **Cross-role same-runtime** — two Claude panes with deliberately different agent types (e.g. `code-reviewer` + `silent-failure-hunter`). Recoups some diversity through role specialization when only one runtime is available.
3. **Two same-runtime same-role panes** — cheapest, lowest diversity. Same-model agreement is weak signal; use only as a last resort.
4. **Three-pane variant** — adds a third pane to break ties or triangulate when stakes are high. Sign-off protocol scales without change.

### Step 1: Route replies peer-to-peer

For each pane, send a brief with `reply_to` set to **the other pane's agent_id**, not the orchestrator. That is what makes them debate each other instead of pulling you into the middle.

```
send_message(to=A, reply_to=B, topic="{project}-signoff", content=brief)
send_message(to=B, reply_to=A, topic="{project}-signoff", content=brief)
```

Each brief tells the agent: *"Talk directly to your peer. CC me on every message but route the debate to them. I will not relay."*

### Step 2: The brief

Every brief must contain:

1. **Peer agent_id** — address of the other pane.
2. **Artifact under review** — explicit Linear IDs, file paths, PR numbers. Agents fetch via MCP, never trust the brief alone.
3. **Audit checklist** — concrete rules the artifact must satisfy. Cite the relevant skill (e.g. `helioy-tools:linear-workflows`).
4. **Adversarial discipline** — *"Find at least one substantive issue or positively justify 'none found.' Don't perform agreement."*
5. **Sign-off phrases** — the exact strings:
   - **"I sign off on X as currently filed"** — clean.
   - **"I sign off conditional on the following changes:"** + numbered list — orchestrator applies the changes.
6. **Iteration bound** — *"Escalate to me after 2 rounds if you cannot converge."*
7. **Write boundary** — *"Propose to your peer, reach agreement, then I apply. Do not write yourself."*

### Step 3: Monitor the debate

You receive CC'd messages on every exchange. **Do not relay between them.** Intervene only if they stall, irreconcilably disagree, or the user asks for status.

Typical flow:

```
A → critique to B (cc orchestrator)
B → response to A (cc orchestrator)
A → revised position (cc orchestrator)
B → final position (cc orchestrator)
A → "I sign off conditional on the following changes: …"
B → "I sign off conditional on the following changes: …"
```

Convergence = both panes send a clean `"I sign off …"` on the **same shape** (either both as-currently-filed, or both on the same change set after edits).

### Step 4: Apply changes, ask for clean sign-off

If both signed off conditional on a change set, you apply the changes — never delegate the writes. Then nudge both:

```
"All N consensus changes are applied. Please re-read the artifact via MCP
(do not work from memory) and either send your clean 'I sign off on X as
currently filed' message, or escalate any remaining concerns. This is the
final sign-off, not a peer-debate round."
```

Both panes re-fetch live state, verify the edits landed, and emit clean sign-off.

### Step 5: Persist the consensus

Store the result via `cx_store` or `cx_deposit` so the decision survives session boundaries. Include what was reviewed (stable IDs), the change set consensus produced, and the lesson (if any) the exchange surfaced — that lesson is often the highest-value artifact.

### When NOT to use Peer Consensus

- Pure information-gathering tasks — use Brainstorm; you want divergence, not convergence.
- Trivial artifacts with low blast radius and existing high confidence.
- When you don't have two capable agents available.

### Lesson from practice

Peer review after a confident solo draft is where the orchestrator's own discipline leaks. Common defects two adversarial readers catch in one round:

- Implementation-prescriptive language in worker bodies that should be behavioural signposts.
- Acceptance criteria that contradict project verification contracts (e.g. a "fails on main" test breaking `just test`).
- Hand-named constructor/symbol references that should be left to the worker.
- Cross-spec gaps where one worker assumes a capability another doesn't deliver.
- Catch-22s between worker acceptance criteria and repo gate constraints.

High drafting confidence is precisely when a peer-consensus pass earns its keep.

## Mode 2: Spec-Writing

Use when planning non-trivial implementation work before creating Linear issues.

### Step 1: Group and phase

Break the work into natural spec groupings (each becomes one document and maps 1:1 to a future Linear sub-parent). Group dependent specs into later phases. Within a phase, independent specs run in parallel — one engineer per spec.

### Step 2: Dispatch a phase

Send to each engineer (one per spec, parallel) and one architect simultaneously. Every dispatch must specify:

- **Output path** for the spec doc (`~/.mdx/projects/{project}-spec-{grouping}.md`).
- **Required inputs** the agent must read first (research docs, approved prior-phase specs).
- **Decisions already made** so the engineer does not re-debate them.
- **What the spec must contain** as a precise numbered list (be specific: *"exact SQL DDL for all tables"*, not *"describe the schema"*).
- **Reply discipline**: engineer notifies orchestrator + architect when written; architect reviews directly, sends fixes to engineer with orchestrator CC'd, iterates with engineer until consensus; architect notifies orchestrator on phase completion.

The architect's brief lists the engineer agent_ids, the expected output paths, the review criteria (precision, completeness, ecosystem alignment, internal and cross-spec consistency), and the same reply-and-CC discipline.

### Step 3: Monitor the review loop

Engineers and architect iterate directly. You receive CC'd messages. Do not relay. Intervene only on stalls, disputes, or status requests.

### Step 4: Advance phases until complete, then file Linear

When all phases are approved:

1. Each spec maps 1:1 to a Linear sub-parent.
2. Derive small, precise sub-issues from each spec.
3. Follow `helioy-tools:linear-workflows` for issue creation.
4. Reference the spec doc in each sub-parent description.
5. Consider a **Peer Consensus** pass on the filed tree before treating it as final.

## Mode 3: Code-Review

Use when implementation exists and needs verification against specs. Reviewers run in parallel.

### Step 1: Baseline

Run `cargo check` / `cargo test` (or equivalent) first. Report baseline to the user. Reviewers should not waste time on code that doesn't compile.

### Step 2: Confirm focus with the user

Before dispatching, confirm review depth:

| Level | Flag | Skip |
|-------|------|------|
| **Functionality** | Missing features, incorrect implementation, bugs | Style, naming, formatting, docs |
| **Full** | Everything above + style, patterns, documentation | — |
| **Security** | Vulnerabilities, input validation, auth gaps | Non-security concerns |

### Step 3: Dispatch (1:1 reviewer per issue)

Every dispatch must specify: SPEC path, CODE path, LINEAR issue, SCOPE (what to examine), FOCUS (from the level above), explicit *do-not-flag* list, KEY THINGS TO CHECK (numbered, derived from the spec), ACTIONS (what to do with findings — e.g. create sub-issues under the parent, append to description), and the reply instruction (`reply to orchestrator on helioy-bus when done`).

### Step 4: Collect and synthesize

Build a consolidated table — issue, reviewer, verdict (clean / issues found), short summary — and present to the user. Highlight clean issues, issues with genuine problems (with new sub-issue links if created), and any cross-cutting concerns multiple reviewers flagged.

## Mode 4: Brainstorm

Use when exploring a problem space and gathering diverse perspectives before committing.

### Flow

Same brief, parallel dispatch. Each agent writes to a dedicated file: `~/.mdx/projects/{project}-{agent-role}--brainstorm.md`. Each replies to the orchestrator with a one-line completion. **Tell them not to coordinate with peers** — independent reads give convergence signal when you compare.

The brief is identical across agents except for the *"Your task"* section, which is tailored to each agent's expertise.

### After collection

Track convergence: themes that emerge independently across agents (strongest signal), unique ideas from individual perspectives, contradictions that need resolution. Present a convergence summary to the user before transitioning. Then switch to spec-writing (Mode 2) or direct execution. When you file the resulting artifact, consider a **Peer Consensus** pass before treating it as final.

## Shared Conventions

These apply across all modes.

- **`whoami` first.** Call it on session start to get your registered agent_id. Use that value when telling agents how to reply to you.
- **Topics.** `{project}-signoff` (peer-consensus), `{project}-spec` (spec-writing), `{project}-review` (code-review), `{project}-brainstorm` (brainstorm).
- **CC pattern.** Any time agents talk directly to each other (peer-consensus, spec-writing), they CC the orchestrator on every message so you can observe without relaying.
- **Reply-to pattern.**
  - **Peer-consensus** — `reply_to` is the *other* pane's agent_id; orchestrator on CC only.
  - **Spec-writing** — `reply_to` is the counterpart (engineer ↔ architect).
  - **Code-review / Brainstorm** — `reply_to` defaults to the orchestrator.
- **Terse replies.** Every brief must include: *"Reply with a single line confirming completion. Do not summarize your work unless asked."* Agents write deliverables to files; bus replies should be cheap to process.
- **Read files, capture panes.** After completion, `Read` the output file. While work is in flight, `tmux capture-pane -t {tmux_target} -p` lets you check progress without messaging the agent — saves both their context and yours, and detects rabbit holes.
- **Fresh reads between rounds.** Re-fetch live state (Linear MCP, file Read, `git log`) before each iteration. Memory-only reads are how false consensus happens.

## Anti-Patterns

| Do NOT | Instead |
|--------|---------|
| Use background subagents | They cannot receive bus messages or iterate. |
| Relay messages between agents | Wire `reply_to` peer-to-peer (peer-consensus, spec-writing) by design. |
| Skip peer review on a confident solo draft | High confidence is exactly when prescription and catch-22s leak. Run Mode 1 before treating the draft as final. |
| Let agents apply Linear / file writes during peer-consensus | They propose, you apply. Keeps the artifact under one authoritative writer. |
| Use free-form sign-off language | The exact phrases `"I sign off on X as currently filed"` / `"I sign off conditional on the following changes:"` are the parseable consensus signal. |
| Bundle dependent specs into one phase | Phase them so each builds on approved specs. |
| Write vague spec requirements (*"describe the approach"*) | Be precise (*"exact SQL DDL for all tables"*). |
| Dispatch code reviewers without confirming focus level | Ask the user what severity to review at first. |
| Change sub-parent issue status for review findings | Create new child work issues under the sub-parent. |
| Work from memory across rounds | Always re-fetch live state. |
