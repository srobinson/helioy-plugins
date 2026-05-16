# MoE Issue Review Workflow

Iterated mixture-of-experts peer-consensus review of a Linear issue set. Each pass runs the same fresh-eyes audit with new pane contexts until a round-1 review surfaces zero substantive blockers.

## Purpose

Single-pass review catches the obvious defects. MoE iterated review catches the assumptions the drafter and the first reviewer carried forward together. High orchestrator confidence on an issue set is itself a risk signal — the gate that looks "ready" is exactly where structural-validity defects leak.

## When To Use

- A peer-consensus or single-agent issue review has just signed off clean and confidence is high.
- The artifact authorizes high-blast-radius autonomous execution: master parent gate, multi-worker corrective wave, post-execution review criteria, gate close binding.
- Prior gates of this shape have shipped with structural defects that surfaced only at execution time.
- The user explicitly requests iterated review, asks for "another pass," or asks to keep going until the agents have nothing left.

Do not use this workflow for low-stakes issues or simple worker drafts. The cost is one warroom per pass (roughly 10-15 minutes of pane time plus orchestrator edit time); the value is catching defects that escape single-pass review.

If the issues are not yet in selector-compatible shape, run [Intake and Triage](intake-and-triage-workflow.md) first. If a single review pass is enough, run [Agent Issue Review](agent-issue-review-workflow.md) instead.

## Composition

