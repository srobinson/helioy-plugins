# Plugin Re-Sync Script (v1) — Design

**Status:** Proposal
**Date:** 2026-05-16
**Author:** Claude (Opus 4.7)
**Depends on:** [helioy-bus CLI](../../../../helioy-bus/docs/superpowers/specs/2026-05-16-helioy-bus-cli-design.md) (specifically `helioy-bus nudge`)

## Summary

A single bash script at `bin/resync-plugins.sh` that walks a hardcoded `(home, plugin)` matrix and refreshes the byte-copied cache for each pair. Closes the loop on plugin source iteration: edit source, run script, live Claude sessions reload.

## Motivation

Plugin source at `plugins/<name>/` is byte-copied into per-home caches at install time. The cache then drifts from source on every subsequent edit. Existing workarounds:

| Workaround | Why it does not fit |
|---|---|
| `claude --plugin-dir <path>` | Session-scoped flag; must be passed at every launch. |
| `claude plugin update` | Version-gated. Same `0.1.0` both sides → no-op. |
| Bump version each iteration | Hundreds of edits per day. Untenable. |
| Symlink cache to source | Works in isolation; gets clobbered on any future `plugin install/update`. |

The user iterates "hundreds of times a day" across five source plugins, four Claude home directories, and a non-trivial install matrix. A single re-sync command is the right primitive.

## The (home, plugin) install matrix

Captured live on 2026-05-16:

| Home | Helioy plugins installed |
|---|---|
| `~/.claude` | helioy-tools, helioy-bus |
| `~/.claude.nancy` | helioy-nancy |
| `~/.claude.nancy-eng` | helioy-bus, helioy-nancy-eng |
| `~/.claude.nancy-pm` | helioy-bus, helioy-nancy-pm |

`helioy-bus` lives in three homes; the others in one each. Seven `(home, plugin)` pairs total.

## Goals

1. **One-command re-sync.** No version bumps, no per-home gymnastics.
2. **Hardcoded matrix.** Predictable; explicit; easy to extend when a new plugin is installed.
3. **Always full sweep.** No filter flags. The trigger is "I edited any source"; the action is "re-sync everything".
4. **Heal broken state.** A pair where the registry says installed but the cache is missing must come out clean.
5. **Refresh marketplace first.** Pick up `marketplace.json` edits (descriptions, new plugins) in the same run.
6. **Nudge live sessions to reload.** Via `helioy-bus nudge`. No restart required.

## Non-Goals

- Filter flags (`--plugin <name>`, `--home <name>`).
- Auto-discovery of installed plugins. Hardcoded matrix is the contract.
- Dry-run mode. Re-sync is idempotent and cheap; running it is the test.
- Restart of Claude sessions. The `nudge` step handles in-session reload; a full process restart is only needed for MCP server changes (rare).

## Design

### Pipeline

```
┌──────────────────────────────────────────────────────────┐
│  bin/resync-plugins.sh                                   │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 1. Pre-flight                │
        │    - shell-check matrix      │
        │    - verify helioy-bus PATH  │
        │    - verify claude PATH      │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 2. Refresh marketplace       │
        │    claude plugin marketplace │
        │      update helioy           │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 3. For each (home, plugin):  │
        │    a. uninstall (best effort)│
        │    b. rm -rf stale cache dir │
        │    c. install fresh          │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 4. Nudge live sessions       │
        │    helioy-bus nudge --to '*' │
        │      --content '/reload-...' │
        │      --from system:resync    │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 5. Print summary             │
        │    - per-pair status         │
        │    - nudge result            │
        │    - hint: full restart only │
        │      needed for MCP changes  │
        └──────────────────────────────┘
```

### Matrix declaration

Top of file. Single edit point when the install set changes.

```bash
MARKETPLACE="helioy"

# Each entry: "home_path:plugin1,plugin2,..."
HOMES_TO_PLUGINS=(
  "$HOME/.claude:helioy-tools,helioy-bus"
  "$HOME/.claude.nancy:helioy-nancy"
  "$HOME/.claude.nancy-eng:helioy-bus,helioy-nancy-eng"
  "$HOME/.claude.nancy-pm:helioy-bus,helioy-nancy-pm"
)
```

