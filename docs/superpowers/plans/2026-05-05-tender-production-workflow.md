# Tender Production Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth Linear workflow `tender-production-workflow.md` that turns an approved brief plus existing background research into a client-ready showcase pack via Nancy's two-agent loop, with a persistent outcome-shape registry stored in cm and mirrored to a markdown file.

**Architecture:** One new workflow markdown file inside the existing `linear-workflows` skill, one new line of routing in the skill's `SKILL.md`, and a new sibling directory holding a generated registry mirror. No code changes. No selector changes (provisional, with documented fallbacks per spec).

**Tech Stack:** Markdown, Linear MCP tools, cm MCP tools (for registry), Nancy two-agent loop (existing).

**Spec:** `docs/superpowers/specs/2026-05-05-tender-production-workflow-design.md`.

---

## File Structure

Created or modified by this plan:

| Path | Action | Responsibility |
|------|--------|----------------|
| `helioy-plugins/plugins/helioy-tools/linear-workflows/` | Create dir | Sibling-of-skill location for the registry mirror per the spec. |
| `helioy-plugins/plugins/helioy-tools/linear-workflows/tender-shapes.md` | Create | Read-only markdown mirror of cm tender-shape entries. Empty header at first. |
| `helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md` | Create | The new workflow document. Selector compatible. Mirrors the structure of the three existing workflow files. |
| `helioy-plugins/plugins/helioy-tools/skills/linear-workflows/SKILL.md` | Modify | Add one bullet to the Workflow Routing section. |

No tests in the traditional sense; "verification" for skill authoring is structural review and a syntactic dry-run with a fake brief. Both are checked in Task 4.

---

## Task 1: Create the registry mirror skeleton

**Files:**
- Create dir: `/Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/linear-workflows/`
- Create: `/Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/linear-workflows/tender-shapes.md`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/linear-workflows
```

Expected: directory exists.

- [ ] **Step 2: Write the registry mirror file**

Write to `/Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/linear-workflows/tender-shapes.md`:

```markdown
# Tender Outcome Shape Registry

Read-only mirror of cm entries with `kind=pattern`, scope=global, tag=tender-shape.

Auto-regenerated at the end of every tender's post execution review by the workflow at `skills/linear-workflows/workflows/tender-production-workflow.md`. Hand edits are not authoritative. Edit the cm entries via `cx_update`; the next post execution review regenerates this file.

## Shapes

(none yet)

## Stale shapes

Shapes with `shipped` older than 12 months are listed here with a stale marker. Use `cx_forget` to remove them.

(none yet)
```

- [ ] **Step 3: Verify file contents**

```bash
cat /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/linear-workflows/tender-shapes.md
```

Expected: prints the content above.

- [ ] **Step 4: Commit**

```bash
cd /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins
git add plugins/helioy-tools/linear-workflows/tender-shapes.md
git commit -m "$(cat <<'EOF'
feat: add tender shape registry mirror skeleton

Empty mirror file for cm pattern entries with tag=tender-shape.
Auto-regenerated at the end of each tender post execution review.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: one commit.

---

## Task 2: Write the new workflow document

**Files:**
- Create: `/Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md`

- [ ] **Step 1: Write the workflow file**

Write to the path above:

````markdown
# Tender Production Workflow

Use this workflow when an approved brief and existing background research must be turned into a client-ready showcase pack of polished deliverables.

## Purpose

Produce a reviewed Linear issue graph, then run two-agent autonomous execution that turns curated research into a client-ready artifact set under one Showcase Pack execution parent.

This workflow is the editorial counterpart to `nancy-two-agent-planning-gate`. It assumes background research has already been done. It does not authorize new research. It authorizes synthesis, drafting, review, and shipping.

## Source Of Truth

Linear is durable state.

The brief lives in the master parent description. Outcome shape templates live in cm. The markdown mirror at `helioy-plugins/plugins/helioy-tools/linear-workflows/tender-shapes.md` is a regenerated copy.

Use HANDOVER.md only for coordination between the two live agents.

## Bootstrap Shape

Create this skeleton before starting the workflow:

