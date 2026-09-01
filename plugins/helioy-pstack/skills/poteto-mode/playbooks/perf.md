### Perf

**You own the measurement story. Diagnose from a real signal, fix against a number, never claim a win from source.** For "why is X slow / leaking / spinning", a dropped profile or trace, a one-off perf fix, or a sustained climb against a metric. Declare the mode in your first line.

Modes:

- **Diagnose.** The deliverable is a cited cause, not a fix. Live process: capture the signal on the real surface (CPU profile, heap snapshot, trace). Handed artifact: it is a fixed dataset, read it, do not re-run it.
- **Fix.** One measured problem, one fix, before and after numbers.
- **Climb.** Sustained improvement of one metric to a target. One change, one measurement, keep or revert. Never stack untested changes.

1. Ground with the **how** skill before choosing a ruler. Name the workload dimensions that move the result and pick a case that reproduces the complaint. No repro means fix the repro first.
2. Capture or load the artifact. Reduce it to the smoking gun: the hot frame, the retainer chain to a GC root, the loop firing without input. Parse large artifacts in a subagent (the **guard-the-context-window** principle skill); dump traces and snapshots into sqlite so you query instead of read. Attribute to file and symbol via the artifact's own symbols. No mapping means no diagnosis yet.
3. Prove the mechanism before believing it. Instrument the live process or diff a paired before and after capture. Without either, mark the finding as the strongest supported hypothesis, not a confirmed cause. Diagnose mode stops here: hand back the signal, the reduced finding, the proof, and the source location, then route to Bug fix or Fix mode.
4. For Fix and Climb, freeze the harness first (the **build-the-lever** principle skill). One repeatable command emits the metric, median of N. Prove it separates the target case from easier cases. Record the baseline and a green regression gate before any change. Changing the harness invalidates every earlier number.
5. Generate hypotheses from the trace, not a checklist. Eight families cover most wins: elimination (delete work that need not run; needs the `how` pass, the profiler never shows deletability), divide and conquer, caching (name the invalidation), indirection (only when it removes more from the critical path than it adds), batching, redundancy (hedged requests, only with headroom), lazy evaluation, scheduling (move work out of the interactive moment; measure perceived latency). A family earns an attempt only when the trace shows its signal.
6. Plan the fix. If it crosses a function boundary, `architect` first. Delegate to a subagent on the `codex` runtime with a tight scope; review the diff. Climb mode fans independent hypotheses to parallel subagents in separate worktrees (the **separate-before-serializing-shared-state** principle skill).
7. Measure after with the frozen harness and run the gate. Accept only when the metric moves past noise and the gate stays green; otherwise revert in full. Each attempt ends in a check before the next (the **sequence-verifiable-units** principle skill).
8. Climb mode adds a `decision.tsv` via the **show-me-your-work** skill, one row per attempt (hypothesis, change, before, after, delta, verdict), read before every attempt so the search accumulates. One commit per accepted win, staged by file. Push past the first plateau by pivoting family or combining near-misses. Stop on the predicate, which pairs a target with a floor on attempts, or when the remaining ideas are genuinely marginal. Never relax the predicate to declare victory.
9. Cite the measurement in the PR. Run **Opening a PR**.

**Reply:** mode; baseline, final, and delta; artifact paths; for Diagnose the reduced finding and how the mechanism was proved; for Climb the iterations kept versus reverted, each accepted fix on one line, the `decision.tsv` path, and the next idea worth trying.