### Per-pair workflow

For each `(home, plugin)`:

```bash
# 1. Best-effort uninstall (ignore failures from broken state)
CLAUDE_CONFIG_DIR="$home" claude plugin uninstall "$plugin" 2>/dev/null || true

# 2. Heal cache (deletes stale dirs or leftover symlinks)
rm -rf "$home/plugins/cache/$MARKETPLACE/$plugin"

# 3. Fresh install
CLAUDE_CONFIG_DIR="$home" claude plugin install "$plugin@$MARKETPLACE" \
  || warn "install failed: $home / $plugin"
```

`CLAUDE_CONFIG_DIR` is the environment variable Claude Code reads to select its config home. Setting it per-invocation isolates each home's plugin operations.

### Nudge step

```bash
helioy-bus nudge \
  --to '*' \
  --content '/reload-plugins' \
  --from 'system:plugin-resync'
```

This types `/reload-plugins\n` into every live Claude pane registered on the bus. Sessions at a prompt boundary execute the slash command immediately; sessions mid-tool-call queue it until the next prompt. The bus's existing 30s throttle prevents accidental flood.

### Style and structure

Follows nancy bash conventions observed at `/Users/alphab/Dev/LLM/DEV/TMP/nancy/nancy`:

- `set -uo pipefail` at top (note: `-e` deliberately omitted because some `claude plugin` calls return non-zero on benign states like "already at version")
- Modular helpers in `bin/lib/` if the script grows past ~200 lines
- `namespace::function` naming for helpers (e.g., `pair::resync`, `summary::print`)
- ANSI color helpers (`say`, `ok`, `warn`) for human-readable progress

### File layout

```
helioy-plugins/
├── bin/
│   ├── resync-plugins.sh        executable, single entry
│   └── lib/                     (if grows)
│       ├── pair.sh
│       └── summary.sh
└── docs/superpowers/specs/
    └── 2026-05-16-plugin-resync-script-design.md   (this file)
```

### Behavior contract

| Aspect | Behavior |
|---|---|
| Idempotence | Always safe to re-run. Each pair recovers to a known-good state. |
| Active Claude sessions | Script runs regardless. The nudge step delivers `/reload-plugins` to live sessions. Document that fresh sessions started after the script automatically pick up new bytes. |
| Failure isolation | A failed pair (uninstall, install, or cache nuke) does not abort the run. Failures accumulate into the final summary. |
| Exit code | `0` if all pairs succeeded; `1` if any pair failed; `2` for pre-flight failure (helioy-bus missing, etc.). |
| Output | Per-home grouped; each pair shows ✓/✗ for uninstall, cache, install. Summary line at end. |
| Verbosity | Default = compact (per-pair line). `-v` = full per-step output. `-q` = errors only. |

### Sample output

```
→ Refreshing marketplace 'helioy'
  ✓ marketplace updated

→ Re-syncing 7 pairs

  ~/.claude
    helioy-tools   ✓ uninstalled  ✓ cache cleared  ✓ installed
    helioy-bus     ✓ uninstalled  ✓ cache cleared  ✓ installed

  ~/.claude.nancy
    helioy-nancy   ✓ uninstalled  ✓ cache cleared  ✓ installed

  ~/.claude.nancy-eng
    helioy-bus       ✓ uninstalled  ✓ cache cleared  ✓ installed
    helioy-nancy-eng ✓ uninstalled  ✓ cache cleared  ✓ installed

  ~/.claude.nancy-pm
    helioy-bus      ✓ uninstalled  ✓ cache cleared  ✓ installed
    helioy-nancy-pm ✓ uninstalled  ✓ cache cleared  ✓ installed

→ Nudging live Claude sessions
  ✓ /reload-plugins delivered to 3 agents
  · 1 agent throttled (recent nudge), will pick up on next prompt

✓ Re-sync complete (7/7 pairs)
  Full process restart only needed if you edited an MCP server.
```

## Edge cases

