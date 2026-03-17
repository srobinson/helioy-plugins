---
name: warroom
description: >
  Orchestrate a multi-agent warroom for collaborative work via helioy-bus. You are the orchestrator.
  You drive agents. You do not build things yourself. Your context is the most expensive resource
  in the system: use it for briefing, phasing, monitoring, synthesizing, deciding, and course-correcting.
  Common patterns include brainstorm, spec-writing, code-review, and engineering, but the warroom
  supports any workflow. Match the pattern to the task.
  Use when the user says "warroom", "spin up a warroom", "spec this out", "let's plan with agents",
  "use the warroom to review", "review the code", "brainstorm this", "build this", or when dispatching
  parallel work to tmux agents.
---

# Warroom: Multi-Agent Collaboration via helioy-bus

## What This Is

A warroom is a set of specialist agents running in tmux panes, connected via helioy-bus, collaborating on a shared goal. You are the orchestrator. You drive agents. You do not build things yourself.

Your context window is the most expensive resource in the system. Use it for: briefing, phasing, monitoring, synthesizing, deciding, and course-correcting. All implementation work goes to agents.

## Common Patterns

The warroom supports any workflow. These are proven patterns, not an exhaustive list:

| Pattern | When | Flow |
|---------|------|------|
| **Brainstorm** | Exploring a problem space | Parallel: same brief to all → collect → synthesize convergence |
| **Spec-writing** | Planning before implementation | Phased: write → review → iterate → approve |
| **Engineering** | Building features or assets | Phased or parallel: dispatch tasks → monitor → collect → review |
| **Code-review** | Verifying implementation | Parallel: dispatch all → collect findings → synthesize |

Mix patterns as needed. A project might start with a brainstorm, transition to spec-writing, then dispatch engineering work, and finish with a code review. The orchestrator decides the flow based on the task.

## Prerequisites

A warroom requires specialist agents running in tmux panes, registered on the helioy-bus.

### Setting up a warroom

Use the `helioy-warroom` MCP tools to manage warrooms programmatically:

**Discover available agents:**
```
warroom_discover(query="security review")
warroom_discover(namespace="helioy-tools")
```

**Spawn a warroom:**
```
warroom_spawn(name="design", agents=["brand-guardian", "ui-designer", "visual-storyteller"])
warroom_spawn(name="review", agents=["code-reviewer", "silent-failure-hunter"])
```

**Manage agents in a running warroom:**
```
warroom_add(name="design", agent="ux-researcher")
warroom_remove(name="design", agent="brand-guardian")
```

**Monitor and tear down:**
```
warroom_status(name="design")
warroom_kill(name="design")
```

**Use presets for common team compositions:**
```
warroom_presets()
warroom_spawn(preset="pr-review", name="review-432")
```

Each named warroom is idempotent: spawning with the same name kills the old warroom and creates a fresh one. Multiple warrooms can run concurrently.

**Fallback (manual):** If MCP tools are unavailable, tell the user to run `~/.helioy/warroom.sh <name> "type1 type2 ..."` directly.

### Verifying the warroom

After spawning, call `warroom_status` to check agent registration and pane liveness. Or use `list_agents(tmux_filter="<window>")` on helioy-bus. Agent IDs follow the pattern `{repo}:{agent-type}:{session}:{window}.{pane}`.

## Mode 1: Spec-Writing

Use when planning non-trivial implementation work before creating Linear issues.

### Step 1: Identify spec groupings

Break the work into natural groupings. Each grouping becomes one spec document and maps 1:1 to a future Linear sub-parent. Good groupings are independent enough that different engineers can write them, but related enough that they need architect review for consistency.

### Step 2: Identify phases

Specs may depend on each other. Group into phases:

```
Phase 1 (parallel): specs with no dependencies on each other
Phase 2: specs that depend on Phase 1 decisions
Phase N: ...
```

Independent specs within a phase run in parallel (one engineer per spec). Dependent specs run in later phases after their dependencies are approved.

### Step 3: Dispatch Phase 1

Send three types of messages simultaneously:

**Task messages to engineers** (one per spec, parallel):

```
To: engineer pane agent_id
Topic: {project}-spec
Content:
  ## Task: Write spec for {grouping}
  ### Output
  Write to: ~/.mdx/projects/{project}-spec-{grouping}.md
  ### Input (read these first)
  - [list research docs and/or approved specs from prior phases]
  ### Decisions already made (do not revisit)
  - [list all architectural decisions so the engineer doesn't waste time re-debating]
  ### What the spec must contain
  - [precise numbered list of required sections]
  - [be specific: "exact SQL DDL", "exact Rust type definitions", not "describe the schema"]
  ### When done
  1. Reply to {orchestrator_agent_id} (orchestrator) confirming the spec is written
  2. Reply to {architect_agent_id} (architect-reviewer) asking them to review it
  The architect may send you feedback. Apply fixes and notify them until you reach consensus.
```

