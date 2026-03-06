---
name: fmm
description: >
  MCP-first code navigation for this codebase. Use before any symbol lookup,
  file search, dependency trace, impact analysis, or codebase evaluation —
  replaces grep/glob/read with O(1) fmm_* tool calls. Trigger when: starting
  any task involving unfamiliar code, navigating code structure, finding where
  a symbol is defined, checking what imports a file, tracing blast radius
  before a rename, mapping test coverage, or evaluating/auditing a codebase.
---

# FMM — MCP-First Code Navigation

This codebase has FMM metadata available via the **`fmm` MCP server**. All tools are prefixed `fmm_*`. Use them for instant, structured lookups instead of grep/read.

The index stays current throughout your session — a hook re-indexes any file you edit immediately after the write. You can trust fmm data at every point in your task.

## Before You Touch Any Code

If you are about to call `Read`, `Grep`, or `Glob` on a source file — stop. Ask: does fmm answer this? It answers structural questions at O(1): file topology, symbol locations, export maps, dependency graphs, blast radius. Reading files to derive those answers costs 10-50x more tokens and is less complete.

Reserve `Read` for two cases only: editing a specific symbol, or understanding logic that `fmm_read_symbol` cannot provide.

## MCP Tools (ALWAYS USE THESE FIRST)

| Tool                   | Use Case                                                                                                                          | Example                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `fmm_list_files`       | Orient in an unknown codebase. sort_by: loc (heaviest), downstream (most-imported, best pre-refactoring), name, exports, modified | `fmm_list_files(directory: "src/", sort_by: "downstream")`           |
| `fmm_file_outline`     | Full structural profile — exports, public/private (--include_private) methods, line ranges                                        | `fmm_file_outline(file: "src/core/index.ts", include_private: true)` |
| `fmm_lookup_export`    | O(1) exact lookup → file, line range, full file profile                                                                           | `fmm_lookup_export(name: "createPipeline")`                          |
| `fmm_list_exports`     | Export search: substring or regex (auto-detected). `^handle`, `Service$`, `^[A-Z]` for regex; plain text for substring            | `fmm_list_exports(pattern: "^[A-Z]", directory: "packages/core/")`   |
| `fmm_read_symbol`      | Exact source for a named export or specific method                                                                                | `fmm_read_symbol(name: "Injector.loadInstance")`                     |
| `fmm_search`           | Cross-cutting queries: imports, LOC range, depends_on, term                                                                       | `fmm_search(imports: "rxjs", min_loc: 500)`                          |
| `fmm_dependency_graph` | Upstream deps + downstream blast radius. filter: "source" strips test files, filter: "tests" shows only test coverage             | `fmm_dependency_graph(file: "src/core/index.ts", filter: "source")`  |
| `fmm_glossary`         | Symbol impact — call-site callers or test coverage by method                                                                      | `fmm_glossary(pattern: "Injector.loadInstance", mode: "source")`     |

## Navigation Protocol

### "Orient me / What's in this directory?"

```
1. fmm_list_files(directory: "packages/core/", sort_by: "loc") → largest files first
2. Top entries = complexity anchors. Use fmm_file_outline on those first.
```

First tool to reach for in an unknown codebase. Default sort is `loc` (heaviest files first).

**Sort modes:** `loc` (default, heaviest files), `downstream` (most-imported — best before a refactor to see blast radius), `exports` (most exported symbols), `name` (alphabetical), `modified` (recently changed).

**Pre-refactoring:** use `sort_by: "downstream"` to find the files other files depend on most. Those are the highest-risk targets for changes.

### "What's in this file?"

```
1. fmm_file_outline(file: "src/foo.ts") → every export + public methods with line ranges
2. Decide WHAT to read before reading anything
```

`fmm_file_outline` lists all public methods on classes with exact line ranges. For a 1,000-line class, you see the full table of contents in one call.

### "Where is X defined?"

```
1. fmm_lookup_export(name: "X") → file, line range, AND full file profile — DONE
2. Not found? → fmm_list_exports(pattern: "X") for fuzzy match
3. Still nothing? → fall back to Grep
```