| Case | Handling |
|---|---|
| Cache dir is a symlink | `rm -rf` follows and removes the symlink, not the target. Verified in step 2 of pre-flight. |
| Home directory missing | Skip the home with a warn line. Likely user has not yet created that role. |
| `helioy-bus` not on PATH | Pre-flight fails fast; exit 2. User installs helioy-bus first. |
| `claude` not on PATH | Pre-flight fails fast; exit 2. |
| No live sessions to nudge | `helioy-bus nudge` returns `{"nudged": [], "recipients": []}`. Script prints "no live sessions; new sessions will pick up changes". |
| Network failure on marketplace update | Directory marketplace is local. No network. Failure here means a real local problem; report and continue. |

## Risks

| Risk | Mitigation |
|---|---|
| Matrix drift (a new plugin gets installed, script forgets it) | Single edit point at top. Document the matrix as the source of truth in the script header. |
| Nudge fires while session is typing | Existing 30s throttle on `nudge_message` (`services/message.py:214`) limits collateral. `/reload-plugins` is non-destructive even if typed into an inactive prompt. |
| Plugin install fails mid-loop | Best-effort: continue to next pair, accumulate into summary. Failed pairs visible in exit code. |
| `set -e` would abort on benign returns | Deliberately `-uo pipefail` only. Each command's failure is handled explicitly. |
| User runs script while a session is mid-tool-call | Nudge queues into the pane. Next prompt boundary the agent receives `/reload-plugins`. No correctness issue; visible UI hiccup at worst. |

## Dependencies

Hard dependencies:

- `helioy-bus` CLI on PATH (with the `nudge` subcommand). Tracked under [the bus CLI design](../../../../helioy-bus/docs/superpowers/specs/2026-05-16-helioy-bus-cli-design.md). The re-sync script can ship after the bus CLI's P2 phase completes (`mail`, `nudge` working).
- `claude` CLI on PATH with `plugin install/uninstall/marketplace update` subcommands. Already standard.

Soft dependencies:

- `tmux` if any Claude sessions are running in tmux. The bus's nudge step requires tmux to deliver. Not required by the script directly.

## Implementation Phases

| Phase | Scope |
|---|---|
| **P1: Pre-flight + matrix loop** | Script with matrix declaration, marketplace refresh, per-pair workflow. No nudge step yet. |
| **P2: Nudge integration** | Add `helioy-bus nudge` call. Requires helioy-bus CLI P2. |
| **P3: Output polish** | Per-home grouping, color, summary line, exit code accuracy. |
| **P4: Doc + commit** | README entry pointing to the script. Commit. |

P1 alone is shippable as a manually-restart-your-sessions workflow. P2 is the "smart" addition.

## Decisions Summary

| # | Decision | Why |
|---|---|---|
| D1 | Bash, not Python | Matches nancy style; the script is pure orchestration over external CLIs. No bus internals touched. |
| D2 | Hardcoded matrix | User preference. Predictable; obvious failure mode (drift) is the user's responsibility. |
| D3 | Always full sweep, no filters | User preference. The trigger is "edited source", scope is "everything that might have changed". |
| D4 | `helioy-bus nudge` for reload | Existing primitive once the bus CLI ships. No new infrastructure. |
| D5 | `set -uo pipefail`, not `-euo` | `claude plugin` returns benign non-zero in cases the script must tolerate. |
| D6 | Companion doc, not part of bus design | The script is a consumer of the bus, not part of it. Separation of repos. |
| D7 | Exit code distinguishes "all good" vs "some failed" vs "pre-flight failed" | Useful for CI/cron usage later. |

## Appendix: Reference

### Source observations (2026-05-16)

```
$ ls /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/
helioy-bus
helioy-nancy
helioy-nancy-eng
helioy-nancy-pm
helioy-tools

$ claude plugin marketplace list | grep helioy
  ❯ helioy
    Source: Directory (/Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins)
```

### Per-home install state

Confirmed via `CLAUDE_CONFIG_DIR=<home> claude plugin list` for each of the four homes.

### Related broken state (resolved during brainstorming)

Pre-existing state observed during requirements gathering: `~/.claude` listed `helioy-tools@helioy` as installed, but the cache directory was missing (deleted during earlier symlink experimentation). The re-sync script's per-pair workflow heals this case by step 2 (`rm -rf` is idempotent) and step 3 (fresh install regardless of prior state).

---

**End of v1 design.**