```text
master parent: <Project> Tender
├── Kickoff: select outcome shape   (Todo, planning)
├── Gate review: tender authorization   (Todo)
└── Showcase Pack   (Backlog parent, Todo)
    └── Post execution review   (Todo, seeded last)
```

The master parent description is the brief. Required fields, in order:

- Client.
- Engagement frame.
- Voice and register.
- Research location.
- Success criteria.
- Constraints.
- Out of scope.

If any required field is empty or vague, the kickoff issue exits `Needs human direction` with the specific field named. No silent inference.

## Kickoff

The kickoff issue is one session sized.

Codex reads the brief, queries cm for prior tender shapes (`kind=pattern`, scope=global, tag=tender-shape), and writes a numbered list of candidate shapes in the issue body. Each candidate states shape name, client kind, artifact count, source project, ship date. The list always includes a `design a new shape` option. Shapes with `shipped` older than 12 months are marked stale.

Stuart picks one in the comments.

If Stuart picks an existing shape, Codex seeds the Showcase Pack Backlog from that shape and writes the gate review.

If Stuart picks `design a new shape`, the workflow branches into a discovery planning issue. See `Discovery Branch`.

## Issue Placement

Use this placement rule:

```text
Kickoff and discovery contain planning.
Showcase Pack contains executable artifact production.
Gate review authorizes the artifact set.
Post execution review records outcomes and updates the registry.
```

Showcase Pack issues are candidates until gate review authorizes them. Each issue should state:

- Artifact id and name.
- Audience, the actual reader.
- Voice register applied.
- Source files from the research dir.
- Success criteria.
- Output path inside the research dir, numbered after existing files.
- Dependencies, when relevant.

Showcase Pack candidate status stays Todo until gate authorization.

## Agent Roles

Codex authors artifacts.

- Reads HANDOVER.md before acting.
- Reads the brief, the source research files named in the issue, the chosen shape entry, and prior produced artifacts in Showcase Pack.
- Writes the artifact to its declared output path inside the research directory.
- Updates the Showcase Pack issue with the artifact path and a one-paragraph summary of editorial choices: voice register applied, sections cut, sources leaned on.
- Marks the issue Worker Done.

Claude reviews artifacts.

- Reviews the latest Codex authored artifact.
- Editorial review checklist:
  - Voice register matches the brief.
  - House rules clean: no em dashes, hyphen discipline, no `X not Y` pattern, no slop phrases.
  - Forwardability: would the named reader understand without follow-up.
  - Source fidelity: claims trace to research files, no fabricated citations.
  - Audience literacy match.
  - Self-contained.
  - Length discipline.
- Marks the issue Worker Done when accepted.
- Records contest findings in HANDOVER.md when changes are required.

## Reviewer Exit Rule

Each Claude review turn ends with one action:

1. Accept. Mark the artifact issue Worker Done.
2. Contest. Leave the issue open. Record required edits in HANDOVER.md.
3. Needs human direction. Use only for editorial calls Stuart must make, e.g. tone too sharp, framing the client may reject.

Non-blocking notes do not prevent acceptance.

## Cross-Artifact Coherence Pass

When the second-to-last Showcase Pack artifact is accepted, Claude runs an extra coherence turn checking the pack as a whole:

- Terminology consistency across artifacts.
- No contradictions between artifacts.
- Cover note matches the artifacts it announces.
- Forwarding chain references hold across the pack.

Issues found here route back as contests on specific Showcase Pack issues.

The coherence pass is folded into the existing `post_execution_review` selector mode. It is not a new mode.

## Discovery Branch

When Stuart picks `design a new shape`:

1. Kickoff stays open.
2. Create a planning issue under master parent named `Discovery: propose artifact set`.
3. Codex audits the brief and the research dir. Proposes 4 to 8 candidate artifacts as Showcase Pack candidates with full scope per `Issue Placement`.
4. Claude reviews scope and sequencing. Accepts or contests.
5. Once accepted, kickoff and discovery both close. Showcase Pack candidates are seeded. Gate review is written.

