---
name: codebase-map
description: >
  Generate accurate codebase onboarding maps and architecture diagrams. Use when
  the user asks for a codebase map, repo map, architecture map, onboarding map,
  dependency map, MAP.md, or a diagram that helps agents understand a codebase.
  For fmm indexed repos, use fmm MCP tools extensively and validate diagrams.
---

# Codebase Map

Create an onboarding artifact that helps another agent understand a codebase quickly.

Default output is `MAP.md` at the repo root unless the user names another path.

## Required Shape

The map must include actual diagrams, not only prose.

Use Mermaid by default:

1. Architecture or component topology diagram.
2. One high value sequence diagram, usually the main request or execution path.
3. Contract, dependency, or data ownership diagram when the codebase has a stable core.

Keep tool feedback out of `MAP.md`. If the user asks for feedback on fmm usefulness or limitations, write it to a separate evaluation file, preferably:

```text
~/.mdx/evaluations/codebase-map-fmm-feedback-<repo-slug>.md
```

## fmm First Workflow

When fmm MCP tools are available, use them as the primary source navigation surface.

Minimum useful pass:

```text
fmm_list_files(group_by: "subdir")
fmm_list_files(filter: "source", sort_by: "downstream")
fmm_list_files(filter: "tests", sort_by: "loc")
fmm_dependency_cycles(filter: "source", edge_mode: "runtime")
fmm_dependency_graph(file: "<key-file>", depth: 1, filter: "source")
fmm_lookup_export(name: "<key-symbol>")
fmm_read_symbol(name: "<key-symbol-or-file-qualified-symbol>", line_numbers: true)
fmm_glossary(pattern: "<key-symbol>", mode: "source")
fmm_glossary(pattern: "<key-symbol>", mode: "tests")
```

Use several tool types. Do not reduce the job to `fmm_file_outline` calls.

Use direct shell reads only for files fmm does not index or for final verification, such as manifests, generated source files, scripts, docs, and git status.

If fmm MCP is unavailable but the CLI is available, say that the MCP surface is unavailable and use the CLI only as a fallback.

## Map Contents

Include sections that help an agent route work:

1. System shape.
2. Crate, package, or module map.
3. Core contracts and source of truth files.
4. Main runtime or request flow.
5. Persistence, eventing, generated surfaces, or external boundaries when present.
6. Test map by behavior area.
7. High leverage files by downstream count and size.
8. Task routing table.
9. fmm workflow notes for future agents.

Use exact file paths and line references where fmm provides them.

## Diagram Validation

After writing Mermaid blocks, validate them with `mmdc` when installed.

Extract blocks to temporary files and render them:

```bash
tmp=/tmp/codebase-map-mermaid
rm -rf "$tmp"
mkdir -p "$tmp"
awk '
  /^```mermaid$/ {n++; out=sprintf("/tmp/codebase-map-mermaid/diagram-%d.mmd", n); in_block=1; next}
  /^```$/ && in_block {in_block=0; next}
  in_block {print > out}
  END {print n+0}
' MAP.md
mmdc -i /tmp/codebase-map-mermaid/diagram-1.mmd -o /tmp/codebase-map-mermaid/diagram-1.svg
```

Render every block. If `mmdc` is not installed, state that diagram syntax was not renderer validated.

## Verification

Run repo native verification appropriate to the change. For documentation only, still run lightweight checks:

```text
git diff --check
fmm validate
```

If the repo has a standard gate and it is reasonable to run, run it. Report exact results.
