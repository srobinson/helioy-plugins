# Tender Production Workflow Design

Status: design accepted, awaiting user spec review.
Date: 2026-05-05.
Owner: Stuart.
Skill: `helioy-tools:linear-workflows`.

## Purpose

Add a fourth workflow to `linear-workflows` that takes an approved brief plus existing background research and produces a client-ready showcase pack of polished deliverables, autonomously, through Nancy's two-agent loop.

The workflow is Nancy selector compatible. It is the analytical and editorial counterpart to the three existing implementation-focused workflows.

## Scope

In scope:

- A new workflow file `workflows/tender-production-workflow.md`.
- An update to `SKILL.md` adding routing for the new workflow.
- A persistent template registry stored in cm and mirrored to a markdown file in the skill directory.
- Selector-compatible gate texts and bootstrap shape.

Out of scope:

- Changes to the three existing workflow files.
- Tooling to generate the markdown registry mirror (handled by post-execution review steps in the workflow itself, not separate code).

Provisionally out of scope, flagged as implementation-time checkpoints:

- Changes to Nancy's selector logic. The bootstrap shape is selector compatible on paper, but two areas may surface a real dependency:
  - Cross-artifact coherence pass. Existing selector modes do not include "review the pack as a whole." Preferred resolution without selector change: fold the coherence pass into the existing `post_execution_review` mode, or encode it as a synthetic Backlog issue at the end of the artifact list. Escalate to a selector change only if neither resolution holds.
  - Editorial reopen of shipped artifact. If a Worker Done Backlog issue is reopened to Todo after gate authorization, the selector must pick it up again. If it does not, route editorial dissent through a corrective issue under the authorized parent, with the gate `Execute:` list extended to include the corrective issue, mirroring the existing post-execution corrective pattern.

## Inputs

- A brief written by Stuart into the master parent description. Required fields: client, engagement frame, voice and register, research location, success criteria, constraints, out of scope.
- Existing background research at the absolute path stated in the brief (typically `~/.mdx/private/<project>/`).
- A persistent registry of prior tender shapes, queryable in cm and visible as `~/.agents/skills/linear-workflows/tender-shapes.md`.

## Outputs

- A set of client-ready artifacts written to paths inside the research directory, numbered after the existing files.
- A new pattern entry deposited in cm (`kind=pattern`, scope=global, tag=tender-shape) capturing the executed shape.
- Regenerated `tender-shapes.md` mirror.
- A closed master parent in Linear with the post-execution outcome comment.

## Trigger

Stuart creates the master parent issue with the brief and tells Nancy to run the tender production workflow against it.

## Linear Bootstrap Shape

```text
Master parent: <Project> Tender   (Todo)
├── Kickoff: select outcome shape   (Todo, planning)
├── Gate review: tender authorization   (Todo)
└── Showcase Pack   (Backlog parent, Todo)
    └── Post execution review   (Todo, seeded last)
```

The kickoff issue is one session sized. It reads the brief, queries cm for prior tender shapes, and writes a numbered list of candidate shapes in the issue body. Each candidate states shape name, client kind, artifact count, source project, ship date. The list always includes a "design a new shape" option.

Stuart picks one in the comments. If he picks an existing shape, Codex seeds the Showcase Pack Backlog from that shape and writes the gate review. If he picks "design a new shape," the workflow branches into a discovery planning issue.

## Outcome Shape Registry

Two stores. cm is the source of truth. Markdown is a regenerated human-readable mirror.

### cm entries

- Kind: pattern.
- Scope: global.
- Tag: tender-shape.
- Body shape:

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

### Markdown mirror

Path: `~/.agents/skills/linear-workflows/tender-shapes.md`.

Auto-regenerated at the end of every post-execution review by the workflow steps. Hand edits are not authoritative. Stuart edits the cm entry via `cx_update`; the next post-execution review pass regenerates the file.

### Stale shape policy

Shapes with `shipped` older than 12 months are surfaced in the kickoff list with a stale marker. Stuart can soft-delete via `cx_forget` from the kickoff issue.

### New shape capture

The "design a new shape" branch does not deposit a registry entry until the tender ships. The post-execution review derives the executed shape from the actually-produced artifacts (artifact ids, purposes, inputs, source project, ship date) and asks Stuart only for the human-judgement fields before depositing: `shape_name`, `client_kind`, `audience`, `voice`. If Stuart does not respond within the post-execution review turn, the registry deposit is deferred and the master parent stays open with a `pending registry capture` note.

## Brief Structure

Master parent description, in order:

```markdown
# Tender: <Project Name>

## Client
Who is the client. Who is the actual reader. Forwarding chain if any.

## Engagement frame
Why this tender exists. The mode (bid against, collaborate, advise). What the client will do with these documents.

## Voice and register
House voice rules apply (no em dashes, hyphen discipline, no "X not Y" pattern). Plus tender-specific register: byline yes/no, formality, technical depth, audience literacy.

## Research location
Absolute path. Expected file numbering or shape. Note any files to ignore.

## Success criteria
What "client-ready" means for this tender. Three to five bullets, specific.

## Constraints
Hard constraints. Word count caps, omissions, deadlines, IP boundaries.

## Out of scope
What this tender will not contain.
```

