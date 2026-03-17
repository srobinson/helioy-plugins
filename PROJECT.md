# helioy-plugins

Claude Code plugin package for the Helioy ecosystem. Ships two plugins that give Claude sessions persistent memory, code navigation, knowledge management, inter-agent messaging, and workflow orchestration.

## Architecture

```
helioy-plugins/
  .claude-plugin/       # marketplace manifest (bundles both plugins)
  bin/helo              # session launcher with UUID tracking
  plugins/
    helioy-tools/       # core capabilities: MCP servers, skills, agents, hooks
    helioy-bus/         # inter-agent messaging: bus, warroom, mail skills
```

### Plugin: helioy-tools

The primary plugin. Provides six MCP servers, 15 skills, 34 agent definitions, and lifecycle hooks.

**MCP Servers**

| Server | Binary/Package | Purpose |
|---|---|---|
| `am` | attention-matters (Rust) | Geometric memory on S3 hypersphere |
| `cm` | context-matters (Rust) | Structured context store with hierarchical scopes |
| `fmm` | frontmatter-matters (Rust) | Code structural intelligence, O(1) symbol lookups |
| `mdm` | markdown-matters (npm) | Markdown indexing, search, embeddings |
| `linear-server` | Linear HTTP MCP | Issue tracking integration |
| `supabase` | Supabase MCP (npm) | Database, edge functions, migrations |

**Skills**

| Skill | Purpose |
|---|---|
| `context-matters` | Primary session memory via cx_* tools |
| `memory` | Geometric memory lifecycle (AM) |
| `fmm` | Code navigation protocol |
| `knowledge-base` | ~/.mdx document store management |
| `linear-workflow` | Parent/sub-issue work planning |
| `create-spec` | Interactive requirements elicitation |
| `pull-request` | Conventional commit PR creation |
| `my-voice` | Writing in Stuart's voice |
| `skill-creator` | Scaffold new skills |
| `session-logger` | Persist session activity |
| `session-id` | Print current session ID |
| `check-directives` | Poll for orchestrator messages |
| `nancy-orchestrator` | Nancy agent supervision |
| `nancy-send-message` | Message Nancy workers |
| `nancy-update-spec` | Update worker task specs |

**Agents** (34 definitions in `agents/`)

Covers engineering (backend, frontend, mobile, Rust, AI/ML, rapid prototyping, code review, git workflow), design (UI, UX architecture, brand, visual storytelling, whimsy, image prompts, inclusive visuals), research (deep, quick, synthesis, GitHub, codebase analysis), and orchestration (orchestrator, coordinator, project planner).

**Hooks**

- `SessionStart`: Reminds Claude to initialize context-matters
- `PostToolUse` (Edit|Write): Auto-regenerates fmm index

### Plugin: helioy-bus

Inter-agent communication layer. Two MCP servers, three skills, and lifecycle hooks.

**MCP Servers**

| Server | Source | Purpose |
|---|---|---|
| `helioy-bus` | Python proxy | Agent registration, discovery, messaging |
| `helioy-warroom` | Python proxy | Multi-agent warroom orchestration |

**Skills**

| Skill | Purpose |
|---|---|
| `mail` | Read/send messages between agents |
| `warroom` | Multi-agent collaborative sessions |
| `mail-workspace` | Skill iteration workspace with eval benchmarks |

**Hooks**

- `SessionStart`: Register agent on the bus
- `PreToolUse`: Check for pending mail, capture token usage
- `UserPromptSubmit`: Check for pending mail
- `Stop`: Prompt session logging
- `SessionEnd`: Unregister from the bus

## Session Launcher

`bin/helo` generates a UUID session ID and launches Claude Code with it. This enables bus registration and downstream hook coordination.

```bash
helo --verbose          # launch with tracking
helo -p "task" --model opus
```

## Install

```bash
claude plugin add /path/to/helioy-plugins
# or from GitHub:
claude plugin add srobinson/helioy-plugins
```

## Prerequisites

- Rust binaries: attention-matters, context-matters, frontmatter-matters (built locally)
- npm packages: markdown-matters, @supabase/mcp-server-supabase
- Linear API key (for linear-server)
- Supabase access token (for supabase)
- helioy-bus Python server running (for inter-agent messaging)

## Current Status

Active development. v0.1.0. Both plugins are functional and used daily in the Helioy ecosystem. The `mail` skill SKILL.md has uncommitted changes.

## License

MIT
