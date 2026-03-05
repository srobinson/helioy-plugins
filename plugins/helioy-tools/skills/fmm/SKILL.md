---
name: fmm
description: "This project uses fmm (.fmmrc.json) for code metadata. INVOKE THIS SKILL before reading or searching source files — it provides MCP-first navigation that replaces grep/read with O(1) lookups."
---

# FMM — MCP-First Code Navigation

This codebase has FMM metadata available via MCP tools. Use them for instant, structured lookups instead of grep/read.

## MCP Tools (ALWAYS USE THESE FIRST)

| Tool | Use Case | Example |
|------|----------|---------|
| `fmm_read_symbol` | "Show me the code for X" | `fmm_read_symbol(name: "createPipeline")` or `fmm_read_symbol(name: "NestFactory.create")` |
| `fmm_lookup_export` | "Where is X defined?" | `fmm_lookup_export(name: "createPipeline")` |
| `fmm_file_outline` | "What's in this file?" | `fmm_file_outline(file: "src/core/index.ts")` |
| `fmm_list_files` | "What files are in this module?" | `fmm_list_files(path: "src/agent/")` |
| `fmm_list_exports` | "Find exports matching X" | `fmm_list_exports(pattern: "swarm")` |
| `fmm_dependency_graph` | "Deps and blast radius for this file" | `fmm_dependency_graph(file: "src/core/index.ts")` |
| `fmm_file_info` | "Quick file summary" | `fmm_file_info(file: "src/utils/helpers.ts")` |
| `fmm_search` | Multi-criteria search with relevance ranking | `fmm_search(imports: "lodash", min_loc: 100)` |
| `fmm_glossary` | Symbol-level blast radius — who imports this symbol? | `fmm_glossary(pattern: "run_dispatch")` |

## Navigation Protocol

### "Show me the code for X"

```
1. fmm_read_symbol(name: "X") → exact source + file path + line range — DONE
   For a specific method: fmm_read_symbol(name: "ClassName.methodName") — DONE
```

Replaces 3+ tool calls (search → find file → read file → locate symbol) with ONE.

Use `ClassName.method` notation for dotted symbol navigation — extracts just the method without the full class body noise.

Re-export chains are resolved automatically: if `X` is re-exported via `__init__.py` or `index.ts`, the tool follows the chain to the concrete definition.

### "What files are in this module?"

```
1. fmm_list_files(path: "src/agent/") → all indexed files with LOC and export count — DONE
2. Use fmm_file_outline on specific files to understand their shape
```

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

### "What would break if I rename/change X?"

```
1. fmm_glossary(pattern: "X") → all definitions of X + exact files that import each one — DONE
```

More surgical than fmm_dependency_graph: file-level blast radius tells you which files are affected; glossary tells you which specific callers import that symbol.

### "What depends on this file?" / "What does this file import?"

```
1. fmm_dependency_graph(file: "src/foo.ts")
2. Response includes three fields:
   - local_deps: intra-project files it imports, resolved to actual paths
   - external: third-party packages
   - downstream: files that import this file (blast radius if it changes)
```

## Sidecar Fallback

If MCP tools are unavailable, `.fmm` sidecar files exist alongside source files:

```yaml
file: src/core/pipeline.ts
fmm: v0.3+0.1.11
exports:
  createPipeline: [10, 45]
  PipelineConfig: [47, 52]
imports: [./engine, ./validators, lodash, zod]
loc: 142
modified: 2026-03-05
```

Line ranges enable surgical reads: `Read(file, offset=10, limit=36)`.

## Rules

1. **MCP tools are primary** — always call `fmm_*` before grep/read
2. **`fmm_read_symbol` is your default** — need to see code? One call, exact lines
3. **`fmm_file_outline` before reading** — see the shape before deciding what to read
4. **Read source only when editing** — MCP/sidecars tell you what you need for navigation
5. **Saves 88-97% of tokens** compared to reading full source files