The new shape is not deposited in cm until the pack ships.

## Outcome Shape Registry

cm is the source of truth.

- Kind: pattern.
- Scope: global.
- Tag: tender-shape.

Body shape:

```yaml
shape_name: <kebab-case>
client_kind: <one phrase>
audience: <one phrase>
voice: <one phrase>
artifacts:
  - id: <kebab-case>
    purpose: <one sentence>
    inputs: [list of source file slugs or section names]
source_project: <project slug>
shipped: <YYYY-MM-DD>
```

The markdown mirror at `helioy-plugins/plugins/helioy-tools/linear-workflows/tender-shapes.md` is regenerated at the end of every post execution review.

Hand edits to the markdown mirror are not authoritative. Stuart edits the cm entry via `cx_update`. The next post execution review regenerates the file.

Shapes with `shipped` older than 12 months are surfaced in kickoff with a stale marker. `cx_forget` removes them.

### New shape capture

The `design a new shape` branch does not deposit a registry entry until the tender ships.

The post execution review derives the executed shape from the actually produced artifacts: artifact ids, purposes, inputs, source project, ship date. It asks Stuart only for the human-judgement fields before depositing: `shape_name`, `client_kind`, `audience`, `voice`.

If Stuart does not respond within the post execution review turn, the registry deposit is deferred and the master parent stays open with a `pending registry capture` note.

## Mid-Flight Artifact Addition

If a coherence pass or review surfaces a missing artifact:

1. Codex creates the new Showcase Pack issue with full scope.
2. Codex updates the gate review description to extend the `Execute:` list to include the new issue id.
3. Nancy's selector picks it up on the next turn.

This mirrors corrective issue handling in `post-execution-review-workflow`.

## Editorial Dissent on Shipped Artifact

Stuart re-opens the Showcase Pack issue with new edit instructions.

Tender deliverables iterate on the artifact, not as downstream corrective issues.

If Nancy's selector does not re-pick a reopened Worker Done issue under an already-accepted gate, fall back to the corrective pattern: file a corrective issue under Showcase Pack and extend the gate `Execute:` list to include it. The corrective issue carries the new edit instructions.

## Selector Compatible Gate Text

Tender authorization, recorded by gate review after kickoff acceptance:

```text
Tender authorization complete. Outcome: Ready for execution.
Authorized execution parent: `SHOWCASE-PACK-ID`.
Selected shape: <shape_name from registry, or 'new shape'>.
Brief: master parent <ID>.
Research: <absolute path>.
Execute: ARTIFACT-1, ARTIFACT-2, ..., REVIEW-ID.
Required order: <if dependencies, e.g. cover note last>.
```

Tender shipped, recorded by post execution review on the master parent:

```text
Tender shipped. Outcome: <count> artifacts produced under <SHOWCASE-PACK-ID>.
Shape: <shape_name>. New shape: <yes or no>.
Artifacts: ARTIFACT-1 -> <path>, ARTIFACT-2 -> <path>, ...
Registry: cm pattern <id> deposited; tender-shapes.md regenerated.
Coherence pass: <accepted | issues fixed in turns N to M>.
Master parent closing.
```

Needs human direction follows the same shape as the existing workflows.

## Failure Modes

- Brief gaps. Kickoff exits `Needs human direction` naming the missing field.
- Thin or contradictory source research. Individual Showcase Pack issue exits `Needs human direction` naming the gap. Pack-level review continues on other artifacts.
- Editorial dissent on shipped artifact. Reopen the issue with new edit instructions, or use the corrective fallback above.
- Stale registry entry picked. If a chosen shape's inputs reference research files that no longer exist, kickoff exits `Needs human direction` and asks Stuart to revise the shape or pick a new one.

## State Ownership

- Kickoff issue ends Worker Done after Stuart picks and Codex records the pick.
- Discovery planning issue, when used, ends Worker Done after Claude accepts.
- Showcase Pack artifact issues end Worker Done after Claude accepts.
- Gate review ends Worker Done when authorization text is recorded.
- Post execution review ends Done after the registry is updated and the master parent closes.
- Master parent ends Worker Done when no authorized child remains open and the selector has no eligible issue.
````

