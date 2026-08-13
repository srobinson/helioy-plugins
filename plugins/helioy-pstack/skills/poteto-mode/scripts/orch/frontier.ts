import { execFileSync } from "node:child_process";

import {
  type FrontierPr,
  type FrontierPrState,
  UserError,
} from "./model.ts";

const OPEN_STATUSES = new Set([
  "Trunk branch locked", "Changes requested", "Waiting on PRs in this stack to merge",
  "Waiting on downstack merge state", "Draft", "Required checks failed",
  "Undergoing failure detection", "Merge queue failed on current head commit",
  "Handed off to merge queue...", "Waiting on downstack", "Merge conflicts",
  "Needs reviewers", "Needs approvals", "Needs restack", "Queued to merge...",
  "Ready to merge", "Ready to merge as stack", "Rebasing...", "Waiting on CI...",
  "Stale, needs rebase onto trunk", "Unresolved comments", "Waiting on required CI",
  "Waiting to merge...",
]);

interface PullRequest { readonly pr: number; readonly state: FrontierPrState }
interface Entry extends PullRequest { readonly branches: string }

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function parsePullRequest(branch: string, detail: string): PullRequest {
  const match = /^(?:\[origin\] )?PR #([1-9]\d*)(?: \(([^)\r\n]+)\))?(?: .+)?$/.exec(detail);
  const pr = Number(match?.[1] ?? 0);
  if (match === null || !Number.isSafeInteger(pr)) {
    throw new UserError(`gt info output has an invalid PR row for branch ${branch}: ${detail}`);
  }
  const status = match[2];
  if (status === "Merged") return { pr, state: "MERGED" };
  if (status === "Closed") return { pr, state: "CLOSED" };
  if (status === undefined || OPEN_STATUSES.has(status)) return { pr, state: "OPEN" };
  throw new UserError(`gt info output has an unknown PR state for branch ${branch}: ${status}`);
}

function parseBranches(raw: string): readonly string[] {
  const branches: string[] = [];
  for (const [index, line] of raw.replace(/\r/g, "").split("\n").entries()) {
    if (line.length === 0) continue;
    const match = /^(?:│ )*[◯◉] +([^\s]+)((?: \([^()\r\n]*\))*)$/.exec(line);
    if (match === null) throw new UserError(`gt log short output has an unparseable line ${index + 1}: ${JSON.stringify(line)}`);
    const branch = match[1] ?? "";
    if (branches.includes(branch)) throw new UserError(`gt log short output contains duplicate branch ${branch}`);
    branches.push(branch);
  }
  if (branches[0] === undefined) throw new UserError("gt log short output did not contain a stack");
  return branches.slice(1);
}

function pullRequest(repo: string, branch: string): PullRequest {
  let raw: string;
  try {
    raw = execFileSync("gt", ["--no-interactive", "info", branch], {
      cwd: repo, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" }, stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new UserError(`gt info ${branch} failed: ${errorMessage(error)}`);
  }
  const rows = raw.replace(/\r/g, "").split("\n").filter((line) => line.startsWith("PR #") || line.startsWith("[origin] PR #"));
  if (rows.length === 0) throw new UserError(`gt info output branch ${branch} has no pull request; resolve the frontier from the stacker's clone or after gt sync`);
  if (rows.length > 1) throw new UserError(`gt info output contains multiple PRs for branch ${branch}`);
  return parsePullRequest(branch, rows[0] ?? "");
}

function graphiteFrontier(repo: string): readonly Entry[] {
  let raw: string;
  try {
    raw = execFileSync("gt", ["--no-interactive", "log", "short", "--stack", "--reverse"], {
      cwd: repo, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" }, stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new UserError(`gt log short --stack --reverse failed: ${errorMessage(error)}`);
  }
  const result = parseBranches(raw).map((branch) => ({ branches: branch, ...pullRequest(repo, branch) }));
  if (new Set(result.map((row) => row.pr)).size !== result.length) throw new UserError("gt info output contains duplicate pull requests");
  return result;
}

function branchSha(repo: string, branch: string): string {
  let raw: string;
  try {
    raw = execFileSync("git", ["rev-parse", branch], { cwd: repo, encoding: "utf8", env: process.env, stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    throw new UserError(`git rev-parse ${branch} failed: ${errorMessage(error)}`);
  }
  const sha = raw.trim();
  if (!/^[0-9a-f]{40,64}$/i.test(sha)) throw new UserError(`git rev-parse ${branch} returned an invalid SHA`);
  return sha;
}

export function resolveFrontier(repo: string): readonly FrontierPr[] {
  return graphiteFrontier(repo).map((row) => ({ ...row, sha: branchSha(repo, row.branches) }));
}

export function validateFrontierPin(actual: readonly number[], expected: readonly number[]): void {
  if (actual.length === expected.length && actual.every((pr, index) => pr === expected[index])) return;
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((pr) => !actualSet.has(pr));
  const extra = actual.filter((pr) => !expectedSet.has(pr));
  const drift: string[] = [];
  if (missing.length > 0) drift.push(`missing from gt: ${missing.join(",")}`);
  if (extra.length > 0) drift.push(`extra in gt: ${extra.join(",")}`);
  if (missing.length === 0 && extra.length === 0) drift.push(`order differs: expected ${expected.join(",")}; gt ${actual.join(",")}`);
  throw new UserError(`frontier pin mismatch: ${drift.join("; ")}`);
}