`fmm_lookup_export` returns more than a location — the entire file's export map, imports, and dependency list come with it.

### "Show me the code for X"

```
1. fmm_read_symbol(name: "ClassName.methodName") → exact method source — DONE
   Full class: fmm_read_symbol(name: "ClassName") — truncates at 10KB; add truncate: false for full source
```

**Always use `ClassName.method` notation for large classes.** It extracts exactly that method — no class body noise. Reading a 1,000-line class to find an 80-line method wastes ~90% of your token budget.

### "Find everything named like X"

```
1. fmm_list_exports(pattern: "X") → all matching exports with file + line range
2. Scope: fmm_list_exports(pattern: "X", directory: "packages/core/")
```

Results include class methods (e.g., `Injector.loadInstance`) as distinct entries. Use `offset` to paginate wide searches.

### "Cross-cutting query: files using X with more than N lines"

```
1. fmm_search(imports: "rxjs", min_loc: 500) → files matching ALL criteria with full metadata
2. fmm_search(depends_on: "src/core/injector.ts") → all files in the transitive dependency chain
3. fmm_search(term: "Injector") → EXPORTS + FILES + IMPORTS grouped by type
```

`depends_on` uses **transitive** matching — it returns the full downstream closure, not just direct importers. For direct importers only, use `fmm_dependency_graph(depth: 1)` and read `downstream`.

### "What would break if I rename/change X?"

```
1. fmm_glossary(pattern: "ClassName.method") → actual call sites only — surgical blast radius
   fmm_glossary(pattern: "ClassName") → file-level: all files importing the class's file
2. Separate production vs test impact: mode: "source" | "tests" | "all"
```

**The dotted pattern is the contract.** `fmm_glossary(pattern: "loadInstance")` returns every file that imports `injector.ts` — a superset. `fmm_glossary(pattern: "Injector.loadInstance")` runs a tree-sitter second pass and returns only files with an actual call site. Use the dotted form for rename safety.

### "What tests cover X?"

```
1. fmm_glossary(pattern: "ClassName.method", mode: "tests") → test files with actual call sites
   fmm_glossary(pattern: "ClassName", mode: "tests") → all test files importing the class
```

### "What depends on this file? What does it import?"

```
1. fmm_dependency_graph(file: "src/foo.ts")
   - local_deps: intra-project imports, resolved to actual paths
   - external: third-party packages
   - downstream: files that import this file (complete and reliable)
2. Transitive: fmm_dependency_graph(file: "...", depth: 3) or depth: -1 for full closure
```

### "Evaluate or audit this codebase"

```
1. fmm_list_files(group_by: "subdir")               → full topology, LOC per bucket
2. fmm_list_files(sort_by: "loc", limit: 20)        → largest files = complexity anchors
3. fmm_list_files(sort_by: "downstream", limit: 15) → highest blast-radius files
4. fmm_file_outline on key files                    → structure without reading
5. fmm_search(imports: "package")                   → cross-cutting architecture patterns
```

A comprehensive evaluation in 5-8 calls and under 5k tokens — faster and more complete than reading files.

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
modified: 2026-03-06
```

Line ranges enable surgical reads: `Read(file, offset=10, limit=36)`.

## Rules

1. **Never use `Read` to understand structure** — use `fmm_file_outline`
2. **Never use `Grep` to find a symbol** — use `fmm_lookup_export` or `fmm_glossary`
3. **Never use `Glob` to explore a directory** — use `fmm_list_files`
4. **`fmm_list_files` first** — orient before navigating
5. **`fmm_file_outline` before reading** — see the shape, then decide what to read
6. **`fmm_read_symbol("ClassName.method")`** — never read a full class to find one method
7. **Dotted pattern for rename safety** — `fmm_glossary("ClassName.method")` for call-site precision
8. **Read source only when editing** — MCP tools tell you everything you need for navigation
9. **Trust the index** — it updates automatically after every file write