Use the mixture-of-experts default per [Warroom Mode 1: Peer Consensus](../../warroom/SKILL.md#mode-1-peer-consensus): the same `helioy-tools:*` agent on Claude and Codex panes. Same prompt, different model on each pane. Disagreement between panes is signal about the artifact; agreement under fresh-eyes pressure is the exit condition.

## Per-pass operating rules

Each pass is an independent peer-consensus round with these additional disciplines:

1. **Fresh contexts every pass.** Kill the prior warroom. Spawn a new one with the same composition. Do not reuse panes across passes — anchoring bias from prior conclusions dominates the audit if you do.
2. **Cold artifact reads.** The brief deliberately omits prior-pass findings. Each pane reads current Linear state without knowing what earlier passes caught. The orchestrator may mention that earlier passes happened, but never what they found.
3. **New bus topic per pass.** Format: `{artifact}-review-pass{N}`. Isolates each pass's debate, prevents cross-pass message contamination.
4. **Orchestrator applies between passes.** Each pass closes with both panes' clean sign-off after the orchestrator applies the consensus changes. The next pass reads the amended state, not the proposals.
5. **Persist to cm between passes.** After each pass closes, write a `cx_store` decision recording catches, defect classes touched, count, and operative lessons. The accumulated cm record is the empirical defect curve.

## Iteration sequence

```
loop:
  kill prior warroom
  spawn new warroom (same composition, new name)
  dispatch peer-consensus brief on new bus topic
  observe round-1 conditional sign-offs
    if both panes sign clean (zero conditional items):
      exit
    else:
      orchestrator applies consensus changes
      nudge both panes to re-verify live Linear and emit clean sign-off
      observe round-2 clean sign-offs
  persist consensus to cm
  prompt user for continue/stop or proceed automatically
```

## Exit condition

Both panes' round-1 sign-off is clean (zero conditional items) on the same pass. This is "exhaustion" — the artifact has no remaining defects that fresh-eyes peer-consensus can surface.

A pass that returns to clean only after orchestrator edits is *not* an exit. Run another pass. The condition is round-1 cleanliness, because that demonstrates the artifact has no remaining defects, not that the current panes happened to converge on a fix.

## Keep on Trucking

Do not pause between iterations unless the experts are conflicted and you require human intervention/decision.

## Practical exit: the smell test

Iterating to formal round-1 zero is sometimes overkill. The orchestrator should also watch for the *qualitative* shift in finding flavor and stop when findings cross from substantive to cosmetic — independent of whether a clean pass has been hit.

A finding is **substantive** when it would actually change execution or review behavior:

- A shell command in the verification path that fails to copy-paste safely on a real platform.
- A precondition (binary, file, daemon) the executor will hit and not handle.
- An acceptance bullet a reviewer cannot falsify, so the gate closes on an unverified claim.
- A worker body or PER bullet that contradicts something elsewhere in the tree.
- A structural-vs-prose drift (`blockedBy` graph vs Dependency-notes line, Execute-set vs filed children, gate references vs filed bodies).

A finding is **cosmetic** when nothing breaks if it stays:

- A wording could be tighter, a sentence could be shorter, a heading is a level off.
- A bullet repeats information already adjacent to it; minor redundancy that does not contradict.
- Style nits, capitalization, formatting consistency.
- Suggestions to add elaboration the executor or reviewer would not actually need.

If round-1 of a fresh pass produces only cosmetic findings, **stop**. Document the stop in the pass's cm decision with the cosmetic findings recorded but not applied, and note in the body that exhaustion was called by smell rather than by formal round-1 zero. Future passes against the same artifact start from this baseline and only resume iteration if a substantive surface re-opens (e.g., the artifact is amended).

The orchestrator owns the smell call. Panes audit; they do not decide when to stop. If a pane keeps producing cosmetic conditional items after the orchestrator has called it, the brief for any subsequent pass should make the smell threshold explicit: "if all findings are wording / formatting / redundancy rather than execution-breaking, send the clean sign-off."

## Brief shape per pass

Standard peer-consensus brief from [Warroom Mode 1](../../warroom/SKILL.md#mode-1-peer-consensus) plus three additions:

- **Honesty clause.** Explicit instruction: "Honest 'none found' is the desired outcome. The orchestrator runs passes until a round-1 review surfaces no substantive blockers. If your audit produces no substantive findings, send the clean sign-off directly." Without this, fresh panes feel adversarial pressure to invent findings and produce low-quality conditional sign-offs.
- **Defect-class catalog.** Enumerate the defect classes prior passes have surfaced (see catalog below). Brief the panes to build on the pattern, not just look for unrelated new defects.
- **Probe directions.** Three to six specific, fresh probe questions for the current pass. Pick questions across the defect classes the artifact has not yet been tested against. Seeding probes shifts the audit from "find anything" to "test these specific surfaces."

The orchestrator drafts probe questions fresh each pass. Repeating last pass's probes wastes a pass.

## Defect classes

Catalog of defect classes empirically surfaced by this pattern. The probe directions in each pass should test surfaces across this catalog the artifact has not yet been audited against:

1. **Structural integrity.** Ordering vs blocking asymmetries (prose Required-order line vs structural `blockedBy`), terminal-state references (gate close binding pointing at an already-`Done` issue), orphaned worker chains (worker listed in prose but missing from `blockedBy`), reference cycles, missing `Execute:` line entries.
2. **Copy-paste safety.** Angle-bracket placeholders in shell commands (`<HOST_CWD>` parses as redirection), default-Dockerfile-name assumptions (`docker build <ctx>` requires `<ctx>/Dockerfile`), positional vs flag CLI shape, exit-status-meaningful assertions vs decorative ones (`docker ps --filter` exits 0 regardless of matches), container-name derivation, captured-but-unused shell substitutions.
3. **Cross-platform tool behaviour.** macOS `uuidgen` (uppercase) vs Rust `Uuid::Display` (lowercase), procps in image (BYO image may omit) vs `docker top` (host-side, image-independent), `find` recursion semantics, default flag values that differ across BSD/GNU.
4. **Implementation prescription leaks.** Soft-prescriptive language in Acceptance, Notes, or Background sections that violates the Universal Issue Rule against prescribing implementation.
5. **PER scope mirroring.** Review criteria that summarise worker acceptance instead of mirroring it bullet-for-bullet, leaving acceptance surface uncovered at review time. Sub-pattern: **late-arrival PER mirroring.** When the master's accepted gate is amended with new workers after the PER has closed (`Done`), the gate-body language "PER replays after the new wave lands" is structurally meaningless against a terminal PER — the selector terminates on `Done`. Probe whether the PER has been reopened and its acceptance amended per [Re-opening PER on Gate Amendment After Closure](post-execution-review-workflow.md#re-opening-per-on-gate-amendment-after-closure), or whether the reopen has been skipped, leaving the new wave structurally unreviewable.
6. **File-size cap pressure.** Cumulative line growth across wave-modified files breaching the 700-LOC cap, non-recursive cap checks that miss submodule splits, generated-file overcounting.
7. **Implicit preconditions.** Binary install / PATH discovery, daemon foreground vs background behaviour, build-source assumption, credential availability, host network reachability.
8. **Teardown discipline.** Verification sequences that leave operator state dirty (daemon still running, container still bound, socket still present) without a stop step.

## Persistence between passes

After each pass closes, write a cm decision with:

- **Title.** Short summary including pass number and headline catch.
- **Tags.** Include `pass-{N}`, `fresh-eyes`, `moe`, `peer-consensus`, and the artifact identifier.
- **Body.** Pass catches, defect classes touched, defect count for that pass, operative lessons, current cumulative defect curve.

The accumulated cm record is the empirical defect curve. Its shape is the user's signal for whether to continue or stop.

## Defect curve interpretation

Pattern empirically observed across multi-pass MoE review cycles:

- Early passes (1-3): structural and lifecycle defects. Defect count 4-8 per pass.
- Middle passes (4-6): cross-platform and copy-paste safety defects. Defect count 3-4 per pass.
- Late passes (7+): single-finding passes or zero-finding exit.

A non-monotonic curve (defect count rises) is normal mid-cycle. A pass may uncover a defect class earlier passes did not test against. Keep iterating until the round-1 zero condition holds.

If the curve does not flatten by pass 8-10, the artifact shape itself is likely wrong. Escalate to the user rather than continuing.

## Cost and value

Each pass: roughly 10-15 minutes of pane time plus orchestrator edit time. A typical multi-pass cycle on a high-stakes gate runs 5-10 passes.

A defect that escapes review and surfaces at execution time costs: worker rework, gate amendment, possible PER reopen, and ecosystem trust. The accumulated cost of even ten passes is small compared to the smallest leaked structural defect.

## Anti-patterns

| Do NOT | Reason |
|---|---|
| Reuse pane contexts across passes | Anchoring bias on prior conclusions dominates; "fresh eyes" claim becomes false. |
| Brief panes with prior-pass findings | Panes either ratify or rebel rather than reason independently; defeats cold-read discipline. |
| Skip the cm persistence step | Loses the empirical defect curve; user loses the signal to decide continue / stop. |
| Treat a single conditional item as failure | A pass with one finding is normal mid-cycle. Only round-1 zero is the exit. |
| Continue past 8-10 passes with no defect-rate decline | The curve should flatten. If it does not, the artifact's shape is likely wrong. Escalate. |
| Repeat prior passes' probe directions | Wastes the pass. Fresh probes per pass shift the audit to new surfaces. |
| Skip the honesty clause in the brief | Fresh panes feel adversarial pressure and invent low-quality findings. |
| Iterate past the cosmetic transition | Once findings shift from execution-breaking to wording-tightening, the artifact is done. Continuing burns context and pane time for no marginal defect protection. Apply the smell test (see [Practical exit](#practical-exit-the-smell-test)) and stop. |

## Relationship to other workflows

- Run [Intake and Triage](intake-and-triage-workflow.md) first if the issues are not in selector-compatible shape.
- Run [Agent Issue Review](agent-issue-review-workflow.md) for single-pass review when stakes are moderate.
- Escalate from Agent Issue Review to this workflow when a single-pass review signs off clean but the artifact's blast radius warrants exhaustion-based exit.
- Persisted defect curves inform [Post Execution Review](post-execution-review-workflow.md) by exposing recurring defect classes that should be added to PER review criteria.
