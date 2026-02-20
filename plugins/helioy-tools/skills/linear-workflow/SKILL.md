---
name: linear-workflow
description: Create and manage Linear issues following Helioy ways of working. Use when creating issues, planning features, breaking down work, or organizing tasks in Linear. Enforces parent/sub-issue pattern, proper sizing, and metadata conventions.
---

# Linear Workflow — Ways of Working

## Core Pattern: Parent -> Subs

Every non-trivial feature uses the parent/sub-issue pattern:

- **Parent Issue** = the WHAT + WHY + acceptance criteria
  - Optimized for agent consumption, not human reading
  - Lean is mean. Anti-verbosity.
  - This content gets fed into every worker agent
- **Sub-Issues** = the HOW — implementation steps with detail
  - Each sub is a discrete, completable unit of work
  - ~1-4 hours of focused implementation
  - Can be completed independently when possible

## Issue Sizing

| Size | Sub-issues | Example |
|---|---|---|
| Small | 3-10 | Add user profile export |
| Medium | 10-30 | Implement auth system (group by component) |
| Large | 30-100+ | Build analytics dashboard (group by phase) |

## Rules

1. **Always assign a project.** If `basename $(pwd)` matches a project, use it. If not, ask.
2. **Set state to Todo** when the issue is ready for work.
3. **No parent issues with only 1 sub-issue** — that's unnecessary overhead.
4. **3+ subs minimum** for parent issues, or use HotFix label instead.
5. **HotFix label only** — the sole case where a parent works without subs: typos, dependency bumps, single-line fixes.

## Creating Issues

Use the Linear MCP tools to manage issues. All issues go to team **Alphabio**
unless specified otherwise.

### Parent Issue

Create with `mcp__linear-server__create_issue`:

- **title**: Feature/outcome in imperative form
- **team**: "Alphabio"
- **description**: WHAT (1-2 sentences) + WHY (business/technical value) + acceptance criteria (bullet list, testable). NO implementation details.
- **project**: Required — match `basename $(pwd)` if applicable, otherwise ask
- **priority**: Match urgency (1=Urgent, 2=High, 3=Normal, 4=Low)
- **state**: "Todo" when ready for work
- **labels**: Add "HotFix" for single-line fixes (no subs needed)

### Sub-Issues

Create with `mcp__linear-server__create_issue` with `parentId`:

- **title**: Specific implementation step
- **parentId**: Parent issue ID
- **description**: HOW to implement + dependencies on other subs + specific files/modules affected
- **priority**: Inherit from parent unless different

### Querying and Updating

- `mcp__linear-server__list_issues` — find existing issues (filter by project, assignee, state, label)
- `mcp__linear-server__get_issue` — get full issue detail including attachments and branch name
- `mcp__linear-server__update_issue` — change state, assignee, priority, description, or link issues
- `mcp__linear-server__list_projects` / `mcp__linear-server__get_project` — find/verify project
- `mcp__linear-server__list_issue_statuses` — discover available states for a team
- `mcp__linear-server__list_issue_labels` — discover available labels
- `mcp__linear-server__create_milestone` / `mcp__linear-server__list_milestones` — manage milestones
- `mcp__linear-server__list_comments` / `mcp__linear-server__create_comment` — read/add comments
