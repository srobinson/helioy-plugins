---
name: fmm
description: "This project uses fmm (.fmmrc.json) for code metadata. INVOKE THIS SKILL before reading or searching source files — it provides MCP-first navigation that replaces grep/read with O(1) lookups."
---

# FMM — MCP-First Code Navigation

This codebase has FMM metadata available via MCP tools. Use them for instant, structured lookups instead of grep/read.

## MCP Tools (ALWAYS USE THESE FIRST)

| Tool | Use Case | Example |
|------|----------|---------|
| `fmm_read_symbol` | "Show me the code for X" | `fmm_read_symbol(name: "createPipeline")` |
| `fmm_lookup_export` | "Where is X defined?" | `fmm_lookup_export(name: "createPipeline")` |
| `fmm_file_outline` | "What's in this file?" | `fmm_file_outline(file: "src/core/index.ts")` |
| `fmm_list_exports` | "Find exports matching X" | `fmm_list_exports(pattern: "swarm")` |
| `fmm_dependency_graph` | "What depends on this file?" | `fmm_dependency_graph(file: "src/core/index.ts")` |
| `fmm_file_info` | "Quick file summary" | `fmm_file_info(file: "src/utils/helpers.ts")` |
| `fmm_search` | Multi-criteria search | `fmm_search(imports: "lodash", min_loc: 100)` |

## Navigation Protocol

### "Show me the code for X"

```
1. fmm_read_symbol(name: "X") → exact source + file path + line range — DONE
```

Replaces 3+ tool calls (search → find file → read file → locate symbol) with ONE.

### "Where is X defined?"

```
1. fmm_lookup_export(name: "X") → file path + line range — DONE
2. Not found? → fmm_list_exports(pattern: "X") for fuzzy match
3. Still nothing? → fall back to Grep
```

### "What's in this file?"

```
1. fmm_file_outline(file: "src/foo.ts") → every export with line ranges and sizes
2. Decide WHAT to read before reading anything
```

### "What depends on this file?"

```
1. fmm_dependency_graph(file: "src/foo.ts") → upstream + downstream deps — DONE
```

## Sidecar Fallback

If MCP tools are unavailable, `.fmm` sidecar files exist alongside source files:

```yaml
file: src/core/pipeline.ts
fmm: v0.3
exports:
  createPipeline: [10, 45]
  PipelineConfig: [47, 52]
imports: [zod, lodash]
dependencies: [./engine, ./validators]
loc: 142
```

Line ranges enable surgical reads: `Read(file, offset=10, limit=36)`.

## Rules

1. **MCP tools are primary** — always call `fmm_*` before grep/read
2. **`fmm_read_symbol` is your default** — need to see code? One call, exact lines
3. **`fmm_file_outline` before reading** — see the shape before deciding what to read
4. **Read source only when editing** — MCP/sidecars tell you what you need for navigation
5. **Saves 88-97% of tokens** compared to reading full source files