**Briefing message to architect**:

```
To: architect pane agent_id
Topic: {project}-spec
Content:
  ## Phase N: {description}
  {engineer_agent_id_1} is writing ~/.mdx/projects/{project}-spec-{grouping1}.md
  {engineer_agent_id_2} is writing ~/.mdx/projects/{project}-spec-{grouping2}.md
  They will notify you when ready.
  ### Your job
  1. Wait for engineers to notify you
  2. Read the spec
  3. Review for: precision, completeness, ecosystem alignment, internal consistency, cross-spec consistency
  4. Send fixes DIRECTLY to the engineer. CC {orchestrator_agent_id} on all messages.
  5. Iterate until consensus.
  6. When ALL specs in this phase are approved, notify {orchestrator_agent_id}.
  ### Research context
  - [list research docs so architect has full background]
```

### Step 4: Monitor the review loop

The architect and engineers iterate directly. You receive CC'd messages. Do NOT relay messages between them. Only intervene if:
- An agent appears stuck (no messages for an extended period)
- There is a disagreement you need to resolve
- The user asks for a status update

```
Engineer writes spec → notifies architect + orchestrator
Architect reviews → sends fixes to engineer (cc orchestrator)
Engineer applies fixes → notifies architect (cc orchestrator)
... repeat until consensus ...
Architect signs off → notifies orchestrator "Phase N complete"
```

### Step 5: Advance to next phase

When the architect confirms Phase N is complete:
1. Acknowledge to the user
2. Dispatch Phase N+1 (engineers read approved Phase N specs as input)
3. Repeat Steps 3-5

### Step 6: Create Linear issues

When all phases are complete and all specs approved:
1. Each spec maps 1:1 to a Linear sub-parent
2. Derive small, precise sub-issues from each spec
3. Follow the linear-workflow skill for issue creation
4. Reference the spec doc in each sub-parent description

## Mode 2: Code Review

Use when implementation exists and needs verification against specs. All reviewers run in parallel.

### Step 1: Verify the code compiles and tests pass

Before dispatching reviewers, run `cargo check` and `cargo test` (or equivalent). Report the baseline to the user. Reviewers should not waste time on code that does not compile.

### Step 2: Map reviewers to issues

Each reviewer gets exactly one Linear issue to review. The mapping is 1:1: one agent per issue, one issue per agent.

| Agent | Issue | Spec | Code Path |
|-------|-------|------|-----------|
| agent_id_1 | ALP-XXXX | spec path | code directory |
| agent_id_2 | ALP-YYYY | spec path | code directory |

### Step 3: Dispatch all reviewers in parallel

Send one message per reviewer. Every dispatch message must contain:

1. **SPEC path** — the authoritative spec to review against
2. **CODE path** — the exact directory or files to review
3. **LINEAR issue** — the issue ID for status updates
4. **SCOPE** — what parts of the code to examine
5. **FOCUS** — what severity level to review at (always clarify with the user first)
6. **KEY THINGS TO CHECK** — numbered list of specific verification points derived from the spec
7. **ACTIONS** — what to do with findings (e.g., create sub-issues, set status, append to description)
8. **Reply instruction** — reply to the orchestrator on helioy-bus when done

Template:

```
REVIEW TASK: {issue_id} — {issue_title}

SPEC: {spec_path}
CODE: {code_path}
LINEAR ISSUE: {issue_id}

SCOPE: {what to examine}

FOCUS:
- {severity guidance from user, e.g. "missing functionality, incorrect implementation, bugs only"}

DO NOT flag: {exclusions, e.g. "style nits, naming preferences, minor formatting"}

KEY THINGS TO CHECK:
1. {specific verification point}
2. {specific verification point}
...

ACTIONS:
- If genuine issues found: {what to do — create sub-issues under the parent, set status, append findings}
- If clean: reply confirming, no Linear update needed

Reply to me on helioy-bus when done.
```

### Step 4: Collect and synthesize

As reviewers report back, build a consolidated summary:

| Issue | Reviewer | Verdict | Findings |
|-------|----------|---------|----------|
| ALP-XXXX | agent_id | Clean / Issues found | Brief summary |