If any required field is empty or vague, the kickoff issue exits `Needs human direction` with the specific field named. No silent inference.

## Author and Review Loop

Same two-agent loop as `nancy-two-agent-planning-gate`, retuned for prose deliverables.

### Codex authors artifacts

- One Backlog issue per turn.
- Reads: brief, the source research files named in the issue, the chosen shape entry, and prior produced artifacts in the Showcase Pack.
- Writes the artifact to its declared output path inside the research directory, numbered after existing files.
- Updates the Backlog issue with the artifact path and a one-paragraph summary of editorial choices (voice register applied, sections cut, sources leaned on).
- Marks the Backlog issue Worker Done, leaves it for Claude review.

### Claude reviews

The review is editorial, not architectural. Checklist:

- Voice register matches the brief.
- House rules clean: no em dashes, hyphen discipline, no "X not Y" pattern, no slop phrases.
- Forwardability: would the named reader understand without follow-up.
- Source fidelity: claims trace to research files, no fabricated citations.
- Audience literacy match.
- Self-contained: artifact reads on its own.
- Length discipline: tighter than first draft.

Each review turn ends in one of:

- **Accept.** Worker Done stands.
- **Contest.** Re-open and record specific edits required in `HANDOVER.md`.
- **Needs human direction.** Editorial calls only Stuart can make (tone, framing the client may reject).

### Cross-artifact coherence pass

When the second-to-last Backlog artifact is accepted, an extra Claude turn checks the pack as a whole: terminology consistency, contradictions, cover note matches the artifacts it announces. Issues route back as contests on specific Backlog issues.

### Editorial dissent on shipped artifact

Stuart re-opens the Backlog issue with new edit instructions. Tender deliverables iterate on the artifact, not as downstream corrective issues.

If Nancy's selector does not re-pick a reopened Worker Done Backlog issue under an already-accepted gate, fall back to the corrective pattern: file a corrective issue under the Showcase Pack, extend the gate's `Execute:` list to include it, and let the corrective issue carry the new edit instructions.

## Discovery Branch

When Stuart picks "design a new shape":

1. Kickoff issue stays open.
2. A second planning issue is created under the master parent, named `Discovery: propose artifact set`.
3. Codex audits the brief and the research dir. Proposes 4–8 candidate artifacts as Backlog candidates, each one session sized with: artifact name, audience, voice register, source files, success criteria, output path.
4. Claude reviews scope and sequencing. Accepts or contests.
5. Once accepted, kickoff and discovery both close. Showcase Pack Backlog is seeded. Gate review is written.

The new shape is not deposited in cm until the pack ships.

## Mid-Flight Artifact Addition

If a coherence pass or review surfaces a missing artifact:

1. Codex creates the new Backlog issue under Showcase Pack with full scope.
2. The gate review description is updated to extend the `Execute:` list to include the new issue ID.
3. Nancy's selector picks it up on the next turn.

This mirrors corrective issue handling in `post-execution-review-workflow`.

## Selector-Compatible Gate Texts

### Tender authorization (kickoff acceptance)

```text
Tender authorization complete. Outcome: Ready for execution.
Authorized execution parent: `SHOWCASE-PACK-ID`.
Selected shape: <shape_name from registry, or 'new shape'>.
Brief: master parent <ID>.
Research: <absolute path>.
Execute: ARTIFACT-1, ARTIFACT-2, ..., REVIEW-ID.
Required order: <if dependencies, e.g. cover note last>.
```

### Tender shipped (post-execution outcome)

```text
Tender shipped. Outcome: <count> artifacts produced under <SHOWCASE-PACK-ID>.
Shape: <shape_name>. New shape: <yes/no>.
Artifacts: ARTIFACT-1 → <path>, ARTIFACT-2 → <path>, ...
Registry: cm pattern <id> deposited; tender-shapes.md regenerated.
Coherence pass: <accepted | issues fixed in turns N–M>.
Master parent closing.
```

### Needs human direction

Same shape as the existing workflows.

## Failure Modes

- **Brief gaps.** Kickoff exits `Needs human direction` naming the missing field.
- **Thin or contradictory source research.** Individual Backlog issue exits `Needs human direction` naming the gap. Pack-level review continues on other artifacts.
- **Editorial dissent on shipped artifact.** Reopen the Backlog issue with new edit instructions.
- **Stale registry entry picked.** If Stuart picks a shape whose registry inputs reference research files that no longer exist, kickoff exits `Needs human direction` and asks Stuart to revise the shape or pick a new one.

## Skill Routing Update

Add a fourth bullet to the Workflow Routing section in `SKILL.md`:

```text
- Use [Tender Production Workflow](workflows/tender-production-workflow.md) when an approved brief and existing background research must be turned into a client-ready showcase pack of polished deliverables.
```

## Open Questions

None at design time. Resolution of edge cases happens in implementation by following the existing workflow files' patterns.
