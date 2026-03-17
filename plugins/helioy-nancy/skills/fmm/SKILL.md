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

FMM metadata for this codebase is exposed via the `fmm` MCP server. Full tool signatures are in the MCP tool definitions already in your context — this file is the usage playbook, not a reference manual.

The index stays current throughout your session. A PostToolUse hook re-indexes any file you edit, so fmm data is always trustworthy.

## Before You Touch Any Code

Default to fmm for navigation. It answers structural questions (file topology, symbol locations, export maps, dependency graphs, blast radius) in O(1). Reading files to derive those answers costs 10 to 50x more tokens and is less complete.

Reach for `Read`, `Grep`, or `Glob` as a fallback when fmm cannot answer your question: editing a specific symbol, searching string literals or comments, finding non-source files, or working in territory fmm does not index.

## Tool Map

| Tool                   | When to reach for it                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `fmm_list_files`       | Orient in an unknown directory. `sort_by: "downstream"` before a refactor to see blast radius         |
| `fmm_file_outline`     | Full structural profile of one file — exports, methods, line ranges. `include_private: true` for privates |
| `fmm_lookup_export`    | O(1) symbol → file + line range + file profile. Replaces grep                                          |
| `fmm_list_exports`     | Fuzzy or regex search over export names. `^foo` prefix, `Foo$` suffix                                  |
| `fmm_read_symbol`      | Exact source for a symbol. Use `ClassName.method` to extract one method from a large class             |
| `fmm_search`           | Cross-cutting: `term`, `imports`, `depends_on`, `min_loc`, `max_loc`                                   |
| `fmm_dependency_graph` | Upstream deps + downstream dependents. `filter: "source"` strips tests                                 |
| `fmm_glossary`         | Symbol-level impact. Dotted pattern (`Class.method`) for call-site precision before rename            |

## Essential Patterns

**Dotted pattern for rename safety.** `fmm_glossary("Injector.loadInstance")` runs a tree-sitter pass and returns only files with real call sites. `fmm_glossary("loadInstance")` returns every file importing the owning module — a superset. Use dotted for rename safety. Re-export-only files are annotated.

**`term` vs `export` in `fmm_search`.** `export: "Foo"` for a known symbol (clean, no noise). `term: "foo"` for discovery — returns EXPORTS, FILES, and NAMED IMPORTS grouped by type. The NAMED IMPORTS section is the primary way to find call sites of any function, local or external.

**Transitive vs direct.** `fmm_search(depends_on: ...)` is transitive (full downstream closure). For direct importers only, use `fmm_dependency_graph(depth: 1)` and read `downstream`.

**Evaluating a codebase in 5 to 8 calls.** `fmm_list_files(group_by: "subdir")` for topology, then `sort_by: "loc"` and `sort_by: "downstream"` for complexity and blast-radius anchors, then `fmm_file_outline` on the key files. No full reads required.

## Known Gaps (use `fmm_dependency_graph` instead)

- **React JSX components.** `<Navbar />` compiles to a function call that tree-sitter does not match as a named import. `fmm_glossary` returns empty `used_by` for JSX-only components. Use `fmm_dependency_graph(file: "...")` to find importers.
- **`createServerFn` wrappers.** TanStack Start RPC callers are the framework runtime, not direct imports. Empty `used_by` is not dead code.

## Rules

0. Try `fmm_list_files(group_by: "subdir")` for topology
1. Try `fmm_file_outline` before `Read`. Fall back to `Read` when you need to edit a symbol or understand logic `fmm_read_symbol` cannot extract.
2. Try `fmm_lookup_export` or `fmm_glossary` before `Grep`. Fall back to `Grep` for string literals, comments, or non-exported identifiers.
3. Try `fmm_list_files` before `Glob`. Fall back to `Glob` for non-source files (configs, fixtures, docs) that fmm does not index.
4. Try `fmm_read_symbol("Class.method")` before reading a full class file.
5. Dotted `fmm_glossary("Class.method")` for rename safety.
6. Trust the index — it updates after every file write.
