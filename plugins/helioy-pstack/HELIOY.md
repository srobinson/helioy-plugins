# Helioy pstack

The pstack engineering method, ported to Claude Code and Codex with helioy warroom as the execution runtime.

## Provenance

- Upstream repository: `cursor/plugins`, path `pstack/`, commit `6dbbdd50cef1bdbfb540f80df8b598d0a546e3aa`, version 0.14.0
- Upstream author: Lauren Tan
- License: MIT
- Helioy plugin version: 0.1.0

## What was kept

The method: `poteto-mode` as the hub, the 22 `principle-*` leaves, `architect`, `arena`, `interrogate`, `how`, `why`, `teach`, `blast-radius`, `figure-it-out`, `no-comments` with the Comment Sicko agent, `show-me-your-work`, `unslop`, `technical-writing`, `tdd`, `mdx-artifacts`, and the verification-skill pair. Ten playbooks: investigation, bug fix, perf, feature, refactoring, prototype, visual parity, autonomous run, multi-phase plan, opening a PR.

## What was cut and where it went

| Upstream | Reason | Helioy owner |
|---|---|---|
| `setup-pstack`, `pstack-models.md`, Cursor model slugs | Second source of truth for runtime facts | Warroom Runtimes table; skills name runtime ids directly |
| `swarm` skill | Cursor cloud fields around a coverage table | Swarm contract in the runtime adapter |
| Shipping, Babysit, Autopilot playbooks, `watch-pr`, Bugbot triage | Graphite stack and Bugbot semantics | `helioy-tools:pull-request`; `gh pr checks` per warroom cheap signals |
| Orchestrate playbook, `scripts/orch/` | Second lifecycle owner beside bus | Warroom Slice Build Loop plus `show-me-your-work` |
| Session pickup, Pause safely, `recall` | Cursor session semantics | `context-matters` store, branch, and trail |
| Perf issue, Hillclimb, Runtime forensics, Trace forensics | Four playbooks, one method | `playbooks/perf.md` with Diagnose, Fix, Climb modes |
| Authoring a skill, Eval, `automate-me`, `create-skill` routing | Cursor skill tooling | `technical-writing` and `unslop` |
| Worktree cleanup, `bro`, `typescript-best-practices`, Benny automations, guide | Utility or Cursor-only | dropped |

## Runtime contract

Pstack chooses the engineering method. Helioy warroom owns multi-agent execution. Read [`skills/poteto-mode/references/helioy-runtime.md`](./skills/poteto-mode/references/helioy-runtime.md) whenever a pstack workflow delegates, races candidates, opens a panel, waits for workers, or manages a long program. Do not add a second implementation of warroom or bus.
