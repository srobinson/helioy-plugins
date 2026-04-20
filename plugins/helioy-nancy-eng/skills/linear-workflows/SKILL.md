---
name: linear-workflows
description: >
  Use when planning, reviewing, or routing Linear work for Nancy or other
  autonomous agents. Applies to issue hierarchy, planning gates, agent issue
  review, execution readiness, and Linear as the source of truth for autonomous
  work.
---

# Linear Workflows

This skill routes Linear work into the correct workflow before creating or updating issues.

## Core Directive

Linear is the durable planning substrate. HANDOVER.md and other local files are coordination state only.

Before starting autonomous execution, the active Linear parent must make the current gate unambiguous:

- What work is authorized.
- What work is explicitly blocked.
- Which issues are executable.
- Which order or dependency constraints apply.
- What evidence proves the gate is ready.

## Required Preflight

At session start for Linear planning:

1. Infer the project from the working directory.
2. Fetch the Linear project by project name.
3. Fetch recent project issues.
4. Read the relevant workflow file before creating or updating issues.

## Workflow Routing

- Use [Nancy Two Agent Planning Gate](workflows/nancy-two-agent-planning-gate.md) when Linear must be populated or reviewed before implementation, especially when audit, scope discovery, or pre execution blockers may exist.
- Use [Agent Issue Review Workflow](workflows/agent-issue-review-workflow.md) when issues already exist and need readiness review before Nancy or another worker starts.
- Use [Post Execution Review Workflow](workflows/post-execution-review-workflow.md) after worker issues have been implemented and need autonomous review, consensus, and corrective issue creation.

## Universal Issue Rules

Every worker issue should:

- Be completable by one autonomous agent in one session.
- Reference stable files, modules, commands, or symbols, not line numbers.
- State acceptance criteria and verification.
- Avoid speculative cleanup.
- Avoid combining unrelated work.
- Name dependencies when order matters.

Planning issues do not authorize product code changes unless the active workflow and parent issue explicitly say so.