- [ ] **Step 2: Verify section parity with sibling workflows**

```bash
grep -E "^## " /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
```

Expected: includes `Purpose`, `Source Of Truth`, `Bootstrap Shape`, `Issue Placement`, `Agent Roles`, `Reviewer Exit Rule`, `Selector Compatible Gate Text`, `Failure Modes`, `State Ownership` headers, plus tender-specific sections (`Kickoff`, `Cross-Artifact Coherence Pass`, `Discovery Branch`, `Outcome Shape Registry`, `Mid-Flight Artifact Addition`, `Editorial Dissent on Shipped Artifact`).

- [ ] **Step 3: Verify selector-compatible gate text format**

```bash
grep -A 7 "Authorized execution parent" /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
```

Expected: gate text block contains backticked `SHOWCASE-PACK-ID` and `Execute:` line.

- [ ] **Step 4: House-rules check**

```bash
grep -nE "[—–]|, not " /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
```

Expected: no em-dash hits, no `X not Y` pattern. If any line surfaces, fix it inline before commit.

- [ ] **Step 5: Commit**

```bash
cd /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins
git add plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
git commit -m "$(cat <<'EOF'
feat: add tender production workflow

Fourth workflow under linear-workflows. Selector compatible. Turns an
approved brief plus existing background research into a client-ready
showcase pack via Nancy's two-agent loop. Editorial counterpart to
nancy-two-agent-planning-gate.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: one commit.

---

## Task 3: Update SKILL.md routing

**Files:**
- Modify: `/Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/SKILL.md`

- [ ] **Step 1: Find the existing Workflow Routing block**

```bash
grep -n "Workflow Routing" /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/SKILL.md
```

Expected: one match. Note the line number for orientation.

- [ ] **Step 2: Append the new routing bullet**

Use Edit to add a fourth bullet beneath the three existing ones in the `## Workflow Routing` section. The exact change:

Old block:

```markdown
- Use [Nancy Two Agent Planning Gate](workflows/nancy-two-agent-planning-gate.md) when Linear must be populated or reviewed before implementation, especially when audit, scope discovery, or pre execution blockers may exist.
- Use [Agent Issue Review Workflow](workflows/agent-issue-review-workflow.md) when issues already exist and need readiness review before Nancy or another worker starts.
- Use [Post Execution Review Workflow](workflows/post-execution-review-workflow.md) after worker issues have been implemented and need one-target autonomous review outcome recording or corrective issue creation.
```

New block:

```markdown
- Use [Nancy Two Agent Planning Gate](workflows/nancy-two-agent-planning-gate.md) when Linear must be populated or reviewed before implementation, especially when audit, scope discovery, or pre execution blockers may exist.
- Use [Agent Issue Review Workflow](workflows/agent-issue-review-workflow.md) when issues already exist and need readiness review before Nancy or another worker starts.
- Use [Post Execution Review Workflow](workflows/post-execution-review-workflow.md) after worker issues have been implemented and need one-target autonomous review outcome recording or corrective issue creation.
- Use [Tender Production Workflow](workflows/tender-production-workflow.md) when an approved brief and existing background research must be turned into a client-ready showcase pack of polished deliverables.
```

- [ ] **Step 3: Verify the link target exists**

```bash
ls /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
```

Expected: file exists from Task 2.

- [ ] **Step 4: Commit**

