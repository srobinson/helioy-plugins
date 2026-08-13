import { resolveChecks } from "./github.ts";
import type * as T from "./types.ts";
import { nonEmpty } from "./types.ts";
export function assessGitHubMerge(args: {
  readonly mergeStateStatus: T.MergeStateStatus;
  readonly headRollupState: T.RollupState;
}): T.GitHubMergeAssessment {
  if (args.mergeStateStatus === "BLOCKED") {
    if (args.headRollupState === "ERROR" || args.headRollupState === "FAILURE")
      return {
        kind: "refused",
        mergeStateStatus: args.mergeStateStatus,
        headRollupState: args.headRollupState,
      };
    return {
      kind: "allowed",
      basis: "rollup",
      mergeStateStatus: args.mergeStateStatus,
      headRollupState: args.headRollupState,
    };
  }
  return {
    kind: "allowed",
    basis: "merge-state",
    mergeStateStatus: args.mergeStateStatus,
    headRollupState: args.headRollupState,
  };
}
async function mergeAssessment(
  reader: T.GitHubReader,
  facts: T.PullRequestFacts
) {
  const commits = await reader.commitRollups(facts.context);
  const headRollupState =
    facts.headRefOid === null
      ? null
      : (commits.find((commit) => commit.oid === facts.headRefOid)?.state ??
        null);
  return {
    hadPreviousPassingCi: commits.some(
      (commit) => commit.oid !== facts.headRefOid && commit.state === "SUCCESS"
    ),
    github: assessGitHubMerge({
      mergeStateStatus: facts.mergeStateStatus,
      headRollupState,
    }),
  };
}
const AUTOMATION_TOKENS = [
  "bugbot",
  "security review",
  "pr review automation",
  "review automation",
] as const;
export async function readSnapshot(args: {
  readonly reader: T.GitHubReader;
  readonly context: T.PrContext;
  readonly pendingHistory: "include" | "omit";
  readonly allowDraft: boolean;
}): Promise<T.PrSnapshot> {
  const facts = await args.reader.pullRequest(args.context);
  if (facts.state === "MERGED" || facts.mergedAt !== null)
    return { kind: "merged", context: args.context, facts };
  if (facts.state === "CLOSED")
    return { kind: "closed", context: args.context, facts };
  const threads = await args.reader.reviewThreads(args.context);
  const checks = await resolveChecks(args.reader, args.context);
  const failed = nonEmpty(
    checks.checks.filter(
      (check): check is T.FailedCheck => check.kind === "failed"
    )
  );
  const pending = nonEmpty(
    checks.checks.filter(
      (check): check is T.PendingCheck => check.kind === "pending"
    )
  );
  let ci: T.CiState;
  if (failed === null && pending !== null && args.pendingHistory === "omit")
    ci = {
      kind: "ci-pending",
      source: checks.source,
      all: checks.checks,
      failed: [],
      pending,
      hadPreviousPassingCi: false,
    };
  else {
    const merge = await mergeAssessment(args.reader, facts);
    const base = {
      source: checks.source,
      all: checks.checks,
      hadPreviousPassingCi: merge.hadPreviousPassingCi,
    };
    if (failed !== null)
      ci = {
        ...base,
        kind: "ci-failing",
        failed,
        pending: pending ?? [],
        github: merge.github,
      };
    else if (merge.github.kind === "refused")
      ci = {
        ...base,
        kind: "ci-github-rejected",
        failed: [],
        pending: pending ?? [],
        github: merge.github,
      };
    else if (pending !== null)
      ci = { ...base, kind: "ci-pending", failed: [], pending };
    else
      ci = {
        ...base,
        kind: "ci-clean",
        failed: [],
        pending: [],
        github: merge.github,
      };
  }
  return {
    kind: "open",
    context: args.context,
    facts,
    threads,
    ci,
    reviewAutomationRunning: checks.checks.some(
      (check) =>
        check.kind === "pending" &&
        AUTOMATION_TOKENS.some((token) =>
          check.name.toLowerCase().includes(token)
        )
    ),
  };
}
