---
name: snapshot
description: >
  Preserve the prior version of a doc to its sibling .archive/
  directory before editing. Use when the user is about to make material
  edits to a doc worth versioning, or asks to snapshot, version,
  archive, preserve, shelve, or save the current state before
  changes.
---

# Snapshot — Pre-Edit Doc Versioning

Preserve the current state of a doc to its sibling `.archive/`
directory before editing. The canonical path remains authoritative;
the archive holds the version trail for diff and rollback.

Run before material edits to docs worth preserving versions of: blog
posts, project plans, voice specifications, design documents,
configuration files, anything where reading "what was this before
the change" is sometimes useful.

## Setup

1. Confirm the canonical doc exists at the path the user named. If
   absent, surface a one-line note and stop. Nothing to preserve.
2. Determine the sibling archive directory: `<dir>/.archive/` where
   `<dir>` is the canonical's parent. Create it if missing.
3. Compute the next version number. Scan the archive for files
   matching `<basename>.v<N>.<ext>`. Next N = max existing N + 1, or
   1 if no prior snapshots of this basename exist.
4. Compare the canonical against the latest archived version, if
   any. If byte-identical, skip the snapshot and surface a one-line
   note. The archive should grow only when something changes.

## The snapshot operation

Two modes. Pick by what comes next.

### Mode A — `mv` (default)

Use when a `Write` call follows immediately. The canonical is empty
for one operation, then refilled with the new version.

```
mv <canonical_path> <archive_dir>/<basename>.v<N>.<ext>
```

After the move, the caller writes the new version to the canonical
path. Archive holds v<N>; canonical holds v<N+1>.

### Mode B — `cp`

Use when the canonical must remain readable during a long edit pass
(multi-step polish, expansion, interactive review). The archive gets
the prior; the canonical stays intact for in-place editing.

```
cp <canonical_path> <archive_dir>/<basename>.v<N>.<ext>
```

Default to Mode A unless the next operation is a long-running edit
that reads the canonical multiple times.

## Naming rule

Insert `.v<N>` before the final extension. The basename keeps the
slug; the extension stays the same.

| Canonical                  | Archive                              |
|----------------------------|--------------------------------------|
| `0001-anchor-essay.md`     | `.archive/0001-anchor-essay.v1.md`   |
| `transport-launch.md`      | `.archive/transport-launch.v1.md`    |
| `helioy.config.json`       | `.archive/helioy.config.v1.json`     |
| `notes.draft.md`           | `.archive/notes.draft.v1.md`         |

For docs with multiple dotted segments, treat the final dotted
suffix as the extension. The rest is the basename.

## Archive directory

Hidden directory `.archive/` sits next to the doc, in the same
parent. One archive per parent directory; all docs in the same
parent share the archive.

```
~/.mdx/blog/
  0001-anchor-essay.md
  0010-claude-code-pins-you-to-1m.md
  .archive/
    0001-anchor-essay.v1.md
    0001-anchor-essay.v2.md
    0010-claude-code-pins-you-to-1m.v1.md
```

Archive contents are append-only by convention. Never edit a
versioned file in place. If a snapshot was taken in error, take
another snapshot of the canonical state to mark the next version
and continue.

## Output

After a successful snapshot:

```
Snapshotted: <canonical_path>
  → <archive_path>
Version: v<N>
Canonical ready for v<N+1> edits.
```

After a skipped snapshot (canonical unchanged since latest archive):

```
Skipped: <canonical_path>
  Latest archive v<N> is byte-identical. No snapshot taken.
```

After a missing canonical:

```
No canonical at <path>. Nothing to preserve.
```

One block per snapshot call. The caller proceeds to the edit.

## Rules

- Run before material edits, not after. A snapshot taken after an
  edit preserves the wrong version.
- One snapshot per edit cycle. Avoid snapshotting twice in a row
  without intervening edits; the archive grows without signal.
- Default to `mv` when a Write call follows immediately. Use `cp`
  when the canonical must stay readable during a long edit pass.
- Skip silently when the canonical does not exist or is
  byte-identical to the latest archive entry. Surface a one-line
  note; do not error.
- Never edit archive contents. The archive is append-only.
- The canonical path always holds the latest. Readers, tools, and
  links point at the canonical; the archive is for diff and
  rollback only.
- Never snapshot inside `.archive/` itself. Skip silently if the
  caller passes an archive path by mistake.
- Do not modify frontmatter during the snapshot. The archived file
  is a byte copy of the prior canonical. The new canonical's
  frontmatter belongs to the editor that follows.
