# helioy-plugins

Claude Code plugin package for the Helioy ecosystem. Ships three plugins that give Claude sessions persistent memory, code navigation, knowledge management, inter-agent messaging, engineering workflows, and workflow orchestration.

## Architecture

```
helioy-plugins/
  .claude-plugin/       # marketplace manifest bundling all plugins
  bin/helo              # session launcher with UUID tracking
  plugins/
    helioy-tools/       # core capabilities: MCP servers, skills, agents, hooks
    helioy-bus/         # inter-agent messaging: bus, warroom, mail
    helioy-pstack/      # experimental pstack workflows on Helioy warrooms
```

### Plugin: helioy-tools

The primary plugin. Five MCP servers, sixteen skills, thirteen agent definitions, and lifecycle hooks.

**MCP servers**

| Server | Binary/Package | Purpose |
|---|---|---|
| `am` | attention-matters (Rust) | Geometric memory on the S³ hypersphere |
| `cm` | context-matters (Rust) | Structured context store with hierarchical scopes |
| `fmm` | frontmatter-matters (Rust) | Code structural intelligence, O(1) symbol lookups |
| `mdm` | markdown-matters (npm) | Markdown indexing, search, embeddings |
| `supabase` | @supabase/mcp-server-supabase (npm) | Database, edge functions, migrations |

**Skills**

| Skill | Purpose |
|---|---|
| `context-matters` | Primary session memory via `cx_*` tools |
| `fmm` | MCP-first code navigation protocol |
| `pull-request` | Conventional-commit PRs for squash merge |
| `my-voice` | Writing in Stuart's voice |
| `content`, `social-loop` | Social publishing and engagement routing |
| `code-hygiene`, `codebase-map` | Codebase maintenance and mapping |
| `imagegen` | Helioy visual generation styles |
| `name-claim`, `npm-claim`, `pypi-claim`, `crate-claim` | Package name reservation workflows |
| `kubernetes-fundamentals` | Kubernetes knowledge navigation |
| `snapshot`, `workflows` | Document preservation and workflow inventory |

**Agents**

Thirteen specialist subagents grouped by function:

- Engineering: `backend-engineer`, `frontend-engineer`
- Design: `ux-designer`, `ux-researcher`, `visual-designer`
- Research: `deep-research`, `quick-research`, `research-synthesizer`, `github-researcher`, `codebase-analyst`
- Orchestration: `orchestrator`, `coordinator`, `project-planner`

**Hooks**

- `SessionStart`: reminds Claude to initialize context-matters
- `PostToolUse` (Edit|Write): regenerates the fmm index

### Plugin: helioy-bus

Inter-agent communication layer. Two MCP servers, three skills, and lifecycle hooks.

**MCP servers**

| Server | Source | Purpose |
|---|---|---|
| `helioy-bus` | Python proxy | Agent registration, discovery, messaging |
| `helioy-warroom` | Python proxy | Multi-agent warroom orchestration |

**Skills**

| Skill | Purpose |
|---|---|
| `mail` | Read and send messages between agents |
| `warroom` | Spin up and drive multi-agent collaborative sessions |
| `mail-workspace` | Skill iteration workspace with eval benchmarks |

**Hooks**

- `SessionStart`: register agent on the bus
- `PreToolUse`: check for pending mail, capture token usage
- `UserPromptSubmit`: check for pending mail
- `SessionEnd`: unregister from the bus

### Plugin: helioy-pstack

Experimental full port of pstack 0.14.0 from Cursor's plugin marketplace. The plugin retains all 44 skills, both agents, 23 Poteto Mode playbooks, and upstream verification scripts. Its runtime adapter assigns orchestration lifecycle and communication to `helioy-warroom` and `helioy-bus`.

The source import is pinned and attributed. `plugins/helioy-pstack/HELIOY.md` records the adaptation boundary and runtime mapping.

## Session launcher

`bin/helo` generates a UUID session ID and launches Claude Code with it, enabling bus registration and downstream hook coordination.

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

- Rust binaries built locally: attention-matters, context-matters, frontmatter-matters
- npm packages resolved on demand: markdown-matters, @supabase/mcp-server-supabase
- `SUPABASE_ACCESS_TOKEN` for supabase
- helioy-bus Python server running for inter-agent messaging

## License

MIT
