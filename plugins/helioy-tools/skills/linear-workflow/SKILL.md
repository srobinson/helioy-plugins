---
name: linear-workflow
description: "Enforces parent/sub-issue structure for all Linear work planning. INVOKE THIS SKILL whenever you are about to create Linear issues, plan features, break down tasks, scope work for Nancy, or organize any unit of work that will be executed autonomously. This skill fires BEFORE the first save_issue call. If you find yourself reaching for save_issue without having invoked this skill first, stop and invoke it. Also use when the user says 'create an issue', 'plan this', 'break this down', 'send this to Nancy', or discusses any feature/bug that needs tracking."
---

# Linear Workflow

## Why This Exists

Nancy executes sub-issues sequentially from a parent. A standalone issue with no parent and no subs is invisible to the orchestrator. Every time you create a singular issue, you waste the user's time because they have to come back and restructure it. The parent/sub pattern is load-bearing infrastructure, not optional organization.

## Step 1: Identify the Level

Before creating anything, determine the scope of work. Ask if unclear.

| Level | Structure | When to use | Example |
|-------|-----------|-------------|---------|
| **Single** | 1 issue, no parent | Typos, dependency bumps, single-line fixes. **HotFix label required.** | Fix broken import path |
| **1-level** | Parent → subs | One feature, one specialist or small team. 3-30 subs. | Add user profile export |
| **2-level** | Master → role parents → subs | Multi-feature project requiring multiple specialist roles. 30-100+ subs. | Build navigation app MVP |

The rest of this document covers all three levels. Read the section that matches.

---

## Step 2: Spec-Driven Decomposition (recommended for 1-level and 2-level)

Before creating issues, spawn specialist agents to write detailed specs. Specs drive issue creation, not the other way around. This produces more precise worker issues and reduces errors during autonomous execution.

### The Flow

```
Research/Architect agents write specs
        ↓
Specs persisted to ~/.mdx/projects/
        ↓
Sub-parents created with 1:1 spec mapping
        ↓
Small, precise sub-issues derived from each spec
        ↓
Nancy executes sub-issues
        ↓
Code review agent validates against the spec
```

### Writing Specs

Spawn specialist agents (architect, researcher, domain expert) to produce spec documents. Each spec covers one natural grouping of work.

**Spec location**: `~/.mdx/projects/{project-name}-spec-{natural-grouping}.md`

Examples:
- `~/.mdx/projects/context-matters-spec-schema-and-storage.md`
- `~/.mdx/projects/context-matters-spec-mcp-tools.md`
- `~/.mdx/projects/context-matters-spec-plugin-integration.md`

Specs should contain:
- Precise technical decisions (not options, decisions)
- File paths, function signatures, type definitions
- Dependencies and ordering constraints
- Acceptance criteria that sub-issues inherit

### Mapping Specs to Issues

Each sub-parent (1-level) or role parent (2-level) maps 1:1 to a spec document. The spec is the source of truth for what the worker builds.

**Sub-parent description** references its spec:
```markdown
## Spec
`~/.mdx/projects/{project}-spec-{grouping}.md`
```

**Sub-issues** are derived from the spec. Each sub-issue targets one concrete change described in the spec. The spec provides the context; the issue provides the task boundary.

### Code Review Against Specs

When a sub-parent's issues are complete, spawn a code review agent that references the spec:

```
helioy-tools:clinical-reviewer or pr-review-toolkit:code-reviewer
  → reads the spec doc
  → reviews the implemented code
  → validates implementation matches spec intent
  → flags deviations or gaps
```

This closes the loop: spec defines intent, code implements it, review validates alignment.

### Spec-Driven Checklist

- [ ] Natural groupings identified
- [ ] Specialist agents spawned to write specs
- [ ] Specs persisted to `~/.mdx/projects/{project}-spec-{grouping}.md`
- [ ] Each sub-parent links 1:1 to a spec doc
- [ ] Sub-issues derived from specs (small, precise, one concern each)
- [ ] Code review planned against spec docs after completion

