# helioy-plugins

Claude Code plugin for the [Helioy](https://helioy.com) ecosystem.

## What's included

**helioy-tools** — one plugin, 11 skills, 3 MCP servers.

### MCP Servers

| Server | Package | Purpose |
|---|---|---|
| `am` | [attention-matters](https://www.npmjs.com/package/attention-matters) | Geometric memory on S3 hypersphere — persistent recall across sessions |
| `fmm` | [frontmatter-matters](https://www.npmjs.com/package/frontmatter-matters) | Code metadata navigation — O(1) symbol/file lookups via frontmatter |
| `mdx` | [mdcontext](https://www.npmjs.com/package/mdcontext) | Document structural intelligence — markdown indexing, search, embeddings |

### Skills

| Skill | Description |
|---|---|
| `memory` | Session lifecycle for AM — recall, buffer, strengthen, mark insights |
| `fmm` | FMM frontmatter conventions and subcommands |
| `fmm-navigate` | MCP-first code navigation protocol (replaces grep/read) |
| `knowledge-base` | `~/.mdx` document store — 7 categories, YAML frontmatter, versioning |
| `linear-workflow` | Helioy ways of working — parent/sub-issue pattern, sizing, metadata |
| `create-spec` | Interactive requirements elicitation to produce SPEC.md |
| `nancy-orchestrator` | Nancy agent orchestration — pause, resume, direct, status |
| `nancy-send-message` | Send messages to Nancy workers |
| `nancy-update-spec` | Update task specifications for running workers |
| `nancy-session-history` | Git-based session history lookup |
| `check-directives` | Poll for orchestrator messages during autonomous work |

### Hooks

- **SessionStart** — reminds Claude to call `am_query` before doing anything else

## Install

```bash
claude plugin add /path/to/helioy-plugins
```

Or from GitHub:

```bash
claude plugin add srobinson/helioy-plugins
```

## Prerequisites

- [attention-matters](https://www.npmjs.com/package/attention-matters) (npm) — provides the `am` MCP server
- [frontmatter-matters](https://www.npmjs.com/package/frontmatter-matters) (npm) — provides the `fmm` MCP server
- [mdcontext](https://www.npmjs.com/package/mdcontext) (npm) — provides the `mdx` MCP server
- [Linear](https://linear.app) account — for the linear-workflow skill

## License

MIT
