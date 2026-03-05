---
name: fmm
description: "This project uses fmm (.fmmrc.json) for code metadata. INVOKE THIS SKILL before reading or searching source files — it provides MCP-first navigation that replaces grep/read with O(1) lookups."
---

# FMM — MCP-First Code Navigation

This codebase has FMM metadata available via the **`fmm` MCP server**. All tools are prefixed `fmm_*`. Use them for instant, structured lookups instead of grep/read.

## MCP Tools (ALWAYS USE THESE FIRST)

| Tool                   | Use Case                                                     | Example                                                            |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `fmm_list_files`       | Orient in an unknown codebase — instant size map             | `fmm_list_files(directory: "src/agent/")`                          |
| `fmm_read_symbol`      | Exact source for a named export or method                    | `fmm_read_symbol(name: "NestFactory.create")`                      |
| `fmm_lookup_export`    | O(1) exact lookup → file, line range, full file profile      | `fmm_lookup_export(name: "createPipeline")`                        |
| `fmm_file_outline`     | Full structural profile — exports, public methods, sizes     | `fmm_file_outline(file: "src/core/index.ts")`                      |
| `fmm_list_exports`     | Fuzzy export search; scope by directory or file              | `fmm_list_exports(pattern: "Config", directory: "packages/core/")` |
| `fmm_search`           | Cross-cutting queries: imports, LOC range, depends_on, term  | `fmm_search(imports: "rxjs", min_loc: 500)`                        |
| `fmm_dependency_graph` | Upstream deps + downstream blast radius for a file           | `fmm_dependency_graph(file: "src/core/index.ts")`                  |
| `fmm_glossary`         | Symbol impact — files that import this export; test coverage | `fmm_glossary(pattern: "run_dispatch", mode: "tests")`             |

## Navigation Protocol

### "Orient me / What's in this directory?"

```
1. fmm_list_files(directory: "packages/core/") → all files with LOC + export count
2. Largest LOC = complexity anchors. Use fmm_file_outline on those first.
```

First tool to reach for in an unknown codebase. Instant size map — no file reads needed.

### "Show me the code for X"

```
1. fmm_read_symbol(name: "X") → exact source + file + line range — DONE
   Specific method: fmm_read_symbol(name: "ClassName.methodName") — DONE
```

Replaces 3+ tool calls with ONE. `ClassName.method` extracts just that method — no class body noise. Re-export chains (`__init__.py`, `index.ts`) are resolved automatically.

For very large classes (>400 lines), add `truncate: false` to get full source.

### "Where is X defined?"

```
1. fmm_lookup_export(name: "X") → file, line range, AND full file profile (exports, imports, loc) — DONE
2. Not found (exact match only)? → fmm_list_exports(pattern: "X") for fuzzy match
3. Still nothing? → fall back to Grep
```

`fmm_lookup_export` returns more than a location — the entire file's export map, imports, and dependency list come with it.

### "What's in this file?"

```
1. fmm_file_outline(file: "src/foo.ts") → every export + public methods with line ranges and sizes
2. Decide WHAT to read before reading anything
```

### "Find everything named like X / name collision check"

```
1. fmm_list_exports(pattern: "X") → all matching exports with file + line range
2. Scope: fmm_list_exports(pattern: "X", directory: "packages/core/")
```

Wide searches may paginate — use `offset` to continue.

### "Cross-cutting query: files using X with more than N lines"

```
1. fmm_search(imports: "rxjs", min_loc: 500) → files matching ALL criteria with full metadata
2. fmm_search(depends_on: "src/core/injector.ts") → all files depending on a specific file
3. fmm_search(term: "Injector") → EXPORTS + FILES + IMPORTS grouped by type
```

`depends_on` is often better than `fmm_dependency_graph` for downstream analysis — returns dependent files with full export/import metadata so you can assess impact inline.

### "What would break if I rename/change X?"

```
1. fmm_glossary(pattern: "X") → all definitions of X + files that import each one
   Method query: fmm_glossary(pattern: "ClassName.method") → call-site filtered used_by
2. Separate production vs test impact: mode: "source" | "tests" | "all"
```

Class-level queries return file-level `used_by` (all files importing the class's file). Dotted method queries filter to files that actually call the method.

### "What tests cover X?"

```
1. fmm_glossary(pattern: "X", mode: "tests") → test files that import this symbol — DONE
   fmm_glossary(pattern: "ClassName", mode: "tests") → method-level coverage map for the whole class
```

One call answers "what tests cover this class" — every public method with its covering test files.

### "What depends on this file? What does it import?"

```
1. fmm_dependency_graph(file: "src/foo.ts")
   - local_deps: intra-project imports, resolved to actual paths
   - external: third-party packages
   - downstream: files that import this file (direct blast radius)
2. Transitive: fmm_dependency_graph(file: "...", depth: 3) or depth: -1 for full closure
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
2. **`fmm_list_files` first** — orient before navigating
3. **`fmm_read_symbol` is your default** — need to see code? One call, exact lines
4. **`fmm_file_outline` before reading** — see the shape before deciding what to read
5. **Read source only when editing** — MCP/sidecars tell you what you need for navigation
6. **Saves 88-97% of tokens** compared to reading full source files
