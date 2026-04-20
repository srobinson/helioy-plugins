# TLDR

helioy-plugins is a Claude Code plugin package that extends Claude sessions with persistent memory, code intelligence, inter-agent communication, and workflow tooling.

## What it is

Five plugins bundled in one installable package:

1. **helioy-tools**: The core capability layer. Six MCP servers (geometric memory, structured context, code navigation, markdown search, Linear, Supabase), nine skills (from session memory to PR creation), and thirteen specialist subagent definitions spanning engineering, design, research, and orchestration.

2. **helioy-bus**: The communication layer. Lets multiple Claude Code instances running in different tmux panes discover each other, exchange messages, and coordinate through warroom sessions.

3. **helioy-nancy**: Shared hooks and skills for the Nancy multi-agent orchestrator.

4. **helioy-nancy-pm**: Nancy's PM role. Planning, Linear workflow, interactive task creation.

5. **helioy-nancy-eng**: Nancy's engineering role. Worker tools, session handover, and code navigation for autonomous execution.

## Why it exists

The Helioy ecosystem runs multiple Claude Code agents concurrently across different repositories. These agents need shared memory that persists between sessions, structural awareness of the codebase without reading every file, and the ability to send messages to each other. This plugin package is the bridge that makes a single Claude Code session a node in a larger multi-agent system.

## How it works

**Memory**: Two complementary systems. `attention-matters` provides geometric memory on an S³ hypersphere for associative recall. `context-matters` provides a structured SQLite store with hierarchical scopes for facts, decisions, and feedback.

**Code navigation**: `frontmatter-matters` (fmm) pre-indexes codebases into a SQLite database. Skills and hooks keep the index current on every file edit. Agents use fmm instead of grep/read for O(1) symbol lookups.

**Messaging**: The helioy-bus plugin registers each Claude session on a shared bus at startup and unregisters on exit. Hooks check for pending mail before every tool call. The warroom skill orchestrates multi-agent collaborative sessions via tmux.

**Orchestration**: The three helioy-nancy plugins split orchestrator, PM, and engineer roles so each persona can be enabled independently on a given workstation.

**Skills**: Markdown prompt files (SKILL.md) that expand into full instructions when invoked. They guide Claude through specific workflows: checking mail, creating PRs, writing in a consistent voice, planning Linear issues.

**Agents**: Markdown definition files that configure specialized subagent behaviors. When Claude spawns a subagent, the agent definition shapes its expertise and approach.

**Hooks**: Lifecycle events (session start/end, tool use, user prompt) trigger shell commands for bus registration, mail checking, token tracking, and index rebuilding.

## Key concepts

- **Plugin**: A directory with `.claude-plugin/plugin.json`, optional `.mcp.json`, and directories for skills, agents, and hooks
- **Skill**: A `SKILL.md` file with frontmatter that Claude expands into working instructions
- **Agent**: A markdown file defining a specialized subagent persona and toolset
- **Hook**: A shell command bound to a Claude Code lifecycle event
- **The bus**: A Python server that brokers messages between registered Claude instances
- **Warroom**: A multi-agent tmux session where an orchestrator drives specialist agents