When all reviewers have reported, present the synthesis to the user. Highlight:
- Which issues are clean
- Which have genuine problems (with links to new sub-issues if created)
- Any cross-cutting concerns that multiple reviewers flagged

### Important: Review focus must come from the user

Always confirm the review focus with the user before dispatching. Common levels:

| Level | What to flag | What to skip |
|-------|-------------|--------------|
| **Functionality** | Missing features, incorrect implementation, bugs | Style, naming, formatting, documentation |
| **Full** | All of the above plus style, patterns, documentation | Nothing |
| **Security** | Vulnerabilities, input validation, auth gaps | Non-security concerns |

## Mode 3: Brainstorm / Ideation

Use when exploring a problem space and gathering diverse perspectives before committing to a direction.

### Flow

```
Phase 0 (parallel): All agents get the same brief, dump ideas from their unique lens
  → Each writes to a dedicated file: ~/.mdx/projects/{project}-{agent-role}--brainstorm.md
  → Each replies to orchestrator when done
Phase 1+ (phased): Synthesize, execute, review — using spec-writing patterns
```

### Step 1: Dispatch the brief

Send the same context and task to every agent simultaneously. Each message should:
- Describe the project, goals, and constraints
- Ask the agent to brainstorm from their specific perspective
- Specify the output file path
- Request a bus reply when done

The brief is identical except for the "Your Task" section, which is tailored to each agent's expertise.

### Step 2: Collect and synthesize

As agents reply, track convergence. Note:
- Themes that emerge independently across multiple agents (strongest signal)
- Unique ideas from individual perspectives
- Contradictions that need resolution

Present a convergence summary to the user before proceeding to structured phases.

### Step 3: Transition to structured work

Once the brainstorm surfaces a direction, switch to spec-writing mode (Mode 1) or direct execution, feeding the brainstorm outputs as input to subsequent phases.

## Context Economy

Your context is precious. Protect it.

### Terse replies from agents

Every dispatch message must include: **"Reply with a single line confirming completion. Do not summarize your work unless asked."**

Agents write their output to files. You read the files when you need details. Their bus replies should be cheap to process: "Done. Written to ~/.mdx/projects/foo.md" is the ideal reply.

### Monitoring via tmux capture

You can read any agent's terminal output directly without messaging them:

```bash
tmux capture-pane -t {tmux_target} -p
```

The `tmux_target` is available from `list_agents`. Use this to:
- Check progress without asking (saves both your context and theirs)
- Detect rabbit holes (agent looping, stuck, or going off-brief)
- Get details without requesting a verbose reply

Monitor proactively when an agent is taking longer than expected.

### When to read output files vs. capture panes

- **Read the output file** when the agent has confirmed completion and you need the deliverable
- **Capture the pane** when the agent has not replied yet and you want to check status

## Anti-Patterns

| Do NOT | Instead |
|--------|---------|
| Use background subagents | They cannot receive bus messages or iterate |
| Relay messages between agents | Let them talk directly (spec-writing mode) |
| Skip the architect in spec-writing | Cross-spec inconsistencies are caught in review |
| Bundle specs with dependencies into one phase | Phase them so each builds on approved specs |
| Write vague spec requirements ("describe the approach") | Be precise ("exact SQL DDL for all tables") |
| Forget reply instructions in dispatch messages | Agents will not CC others unless explicitly told to |
| Dispatch code reviewers without confirming focus level | Ask the user what severity to review at first |
| Change sub-parent issue status for review findings | Create new child work issues under the sub-parent |

## Message Conventions

- **Your agent_id**: Call `whoami` to get your registered agent_id. Use this value in dispatch messages where agents need to reply to you (e.g. `{orchestrator_agent_id}` placeholders).
- **Topic**: set to `{project}-spec` (spec mode) or `{project}-review` (review mode)
- **CC pattern**: in spec mode, engineers and architect always CC the orchestrator
- **Reply-to**: in review mode, reviewers reply directly to the orchestrator

## Status Tracking

**Spec-writing mode:**

```
Phase 1: [complete/in progress]
  - spec-name-1: [writing/in review (round N)/approved]
  - spec-name-2: [writing/in review (round N)/approved]
Phase 2: [waiting/in progress]
  - spec-name-3: [not started/writing/in review/approved]
```

**Code-review mode:**

```
Reviews dispatched: N/N
  - ALP-XXXX (agent): [in progress/clean/issues found]
  - ALP-YYYY (agent): [in progress/clean/issues found]
  - ALP-ZZZZ (agent): [in progress/clean/issues found]
```
