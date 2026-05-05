# Tender Production Workflow

Use this workflow when an approved brief and existing background research must be turned into a client-ready showcase pack of polished deliverables.

## Purpose

Produce a reviewed Linear issue graph, then run two-agent autonomous execution that turns curated research into a client-ready artifact set under one Showcase Pack execution parent.

This workflow is the editorial counterpart to `nancy-two-agent-planning-gate`. It assumes background research is complete. Scope is limited to synthesis, drafting, review, and shipping.

## Trigger

Stuart creates the master parent issue with the brief in the description and tells Nancy to run the tender production workflow against it.

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

If cm returns zero matching entries, Codex writes only the `design a new shape` option and notes in the issue body that no prior shapes exist in the registry.

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

The coherence pass runs under the existing `post_execution_review` selector mode.

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

Tender deliverables iterate on the artifact itself. Downstream corrective issues are reserved for the selector fallback below.

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