---

## Single (HotFix)

One issue. No parent. Apply the **HotFix** label. This is the sole exception to the parent rule.

---

## 1-Level: Parent → Subs

The standard pattern. One parent defines WHAT + WHY. Subs define HOW.

**Parent Issue** = the WHAT + WHY + acceptance criteria
- Optimized for agent consumption, not human reading
- Lean is mean. Anti-verbosity.
- This content gets fed into every worker agent as context

**Sub-Issues** = the HOW, each a discrete completable unit
- **Err on the side of more issues, not fewer.** A worker agent reasons better about one clear objective than a multi-step task bundled into one issue. When in doubt, split.
- One issue = one concrete change to one area of the codebase. If the description contains "and" describing two distinct actions, that is two issues.
- ~30 minutes to 2 hours of focused implementation. If it feels bigger, split it.
- Can be completed independently when possible
- Nancy executes these in manual sort order

### Creating Issues

All issues go to team **Alphabio** unless specified otherwise.

**Parent:**
- **title**: Feature/outcome in imperative form
- **team**: "Alphabio"
- **description**: WHAT (1-2 sentences) + WHY (business/technical value) + acceptance criteria (bullet list, testable). NO implementation details.
- **project**: Required. Match `basename $(pwd)` if applicable, otherwise ask.
- **priority**: Match urgency (1=Urgent, 2=High, 3=Normal, 4=Low)
- **state**: "Todo" when ready for work
- **assignee**: "me"

**Subs:**
- **title**: Specific implementation step
- **parentId**: Parent issue ID (from the save_issue response)
- **description**: HOW to implement + dependencies on other subs + specific files/modules affected
- **priority**: Inherit from parent unless different
- **assignee**: "me"

### Checklist

- [ ] Parent issue exists
- [ ] Project is set
- [ ] 3+ subs planned (more is better — no upper limit on sub count)
- [ ] Each sub targets exactly one change or concern
- [ ] No sub description contains "and" joining two distinct implementation actions
- [ ] Each sub is independently completable
- [ ] Assignee is set on all issues

---

## 2-Level: Master → Role Parents → Subs

Use when a project has multiple feature areas AND multiple specialist roles. The structure enables Nancy to dispatch entire workstreams to the correct specialist agent.

### Structure

```
Master Issue (the project/epic)
├── Feature A [role-tag]          ← role parent
│   ├── Sub-issue 1
│   └── Sub-issue 2
├── Feature A [different-role]    ← another role parent, same feature
│   └── Sub-issue 3
├── Feature B [role-tag]
│   └── ...
```

**Master Issue** = project-level container. All role parents are children of this.

**Role Parents** = feature area + specialist role. Title format: `Feature Name [role-tag]`.
- Each role parent gets a **label** matching its role tag
- Available role tags: `frontend-engineer`, `backend-engineer`, `mobile-engineer`, `ux-designer`, `ux-researcher`
- One role parent per feature-role combination
- Nancy dispatches these as workstreams to the matching specialist agent

**Subs** = implementation tasks under role parents. Same rules as 1-level subs. Granular decomposition is correct — a worker agent reasons better about one focused task than a bundled multi-step issue.

### How to Decompose

1. **List the feature areas** (e.g., Project Foundation, User Auth, Admin Panel)
2. **For each feature, identify which roles have work** (e.g., Foundation needs frontend + backend)
3. **Create role parents** = feature × role. Title: `Feature Name [role-tag]`
4. **Move/create subs under the matching role parent**
5. **Set sort order** on role parents to reflect execution sequence
6. **Add blocking relations** between role parents to encode the dependency graph
7. **Wire documentation handoffs** between research/design producers and implementation consumers

### Sort Order

