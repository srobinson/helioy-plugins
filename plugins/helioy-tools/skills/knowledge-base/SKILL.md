---
name: knowledge-base
description: Manages the ~/.mdx knowledge base — a centralized markdown document store with 7 categories (research, decisions, design, sessions, projects, retrospectives, reference). Handles create, read, update, search, list, and versioning of documents with structured frontmatter.
---

# Knowledge Base Management (~/.mdx)

You manage a persistent knowledge base at `~/.mdx/`. Every document is a markdown file with YAML frontmatter. Follow these instructions exactly.

## Directory Structure

```
~/.mdx/
├── research/          # Research findings, literature reviews
├── decisions/         # Architecture Decision Records (ADRs)
├── design/            # Design documents, RFCs, architecture docs
├── sessions/          # Session summaries, meeting notes
├── projects/          # Per-project status, context
├── retrospectives/    # Post-mortems, lessons learned
├── reference/         # Stable reference material, guides
└── _schema.md         # Frontmatter contract
```

Each category directory contains a `_versions/` subdirectory for historical versions.

## Category Selection Guide

| Category | Use when the document... |
|---|---|
| `research` | Captures findings, analysis, literature reviews, explorations |
| `decisions` | Records a decision and its rationale (ADR-style) |
| `design` | Describes architecture, RFCs, system design, technical plans |
| `sessions` | Summarizes a work session, meeting, or pairing session |
| `projects` | Tracks per-project status, context, or overview |
| `retrospectives` | Reflects on what happened — post-mortems, lessons learned |
| `reference` | Contains stable guides, cheatsheets, how-tos, conventions |

When in doubt, prefer `research` for exploratory content and `reference` for settled content.

## Frontmatter Contract

Every document MUST have this frontmatter block:

```yaml
---
title: "Human-readable document title"
type: research | decisions | design | sessions | projects | retrospectives | reference
tags: [tag1, tag2]
summary: "One-line summary of the document"
status: draft | active | superseded | archived
created: YYYY-MM-DD   # set to current date on creation
updated: YYYY-MM-DD   # set to current date on every write
---
```

### Required fields (author provides):

- `title` (string) — Human-readable document title
- `type` (string) — Must match the category directory name. One of: research, decisions, design, sessions, projects, retrospectives, reference
- `tags` (string[]) — Freeform tags for cross-cutting concerns
- `summary` (string) — One-line summary
- `status` (string) — Must be one of: draft, active, superseded, archived

### Auto-managed fields (you set these):

- `created` (ISO date, YYYY-MM-DD) — Set on first write. Never change after creation.
- `updated` (ISO date, YYYY-MM-DD) — Set to current date on every write.

### Optional fields:

- `project` (string) — Associated Helioy project: am, fmm, nancyr, mdcontext, helioy
- `related` (string[]) — Slugs of related documents
- `confidence` (string) — One of: high, medium, low, speculative
- `supersedes` (string) — Slug of the document this replaces

## Filename Conventions

- Kebab-case slugs only: `helioy-architecture.md`, `cli-wrapping-default.md`
- No dates in filenames (dates live in frontmatter)
- No spaces or special characters
- No numeric prefixes
- The slug is the filename without `.md`

## Operations

### 1. Create

1. Determine the correct category from the category selection guide.
2. Choose a kebab-case slug for the filename.
3. Ensure the directory exists: `mkdir -p ~/.mdx/<category>/_versions/`
4. Confirm the file does NOT already exist at `~/.mdx/<category>/<slug>.md`. If it does, this is an Update, not a Create.
5. Write the file at `~/.mdx/<category>/<slug>.md` with valid frontmatter and markdown body.
6. The `type` field MUST match the category directory name.

### 2. Read

- If given a slug: search across all category directories for `<slug>.md` using glob `~/.mdx/*/<slug>.md`. If multiple matches exist across categories, present all matches and ask the user to specify the category.
- If given a category and slug: read directly from `~/.mdx/<category>/<slug>.md`
- If given a full path: read directly

### 3. Update

Determine whether the change is minor or substantive:

**Minor edit (typo, formatting, small correction):**
1. Edit the file in place.
2. Update the `updated` field to the current date.
3. Do NOT create a version.

**Substantive revision (new sections, changed conclusions, rewritten content, or changes altering >20% of content):**
1. Determine the next version number by listing `~/.mdx/<category>/_versions/<slug>.v*.md`
2. **MOVE** (not copy) the current file: `mv ~/.mdx/<category>/<slug>.md ~/.mdx/<category>/_versions/<slug>.v<N>.md`
3. Write the NEW version at `~/.mdx/<category>/<slug>.md` with updated content.
4. Set `updated` to the current date. Do NOT change `created`.

**CRITICAL**: Step 2 MUST happen BEFORE step 3. Move first, then write new.

### 4. Search

- **By category:** List files in `~/.mdx/<category>/` (exclude `_versions/`)
- **By tag:** Grep for the tag within frontmatter `tags:` lines across all `~/.mdx/*/*.md` files
- **By content:** Grep for the search term across all `~/.mdx/*/*.md` files
- **By status:** Grep for `status: <value>` across all documents
- **By project:** Grep for `project: <value>` across all documents

### 5. List

- **Single category:** Glob `~/.mdx/<category>/*.md`, read frontmatter, present as table.
- **All categories:** Glob `~/.mdx/*/*.md` (exclude `_versions/` and `_schema.md`), group by category.

### 6. Version History

1. Find the current document at `~/.mdx/<category>/<slug>.md`
2. List all files matching `~/.mdx/<category>/_versions/<slug>.v*.md`
3. Sort by version number ascending and present chronologically

## Initialization

If `~/.mdx/` does not exist when you need it, create the full structure:

```bash
mkdir -p ~/.mdx/{research,decisions,design,sessions,projects,retrospectives,reference}/_versions
```

Then create `~/.mdx/.mdcontextignore` with `_versions/` if it does not exist.

## Rules

- Always validate that `type` matches the directory the file lives in.
- Never write a document without all required frontmatter fields.
- Always set `updated` to the current date on any write.
- Never modify `created` after initial creation.
- When the user says "save this", "remember this", or "store this" — create a new knowledge base document.
- When the user asks "what do we know about X" — search the knowledge base.
- Use the knowledge base for structured, titled documents. Use AM memory (the memory skill) for conversational recall and session continuity. They serve different purposes.
