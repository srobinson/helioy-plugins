---
name: fmm
description: Navigate codebases using FMM (Frontmatter Matters) sidecar files. Use when working in any codebase that has .fmm sidecar files. Sidecars provide exports, imports, dependencies, and LOC metadata so you can understand files without reading source code.
---

# FMM Code Navigation

When working in codebases with .fmm sidecar files, use them to navigate efficiently.

## What are sidecar files?

Source files have `.fmm` companions (e.g., `src/auth.ts` has `src/auth.ts.fmm`). These contain structured YAML metadata: exports, imports, dependencies, LOC.

## Before Reading Source Files

1. **Check for sidecars** — `Glob **/*.fmm` to see if this codebase uses FMM
2. **Read sidecars to navigate** — `Grep "exports:.*SymbolName" **/*.fmm` finds where things are defined
3. **Only open source files you will edit** — sidecars tell you the file's role without reading source

## Finding Definitions

To find where a symbol is defined:
```
Grep "exports:.*createStore" **/*.fmm
```

To understand a file's role without opening it:
```
Read src/auth.ts.fmm
```

## When to Use FMM

- Navigating unfamiliar codebases
- Finding where a function/type/class is defined
- Understanding file dependencies before making changes
- Planning refactors by mapping the dependency graph

## Key Principle

FMM saves 88-97% of tokens compared to reading source files. Always check sidecars first, only open source when you need to edit or understand implementation details.