```bash
cd /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins
git add plugins/helioy-tools/skills/linear-workflows/SKILL.md
git commit -m "$(cat <<'EOF'
feat: route tender production workflow in linear-workflows skill

Add a fourth bullet to Workflow Routing for tender production. Pointer
only; no behavior change to the three existing routes.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Expected: one commit.

---

## Task 4: Validation pass

No new files. Verify the integrated state.

- [ ] **Step 1: Confirm all four workflow files are listed and present**

```bash
ls /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/
```

Expected: four files. `agent-issue-review-workflow.md`, `nancy-two-agent-planning-gate.md`, `post-execution-review-workflow.md`, `tender-production-workflow.md`.

- [ ] **Step 2: Confirm SKILL.md routes all four**

```bash
grep -c "Use \[" /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/SKILL.md
```

Expected: 4.

- [ ] **Step 3: Confirm registry mirror exists**

```bash
ls /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/linear-workflows/tender-shapes.md
```

Expected: file exists.

- [ ] **Step 4: Selector compatibility spot-check**

```bash
grep -A 3 "^## Selector Compatible Gate Text" /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
```

Expected: gate text block follows the same shape as the existing workflows: backticked authorized parent id, `Execute:` line.

- [ ] **Step 5: Cross-reference integrity**

```bash
grep -n "post-execution-review-workflow\|nancy-two-agent-planning-gate" /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins/plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
```

Expected: at least two references resolve to existing sibling files.

- [ ] **Step 6: No commit**

If any of the above fail, fix the offending file in place. Re-run the failing step until it passes. No new commit unless a fix was applied; in which case use `git commit --amend` or a follow-up commit per the user's preference. Default: follow-up commit.

---

## Task 5: Syntactic dry-run with a fake brief

The workflow runs against Linear under Nancy. A real end-to-end run requires Linear MCP and Nancy. This step does a paper dry-run to surface gaps in the workflow text before the first real tender.

**Files:**
- Read only.

- [ ] **Step 1: Mentally walk a fake brief through the workflow**

Use this fake brief as the master parent description:

```markdown
# Tender: Fake Co Pitch

## Client
Fake Co. Reader is the founder Jane.

## Engagement frame
Bid against incumbent agency. Documents will be sent direct to Jane.

## Voice and register
House voice rules apply. Byline yes. Light formality. Founder-literate, not technical.

## Research location
~/.mdx/private/fake-co/

## Success criteria
- Forwardable to Jane without follow-up.
- Frames our differentiated value.
- Names a phase-one engagement plan.

## Constraints
Word count: total pack under 4000 words. No incumbent comparisons.

## Out of scope
Cost modeling. Contract terms.
```

Walk it through the workflow file. Check that the workflow tells you exactly:

- Where Codex gets the candidate shape list. (cm `kind=pattern`, tag=tender-shape.)
- What Codex does if cm has zero entries. (List should still include `design a new shape`; if no other entries, that is the only option.)
- How Stuart's pick is recorded. (Comment on kickoff issue.)
- What gate review writes. (Selector compatible gate text block.)
- Where artifacts get written. (Inside the research directory, numbered after existing files.)
- What ends up in cm at shipping time. (Pattern entry in the body shape from `Outcome Shape Registry`.)

Then verify selector compatibility of the gate text prefix:

- The skill's `SKILL.md` documents that the Bash selector parses the gate from "this exact shape" with the literal prefix `Planning complete.`. The new workflow uses `Tender authorization complete.`. Inspect the selector implementation to confirm it parses the backticked parent id from the `Authorized execution parent:` line independent of the prefix. If the parser requires the literal `Planning complete.` prefix, change the workflow's gate text to use it (and document the change in the workflow file). The selector source is in nancyr or nancy. Locate it before changing.

- [ ] **Step 2: Surface gaps**

If any of the questions in Step 1 cannot be answered by reading the workflow file alone, edit the workflow file to close the gap. Then re-run Step 1.

- [ ] **Step 3: Commit any fixes**

If the dry-run produced edits, commit them:

```bash
cd /Users/alphab/Dev/LLM/DEV/helioy/helioy-plugins
git add plugins/helioy-tools/skills/linear-workflows/workflows/tender-production-workflow.md
git commit -m "$(cat <<'EOF'
fix: close gaps surfaced by tender workflow dry-run

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

If no edits were needed, no commit. Skip.

---

## Done When

- Four files are listed in `workflows/`.
- `SKILL.md` routes all four.
- Registry mirror exists at the spec-declared path with skeleton content.
- Dry-run answers all six questions from Task 5 Step 1 without external input.
- No em-dashes, no `X not Y` pattern, no slop phrases in the new workflow file.
