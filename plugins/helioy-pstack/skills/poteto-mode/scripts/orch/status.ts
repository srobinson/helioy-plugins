import type {
  Counts,
  Frontier,
  Gate,
  LedgerEntry,
  OpenGate,
  StatusSummary,
  Unit,
} from "./model.ts";
import { ledgerCells, unitCells } from "./storage.ts";

export function countValues(values: readonly string[]): Counts {
  const result: Record<string, number> = {};
  for (const value of values) {
    result[value] = (result[value] ?? 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(result).sort(([left], [right]) => left.localeCompare(right))
  );
}

export function summarize(
  units: readonly Unit[],
  ledger: readonly LedgerEntry[],
  frontier: Frontier,
  gates: readonly Gate[]
): StatusSummary {
  return {
    unitStates: countValues(units.map((unit) => unit.state)),
    ledgerVerdicts: countValues(ledger.map((row) => row.verdict)),
    frontierGeneration: frontier.generation,
    openGateIds: gates
      .filter((gate): gate is OpenGate => gate.kind === "open")
      .map((gate) => gate.id)
      .sort(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function countRecord(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) return null;
  const result: Record<string, number> = {};
  for (const [name, count] of Object.entries(value)) {
    if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
      return null;
    }
    result[name] = count;
  }
  return result;
}

export function previousSummary(raw: string): StatusSummary | null {
  const match = /<!-- orch-summary (.+) -->/.exec(raw);
  if (match === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(match[1] ?? "");
  } catch {
    return null;
  }
  if (!isRecord(value) || typeof value.frontierGeneration !== "number" || !Array.isArray(value.openGateIds)) {
    return null;
  }
  const unitStates = countRecord(value.unitStates);
  const ledgerVerdicts = countRecord(value.ledgerVerdicts);
  const openGateIds = value.openGateIds.filter(
    (item): item is string => typeof item === "string"
  );
  if (unitStates === null || ledgerVerdicts === null || openGateIds.length !== value.openGateIds.length) {
    return null;
  }
  return { unitStates, ledgerVerdicts, frontierGeneration: value.frontierGeneration, openGateIds };
}

export function changed(
  before: StatusSummary | null,
  after: StatusSummary
): string {
  if (before === null) return "first render";
  const result: string[] = [];
  const groups = [
    ["units", before.unitStates, after.unitStates],
    ["ledger", before.ledgerVerdicts, after.ledgerVerdicts],
  ] as const;
  for (const [label, oldCounts, newCounts] of groups) {
    const names = [...new Set([...Object.keys(oldCounts), ...Object.keys(newCounts)])].sort();
    for (const name of names) {
      const oldCount = oldCounts[name] ?? 0;
      const newCount = newCounts[name] ?? 0;
      if (oldCount !== newCount) result.push(`${label} ${name} ${oldCount}->${newCount}`);
    }
  }
  if (before.frontierGeneration !== after.frontierGeneration) {
    result.push(`frontier generation ${before.frontierGeneration}->${after.frontierGeneration}`);
  }
  if (before.openGateIds.join("\0") !== after.openGateIds.join("\0")) {
    result.push(`open gates ${before.openGateIds.length}->${after.openGateIds.length}`);
  }
  return result.length === 0 ? "no derived changes" : result.join("; ");
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  if (rows.length === 0) return "(none)";
  const escape = (value: string): string => value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
  ].join("\n");
}

function countLine(value: Counts): string {
  const entries = Object.entries(value);
  return entries.length === 0 ? "none" : entries.map(([name, count]) => `${name}=${count}`).join(", ");
}

export function statusMarkdown(
  units: readonly Unit[],
  ledger: readonly LedgerEntry[],
  frontier: Frontier,
  gates: readonly Gate[],
  summary: StatusSummary
): string {
  return `# Orchestrate status

Generated: ${new Date().toISOString()}

## Units

States: ${countLine(summary.unitStates)}

${table(["ID", "Track", "State", "Branch", "PR", "SHA", "Brief"], units.map(unitCells))}

## Verification ledger

Verdicts: ${countLine(summary.ledgerVerdicts)}

${table(["PR", "SHA", "Verdict", "Evidence", "Verifier", "Timestamp"], ledger.map(ledgerCells))}

## Frontier

Generation: ${frontier.generation}
Lowest unmerged: ${frontier.lowestUnmerged ?? "none"}

${table(["Branch", "PR", "SHA", "State"], frontier.prs.map((row) => [row.branches, String(row.pr), row.sha, row.state]))}

## Gates

${table(["ID", "Status", "Question", "Options", "Default", "Answer"], gates.map((gate) => [gate.id, gate.kind, gate.question, gate.options, gate.defaultAnswer, gate.kind === "resolved" ? gate.answer : ""]))}

<!-- orch-summary ${JSON.stringify(summary)} -->
`;
}
