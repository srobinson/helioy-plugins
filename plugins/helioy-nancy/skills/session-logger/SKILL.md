---
name: session-logger
description: Hand over session activity to another agent for future reference. Logs a summary of the session, including key findings and artifacts produced, to a markdown file and persists it to context-matters.
---

Log this session's activity. Follow these steps exactly:

## Step 1: Write the log file

Determine the directory name by running `basename $(pwd)`.

Write a session log to `~/.claude.nancy/agent-memory/session-logs/${CLAUDE_SESSION_ID}.md` with this structure:

```markdown
---
session: ${CLAUDE_SESSION_ID}
date: <today's date YYYY-MM-DD>
agent: <agent type if known, otherwise "claude-code">
directory: <dirname>
project: <working directory basename>
---

## Task
<one-line description of what the user asked for>

## Summary
<2-3 sentence summary of what was accomplished>

## Agents Spawned
<list of sub-agents launched, if any, with their purpose>

## Artifacts Produced
<list of files created or modified>

## Key Findings
<bullet points of important discoveries, decisions, or outcomes>

## Patterns Captured
<any patterns stored to context-matters, with titles>
```

## Step 2: Persist to context-matters

Call `cx_store` with:
- **title**: "Session: <one-line task description>"
- **kind**: `observation`
- **tags** (array of strings): `session-log` and `<dirname>`
- **body**: The full log content from Step 1
- **scope_path**: `global`

## Step 3: Confirm

Tell the user the log file path and cx_store entry ID.
