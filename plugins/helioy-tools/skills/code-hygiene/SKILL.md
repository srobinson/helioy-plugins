---
name: code-hygiene
description: >
  Improve codebase health through careful decomposition, consolidation,
  boundary repair, and developer experience cleanup. Use when the user asks
  for code hygiene, code-hygene, LOC reduction, refactoring, decomposing large
  files or functions, finding natural seams, reducing duplication, reorganizing
  modules, improving maintainability, or taking a craftsmanship pass across
  Rust, Python, TypeScript, JavaScript, Go, or any other language.
---

# Code Hygiene

Treat code hygiene as craft work. The goal is not only to make files shorter.
The goal is to make the system easier to understand, safer to change, easier
to test, and more pleasant to work in.

## Core Standard

Hard guardrails:

- New files stay under 700 LOC.
- Existing files over 700 LOC are refactored before adding meaningful code.
- Functions over about 150 LOC are decomposed.
- Duplication is not tolerated. Consolidate it or parameterize the variation.

These numbers are guardrails, not the whole craft. Also look for boundary
clarity, ownership, naming, dependency direction, test shape, and developer
experience.

## Operating Mode

When the user asks for a hygiene pass:

1. Read local project instructions first.
2. Recall project context through cm when available.
3. Check the worktree before editing.
4. Measure before judging.
5. Find natural seams before moving code.
6. Prefer existing files when ownership already fits.
7. Create a new module only when no existing module can own the code cleanly.
8. Move behavior mechanically first, then improve shape.
9. Verify after every meaningful slice.

If the user asks only to "take a look" or "find seams", produce a refactor
map without editing. If they ask to continue or fix it, implement.

## Measurement Pass

Start with cheap facts:

```bash
git status --short
find . -name AGENTS.md -o -name CLAUDE.md -o -name LESSONS.md
rg --files | wc -l
wc -l TARGET_FILES
```

Use structure tools when available:

- Use fmm for indexed repos: file topology, outlines, exports, dependency
  graphs, downstream blast radius, and symbol reads.
- Use `rg` for targeted text search.
- Use language tools when they exist: `cargo`, `ruff`, `mypy`, `pytest`,
  `pnpm`, `tsc`, `eslint`, `go test`, `gofmt`, or repo native `just` targets.

Avoid reading huge files end to end unless you are about to edit them. Use
outlines, symbol reads, or a bounded summary first.

## Health Signals

Look for these signals:

| Signal | What It Usually Means | Typical Remedy |
|---|---|---|
| Large file | Multiple responsibilities share one namespace | Split by ownership, not by arbitrary line ranges |
| Large function | Hidden phases or mixed abstraction levels | Extract named steps with explicit inputs and outputs |
| Duplicate blocks | Missing shared vocabulary or helper | Move to one owner and reuse it |
| Parallel implementations | Staged migration was never finished | Pick the winner and delete the old path |
| Circular imports | Boundary direction is unclear | Move pure types lower or defer imports at the edge |
| Test setup duplication | Fixture ownership is unclear | Extract shared test builders or harnesses |
| Layer crossing | UI, API, domain, storage, or platform code leaks together | Restore adapters around a core contract |
| Boolean soup | A function owns too many modes | Split command paths or introduce a small typed policy |
| Vague module names | Ownership cannot be inferred | Rename or regroup around concrete responsibility |
| Hard to verify | Behavior lacks a narrow seam | Add focused tests before reshaping |

## Natural Seam Heuristics

Prefer seams that match how the system thinks:

- **Models and vocabulary:** pure dataclasses, structs, enums, types,
  constants, request or response shapes.
- **Domain core:** pure logic with no IO, framework, process, or clock.
- **Adapters:** filesystem, network, database, subprocess, browser, CLI,
  framework, or platform specific code.
- **Orchestration:** lifecycle, registry, retries, rollback, locks, and state
  transitions.
- **Fanout and transport:** queues, streams, listeners, sockets, broadcast,
  backpressure, and replay.
- **Serialization:** JSON, wire format, schema conversion, parser, emitter.
- **Policy:** validation, authorization, routing, feature flags, limits.
- **Test harnesses:** fake services, builders, fixtures, process harnesses.

Prefer moving code to an existing owner when the owner is already clear. For
example, PTY process constants belong with PTY process primitives; browser
viewer replay does not belong there if that file is intentionally low level.

## Refactor Strategy

Use small reversible slices.

1. **Name the ownership map.** Say which responsibility goes where and why.
2. **Move pure vocabulary first.** Types and constants usually move safely.
3. **Extract cohesive behavior next.** Move one behavior cluster at a time.
4. **Keep lifecycle invariants together.** Do not split teardown, rollback,
   cancellation, lock release, or transaction boundaries until tests protect
   them.
5. **Keep public contracts stable unless the repo allows breakage.** If the
   repo is pre release and breakage is welcome, still make the break explicit.
6. **Preserve compatibility shims only when useful.** Delete obsolete paths
   once callers are migrated.
7. **Update tests and imports in the same slice.**

Mechanical movement comes before clever improvement. First prove behavior is
unchanged. Then simplify names, consolidate duplication, or strengthen tests.

## Boundary Rules

- A lower layer must not import an upper layer.
- Pure model modules should not import framework or runtime modules.
- Adapter modules may depend on the domain. Domain modules should not depend
  on adapters.
- A module name should tell a future maintainer what belongs there.
- A neutral seam should import cleanly in a fresh subprocess when the language
  makes import cycles possible.
- Generated code, vendored code, and migration snapshots may be exempt from
  LOC limits, but do not hide hand written complexity there.

## Verification

Run the smallest tests that prove the moved behavior, then the repo gate when
feasible.

Useful language defaults:

| Stack | Focused Checks | Broader Gate |
|---|---|---|
| Rust | `cargo test NAME`, `cargo check -p PKG` | `cargo fmt --check`, `cargo clippy --all-targets`, `cargo test` |
| Python | `pytest path::test`, `ruff check path`, `mypy path` | repo `just ci`, full `pytest` |
| TypeScript | `pnpm test PATTERN`, `pnpm typecheck` | `pnpm lint`, `pnpm test`, `pnpm build` |
| Go | `go test ./pkg/...` | `gofmt -w` or check, `go test ./...` |

For boundary refactors, add or update boundary tests:

- Import boundary tests.
- Subprocess import tests for neutral modules.
- Dependency direction tests when the repo has a tool for it.
- Focused regression tests for lifecycle, rollback, stream ordering, or data
  migration invariants.

Never report success until the command output and exit code were observed.

## Output Shape

For an inspection only:

- Current measurements.
- Natural seams.
- What should move to existing files.
- What deserves a new file.
- What must stay together for now.
- Suggested order and verification gates.

For an implemented refactor:

- Files changed.
- LOC before and after for important files.
- Ownership changes.
- Behavior intentionally unchanged or explicitly changed.
- Verification commands with observed results.

Keep the final report concise. The value is in the cleaner code and the proof,
not in a long essay.
