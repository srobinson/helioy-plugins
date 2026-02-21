---
name: skill-creator
description: >
  Create new skills for the helioy-tools plugin. Use when the user asks to
  build, create, or add a new skill, or when you need to scaffold a skill
  as part of a task. Enforces Helioy plugin conventions — correct location,
  frontmatter, naming, MCP inheritance, and Linear issue structure.
---

# Skill Creator — helioy-tools

Create skills that live in the helioy-tools plugin. Every skill follows the
same conventions. This skill encodes those conventions so you don't have to
remember them.

## Where Skills Live

All Helioy skills go in one place:

```
~/Dev/LLM/DEV/helioy-plugins/plugins/helioy-tools/skills/<skill-name>/SKILL.md
```

Skills are distributed via the helioy-tools plugin. Users install the plugin
once; all skills come with it. Never create skills outside this path.

## Skill Structure

```
<skill-name>/
├── SKILL.md              # Required — instructions and frontmatter
├── scripts/              # Optional — executable code (Python/Bash)
├── references/           # Optional — documentation loaded as needed
└── assets/               # Optional — templates, files used in output
```

## SKILL.md Frontmatter

Only TWO fields are valid: `name` and `description`. Nothing else.

```yaml
---
name: kebab-case-name           # REQUIRED. Max 64 chars. [a-z0-9-] only.
description: >                  # REQUIRED. Max 1024 chars. No < >.
  What it does AND when to use it.
  This is the PRIMARY triggering mechanism.
---
```

### Rules

- `name` and `description` are the ONLY valid frontmatter fields
- Do NOT include any other fields: no `license`, no `allowed-tools`,
  no `metadata`, no `compatibility`, no `user-invocable`, no `hooks`,
  no `version` — all silently ignored or cause errors
- `description` is the PRIMARY TRIGGERING MECHANISM — it tells Claude
  WHEN to use the skill. All "when to use" info goes HERE, not in the body
- The body only loads AFTER triggering — the description triggers

## Naming

- Skill name in frontmatter: `kebab-case-name`
- Invoked as: `helioy-tools:<skill-name>` (plugin-name:skill-name)
- Directory name matches the `name` field

## MCP Tools Available

Every skill in helioy-tools inherits these MCP servers from the plugin's
`.mcp.json`. Do NOT re-declare them in the skill.

| Server | Package | Tools prefix |
|--------|---------|--------------|
| am | attention-matters | `mcp__plugin_helioy-tools_am__` |
| fmm | frontmatter-matters | `mcp__plugin_helioy-tools_fmm__` |
| mdx | mdcontext | `mcp__plugin_helioy-tools_mdx__` |
| linear-server | Linear HTTP | `mcp__plugin_helioy-tools_linear-server__` |

Reference these in skill instructions when relevant. Example: "Use
`am_query` to check memory before proceeding" — the agent already has
the tool, the skill just tells it when to use it.

## Writing the SKILL.md Body

### Principles

- **Concise is key.** The context window is shared. Only add what Claude
  doesn't already know. Under 500 lines, under 5k words.
- **Imperative form.** "Create the file" not "You should create the file."
- **Progressive disclosure.** Metadata always loaded (~100 words). Body
  loaded on trigger. References loaded as needed.
- **No README, CHANGELOG, or setup docs.** Just SKILL.md and resources.

### Degrees of Freedom

- **High freedom** (text instructions): multiple valid approaches,
  context-dependent. Use for strategy, workflow, decision-making skills.
- **Medium freedom** (pseudocode with parameters): preferred pattern
  exists, some variation. Use for most skills.
- **Low freedom** (specific scripts): operations are fragile, consistency
  critical. Use for deployment, data migration, CI/CD skills.

### Content Structure Pattern

Follow the existing Helioy skills:

1. Main heading matching the skill purpose
2. Clear sections with operational guidance
3. Tables for reference data
4. Rules section with MUST/NEVER constraints
5. Examples where helpful

## Creation Checklist

When creating a new skill, follow these steps in order:

### 1. Validate the Need

- Is this a recurring pattern? (One-time tasks don't need skills)
- Does an existing skill cover this? Check: `ls ~/Dev/LLM/DEV/helioy-plugins/plugins/helioy-tools/skills/`
- Would instructions in CLAUDE.md be sufficient instead?

### 2. Design

- Choose a kebab-case name
- Write the description — WHAT and WHEN (this is the trigger)
- Decide freedom level (high/medium/low)
- Identify what MCP tools the skill will reference
- Identify any scripts or references needed

### 3. Create

```bash
mkdir -p ~/Dev/LLM/DEV/helioy-plugins/plugins/helioy-tools/skills/<name>
```

Write `SKILL.md` with valid frontmatter and body. If the skill needs
scripts or references, create those subdirectories.

### 4. Validate

Check frontmatter:
- `name` present, kebab-case, max 64 chars?
- `description` present, max 1024 chars, no angle brackets?
- No other fields present? (only `name` and `description` are valid)
- Description states WHAT and WHEN?

### 5. Document in Linear

When creating a Linear issue for a new skill, include:

- **Title**: "Build helioy-tools:<skill-name> skill"
- **Location**: `helioy-plugins/plugins/helioy-tools/skills/<name>/SKILL.md`
- **MCP tools available**: AM, FMM, mdx, Linear (inherited from plugin)
- **Frontmatter**: name and description only
- **Acceptance criteria**: skill created at correct path, invocable as
  `helioy-tools:<name>`, follows conventions in this document

### 6. Test

Invoke the skill by asking Claude to do the thing the skill handles.
Verify it triggers correctly (from the description) and produces the
expected behavior.

## Existing Skills Reference

These 9 skills already exist in the plugin. Use them as patterns:

| Skill | Purpose | Pattern |
|-------|---------|---------|
| memory | AM session lifecycle | High freedom — behavioral protocol |
| knowledge-base | ~/.mdx document management | Medium freedom — CRUD operations |
| linear-workflow | Linear issue conventions | Medium freedom — templates + rules |
| fmm | MCP-first code navigation + sidecar fallback | Low freedom — tool chain |
| create-spec | Requirements elicitation | Medium freedom — interactive workflow |
| check-directives | Orchestrator polling | Low freedom — specific check |
| nancy-orchestrator | Worker supervision | High freedom — monitoring |
| nancy-send-message | Agent messaging | Low freedom — specific protocol |
| nancy-update-spec | Spec completion tracking | Low freedom — specific update |

## Anti-patterns

- Creating skills outside the plugin directory
- Using invalid frontmatter fields
- Putting "when to use" in the body instead of the description
- Duplicating MCP tool declarations that the plugin already provides
- Making skills too long (>500 lines) — use references/ for overflow
- Creating skills for one-time operations
