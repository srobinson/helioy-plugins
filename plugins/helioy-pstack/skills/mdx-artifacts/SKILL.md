---
name: mdx-artifacts
description: "Choose and verify storage for agent artifacts. Use when work produces a review, research report, architecture or design document, plan, decision record, session trail, handoff, reusable verification file, or delegated report that may matter after the current turn."
---

# MDX artifacts

Classify an artifact before choosing its path.

| Class | Location |
| --- | --- |
| Persistent research, review, or audit | `~/.mdx/research/` |
| Persistent architecture, design, specification, or plan | `~/.mdx/design/` |
| Persistent decision | `~/.mdx/decisions/` |
| Persistent session trail or handoff | `~/.mdx/sessions/` |
| Persistent project status or working knowledge | `~/.mdx/projects/` |
| Temporary worker or candidate material | `~/.mdx/TMP/pstack/<session>/` |
| Reproducible command output or transfer file | `/tmp` |
| Repository deliverable | A repository path only when the user asks or the repository already owns it |

Never keep the only copy of a genuine artifact in `/tmp`.

For persistent Markdown:

1. Read `~/.mdx/_schema.md` before writing.
2. Use its category, frontmatter, filename, and versioning rules.
3. Verify the final file exists and is readable.
4. Refresh the Markdown index when the `md_index` tool is available.
5. Return the absolute path.

For delegation, give each worker an exact artifact class and output path. Keep scratch separate from the final persistent artifact.
