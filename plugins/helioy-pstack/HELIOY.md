# Helioy pstack experiment

This plugin makes the full pstack 0.14.0 skill collection available to Claude Code and Codex while preserving upstream structure and attribution.

## Provenance

- Upstream repository: `cursor/plugins`
- Upstream path: `pstack/`
- Upstream commit: `6dbbdd50cef1bdbfb540f80df8b598d0a546e3aa`
- Upstream author: Lauren Tan
- License: MIT
- Helioy plugin version: 0.1.0

The imported source contains all 44 top level skills, both custom agents, 23 Poteto Mode playbooks, the orchestration store, the PR watcher, Benny automation, guide material, tests, and assets. Helioy adds `mdx-artifacts` as the storage owner for lasting agent output.

## Runtime contract

Pstack chooses the engineering method. Helioy warroom owns multi-agent execution. Read [`skills/poteto-mode/references/helioy-runtime.md`](./skills/poteto-mode/references/helioy-runtime.md) whenever a pstack workflow delegates, races candidates, opens a panel, waits for workers, or manages a long program.

The adapter preserves pstack concepts and maps host operations:

| Pstack concept | Helioy execution |
|---|---|
| Cursor Task or cloud agent | Warroom member or bounded local subagent |
| Task model slug | Warroom runtime id |
| Task completion | Bus `done`, `blocked`, or `review` signal plus an artifact |
| TaskOutput polling | Bus notification, warroom status, or pane capture |
| Arena | Warroom Bakeoff contract |
| Swarm | Warroom Coverage contract |
| Orchestrate | Warroom program mode backed by bus events |
| Cursor `/loop` | Product wait or monitoring mechanism |
| Cursor UI and CLI control | Available browser, computer, terminal, or project verification skill |
| Cursor model rule | `~/.config/helioy/pstack-models.md` |

## Experiment boundary

This first release keeps upstream playbooks and scripts visible so their behavior can be evaluated. Host specific operations must pass through the runtime adapter. Graphite, Bugbot, Slack, ticket mutation, merges, deploys, force pushes, and destructive cleanup remain unavailable unless the current runtime exposes them and the user grants the required authority.

Do not add a second implementation of warroom or bus. Record any useful pstack improvement in the existing owner after the experiment proves it.
