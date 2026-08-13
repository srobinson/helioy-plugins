---
name: pull-request
description: >
  Create pull requests with conventional commit titles for squash merge.
  Use when creating PRs, preparing branches for merge, or when the user
  says "create a PR", "open a PR", "prepare for merge", or "push this".
---

# Pull Request Workflow

All helioy repos use squash merge. The PR title becomes the squash commit message, which release-please parses to generate changelogs and version bumps.

## PR Title Format

PR titles MUST follow the Conventional Commits specification:

```
<type>(<scope>): <description>
```

### Types

| Type | When | Appears in changelog |
|------|------|---------------------|
| `feat` | New feature or capability | Yes (Features) |
| `fix` | Bug fix | Yes (Bug Fixes) |
| `perf` | Performance improvement | Yes (Performance) |
| `refactor` | Code restructuring, no behavior change | Hidden |
| `docs` | Documentation only | Hidden |
| `test` | Adding or updating tests | Hidden |
| `chore` | Maintenance, deps, CI | Hidden |
| `ci` | CI/CD changes | Hidden |

### Scope

Optional. Use the crate or component name when the change is localized:

```
feat(cm-store): add FTS5 prefix query support
fix(cm-cli): handle broken pipe on MCP shutdown
refactor(cm-core): extract ScopePath validation
```

Omit scope for cross-cutting changes:

```
feat: implement tools.toml codegen pipeline
chore: update workspace dependencies
```

### Examples

```
feat: implement cx_recall tool with FTS5 search
feat(cm-store): add content deduplication via BLAKE3
fix: remove isError flag from MCP error responses
refactor: split monolithic tools.rs into per-tool modules
test: add 31 integration tests for MCP tool handlers
chore: add CI and release workflows
docs: update CLAUDE.md with tool conventions
perf(cm-store): optimize scope ancestor walk query
```

## Branch Commits

Branch commits do NOT need conventional commit format. The existing convention works fine:

```
worker[ALP-1400]: Implement tools.toml codegen pipeline
review[ALP-1367]: Fix MCP instructions placement
```

Only the PR title matters for release-please.

## Workflow

1. Push branch to remote with `-u` flag
2. Create PR with `gh pr create`
3. PR title follows conventional commits format above
4. PR body includes summary bullets and test plan
5. Squash merge into main preserves the PR title as the commit message

## PR Body Template

```markdown
## Summary
- <bullet points describing what changed and why>

## Test plan
- [ ] All workspace tests pass (`just test`)
- [ ] Clippy clean (`just check`)
- [ ] <additional verification steps>
```
