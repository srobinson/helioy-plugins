---
name: setup-pstack
description: Configure which Helioy runtimes pstack uses per role. Detects available warroom runtimes and writes a runtime-neutral model policy. Use for setup pstack, configure pstack models, or changing pstack runtime choices.
---

# Setup pstack

Write `~/.config/helioy/pstack-models.md`. Pstack orchestration skills read this file and fall back to their inline defaults when a line is absent. The runtime adapter translates any remaining Cursor defaults.

## 1. Detect runtimes

Read [`../poteto-mode/references/helioy-runtime.md`](../poteto-mode/references/helioy-runtime.md). Use warroom discovery and current runtime status when available. Accept only runtime ids the installed Helioy adapter exposes.

Common runtime ids are:

- `claude`
- `claude-opus`
- `codex`
- `grok`
- `grok-fast`
- `inherit-parent`

Do not assume availability. A runtime installed in the catalog may still lack credentials or organization access. Verify one live registration before selecting it for a panel.

## 2. Load current state

Read `~/.config/helioy/pstack-models.md` when present. Otherwise start from the defaults below.

## 3. Confirm choices

Show every role and its selected runtime. Mark unavailable values. Ask only when a missing runtime would materially change panel diversity or execution cost. Reversible fallback to `inherit-parent` may proceed and must be reported.

Panel values are comma separated runtime ids. Their length sets the fanout count. Prefer runtime family diversity for Arena, Interrogate, and architectural critics.

## 4. Write atomically

Create `~/.config/helioy` when needed. Replace the whole configuration file so repeated setup converges on one state.

Use this shape:

```markdown
# pstack runtime configuration

feature, refactoring: codex
bug-fix: codex
perf-issue: codex
hillclimb: codex
judgment and prose: claude
hardest tasks: codex
how explorer: grok-fast
how explainer: claude
how critics: claude, codex, grok
why investigators: grok-fast
why synthesizer: claude
reflect tooling: codex
reflect judgment, divergent, synthesizer: claude
arena runners: claude, codex, grok
arena cross-judge pool: claude, codex, grok
swarm workers: grok-fast
architect runners: claude, codex, grok
interrogate reviewers: claude, codex, grok
```

## 5. Validate

Re-read the file. Confirm every non-alias value is available. Confirm each diversity panel contains at least two runtime families or record why it does not.

## 6. Report

Tell the user which file was written, which runtimes were verified live, which roles use fallback, and that new sessions will read the configuration.

## Optional verification workflow

Check whether the project already has a real surface verification harness or skill. When repeated user-visible verification is missing, offer `create-verification-skill` once. Reuse project tooling before generating another wrapper.