Linear's `sortOrder` field controls manual sort order but is not exposed via the MCP tool. Update it via GraphQL:

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"mutation { issueUpdate(id: \"<UUID>\", input: { sortOrder: <INT> }) { success } }"}'
```

Lower values appear first. Set sort order to reflect dependency-safe execution sequence.

### Blocking Relations

Encode the dependency graph so blocked work cannot start prematurely:

```bash
# "blocker_id blocks blocked_id"
curl -s -X POST https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"mutation { issueRelationCreate(input: { issueId: \"<blocker_uuid>\", relatedIssueId: \"<blocked_uuid>\", type: blocks }) { success } }"}'
```

Common dependency patterns:
- Foundation blocks all downstream feature work
- Research/UX blocks implementation in the same feature
- Backend schema blocks frontend that consumes it
- Route capture blocks navigation (need routes to navigate)

### Documentation Handoffs

When a research or design issue produces a document that implementation issues consume, make the contract explicit in issue descriptions.

**Producer issues** get an `## Output` section:
```markdown
## Output
Persist findings to `~/.mdx/research/<descriptive-name>.md`.
This document is consumed by ALP-XXX (description) and ALP-YYY (description).
```

**Consumer issues** get an `## Input` section:
```markdown
## Input
Read specs from `~/.mdx/research/<descriptive-name>.md` (output of ALP-ZZZ).
```

Pin the filename in the producer. Reference it in every consumer. No agent should have to guess where upstream artifacts live.

Roles that typically produce documents:
- `architect/researcher agents` → `~/.mdx/projects/` (spec documents, see Step 2)
- `ux-researcher` → `~/.mdx/research/` (findings, study results, comparison matrices)
- `ux-designer` → `~/.mdx/design/` (UI specs, interaction specs, wireframes)

### Agent Review Step

After creating all issues, spawn specialist subagents to review their assigned issues before execution begins. Each agent reads the issue details plus relevant research docs and evaluates:

1. Is the description clear enough to execute?
2. Are acceptance criteria specific and testable?
3. Are edge cases and platform differences covered?
4. Are dependencies and documentation handoffs complete?
5. Should any issue be split or merged?

Spawn one agent per role tag, all in parallel:
```
helioy-tools:ux-designer      → reviews ux-designer issues
helioy-tools:ux-researcher    → reviews ux-researcher issues
helioy-tools:mobile-engineer  → reviews mobile-engineer issues
helioy-tools:frontend-engineer → reviews frontend-engineer issues
helioy-tools:backend-engineer  → reviews backend-engineer issues
```

Agents return structured feedback. Apply updates after human review.

### 2-Level Checklist

- [ ] Master issue exists
- [ ] Feature areas identified
- [ ] Role tags assigned to every sub-issue
- [ ] Role parents created (feature × role)
- [ ] All subs re-parented under role parents
- [ ] Sort order set on role parents
- [ ] Blocking relations encode dependency graph
- [ ] Documentation handoffs wired (Input/Output sections)
- [ ] Specialist agents spawned for review
- [ ] Review feedback applied

---

## Querying and Updating

- `mcp__plugin_helioy-tools_linear-server__list_issues` — find existing issues (filter by project, assignee, state, label)
- `mcp__plugin_helioy-tools_linear-server__get_issue` — get full issue detail including attachments and branch name
- `mcp__plugin_helioy-tools_linear-server__save_issue` with `id` — update state, assignee, priority, description, or link issues
- `mcp__plugin_helioy-tools_linear-server__list_projects` / `mcp__plugin_helioy-tools_linear-server__get_project` — find/verify project
- `mcp__plugin_helioy-tools_linear-server__list_issue_statuses` — discover available states for a team
- `mcp__plugin_helioy-tools_linear-server__list_issue_labels` — discover available labels
- `mcp__plugin_helioy-tools_linear-server__list_comments` / `mcp__plugin_helioy-tools_linear-server__save_comment` — read/add comments
