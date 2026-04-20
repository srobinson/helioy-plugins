# helioy-plugins

Claude Code plugin package for the [Helioy](https://helioy.com) ecosystem. Bundles two plugins that give a Claude Code session persistent memory, code intelligence, inter-agent messaging, and workflow tooling.

## What's included

| Plugin | Scope |
|---|---|
| `helioy-tools` | Core capabilities: MCP servers, skills, agents, hooks |
| `helioy-bus` | Inter-agent messaging: bus, warroom, mail |

## helioy-tools

### MCP servers

| Server | Source | Purpose |
|---|---|---|
| `am` | [attention-matters](https://github.com/srobinson/attention-matters) (Rust) | Geometric memory on the S³ hypersphere |
| `cm` | [context-matters](https://github.com/srobinson/context-matters) (Rust) | Structured context store with hierarchical scopes |
| `fmm` | [frontmatter-matters](https://github.com/srobinson/frontmatter-matters) (Rust) | O(1) symbol and file lookups via frontmatter index |
| `mdm` | [markdown-matters](https://www.npmjs.com/package/markdown-matters) (npm) | Markdown indexing, search, embeddings |
| `linear-server` | [Linear MCP](https://mcp.linear.app) (HTTP) | Issue tracking |
| `supabase` | [@supabase/mcp-server-supabase](https://www.npmjs.com/package/@supabase/mcp-server-supabase) (npm) | Database, edge functions, migrations |

### Skills

| Skill | Purpose |
|---|---|
| `context-matters` | Primary session memory via `cx_*` tools |
| `fmm` | MCP-first code navigation protocol |
| `linear-workflow` | Parent/sub-issue planning for autonomous work |
| `create-spec` | Interactive requirements elicitation (SPEC.md) |
| `pull-request` | Conventional-commit PRs for squash merge |
| `my-voice` | Writing in Stuart's voice |
| `skill-creator` | Scaffold new skills with plugin conventions |
| `session-logger` | Persist session activity |
| `session-id` | Print current session ID |

### Agents

Specialist subagent definitions grouped by function:

- **Engineering**: backend-engineer, frontend-engineer
- **Design**: ux-designer, ux-researcher, visual-designer
- **Research**: deep-research, quick-research, research-synthesizer, github-researcher, codebase-analyst
- **Orchestration**: orchestrator, coordinator, project-planner

### Hooks

- `SessionStart` — initialize `context-matters` as primary memory
- `PostToolUse` (Edit, Write) — regenerate the fmm index

## helioy-bus

### MCP servers

| Server | Purpose |
|---|---|
| `helioy-bus` | Agent registration, discovery, messaging |
| `helioy-warroom` | Multi-agent warroom orchestration via tmux |

### Skills

| Skill | Purpose |
|---|---|
| `mail` | Read and send messages between agents |
| `warroom` | Spin up and drive multi-agent collaborative sessions |
| `mail-workspace` | Skill iteration workspace with eval benchmarks |

### Hooks

- `SessionStart` — register agent on the bus
- `PreToolUse` — check for pending mail, capture token usage
- `UserPromptSubmit` — check for pending mail
- `Stop` — prompt session logging
- `SessionEnd` — unregister from the bus

## Session launcher

`bin/helo` generates a UUID session ID and launches Claude Code so bus registration and downstream hooks can coordinate.

```bash
helo --verbose
helo -p "task" --model opus
```

## Install

```bash
claude plugin add /path/to/helioy-plugins
# or
claude plugin add srobinson/helioy-plugins
```

## Prerequisites

- Rust binaries built locally: `attention-matters`, `context-matters`, `frontmatter-matters`
- npm packages resolved on demand: `markdown-matters`, `@supabase/mcp-server-supabase`
- `LINEAR_API_KEY` for `linear-server`
- `SUPABASE_ACCESS_TOKEN` for `supabase`
- `helioy-bus` Python server running for inter-agent messaging

## License

MIT
