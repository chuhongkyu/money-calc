import { rules2026 } from "./2026";
import table202603 from "./incomeTaxTable/2026-03-01.json";
import { parseIncomeTaxTable, type IncomeTaxTable } from "./incomeTaxTable/types";
import type { YearRules } from "./types";

export type { YearRules, PensionPeriod, WithholdingRate } from "./types";
export { WITHHOLDING_OPTIONS } from "./types";
export type { IncomeTaxTable } from "./incomeTaxTable/types";

/**
 * 레지스트리.
 * - 4대보험 요율은 달력 연도별(rules/YYYY.ts)
 * - 간이세액표는 국세청 적용 시작일별(incomeTaxTable/<YYYY-MM-DD>.json)
 * 새 연도·새 표는 파일을 만들고 아래 두 배열에만 등록한다. UI 수정 불필요.
 */
const registry: readonly YearRules[] = [rules2026];
const tableList: readonly IncomeTaxTable[] = [table202603]
  .map(parseIncomeTaxTable)
  .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? -1 : 1));
const tables: Record<string, IncomeTaxTable> = Object.fromEntries(
  tableList.map((t) => [t.tableId, t]),
);

/** 최신 연도가 앞에 오도록 정렬 */
export const availableYears: readonly number[] = registry.map((r) => r.year).sort((a, b) => b - a);
export const latestYear: number = availableYears[0] ?? new Date().getFullYear();
export const earliestYear: number = availableYears[availableYears.length - 1] ?? latestYear;
export const availableTables: readonly IncomeTaxTable[] = tableList;

export function hasRules(year: number): boolean {
  return registry.some((r) => r.year === year);
}

export function getRules(year: number): YearRules {
  const found = registry.find((r) => r.year === year);
  if (!found) throw new Error(`No rules registered for year ${year}`);
  return found;
}

export function getIncomeTaxTable(tableId: string): IncomeTaxTable {
  const table = tables[tableId];
  if (!table) throw new Error(`No income tax table registered for id ${tableId}`);
  return table;
}

export interface RuleSet {
  rules: YearRules;
  table: IncomeTaxTable;
}

/** 연도의 기본 규칙 세트 (rules.incomeTax.tableId 사용). 골든 테스트 등 연 단위 검증용 */
export function getRuleSet(year: number): RuleSet {
  const rules = getRules(year);
  return { rules, table: getIncomeTaxTable(rules.incomeTax.tableId) };
}

/** 기준일에 적용되는 간이세액표. effectiveFrom ≤ asOf ≤ effectiveTo(null 이면 열림) */
export function findTableFor(asOf: string): IncomeTaxTable | null {
  return (
    tableList.find(
      (t) => t.effectiveFrom <= asOf && (t.effectiveTo === null || asOf <= t.effectiveTo),
    ) ?? null
  );
}

export interface ResolvedRuleSet extends RuleSet {
  /** 실제 사용한 기준일 (레지스트리 범위로 보정됨) */
  asOf: string;
}

/**
 * 기준일 하나로 (요율 연도, 간이세액표) 를 고른다.
 * 레지스트리 범위 밖 날짜는 가장 가까운 연도의 끝/처음으로 보정한다.
 */
export function resolveRuleSet(asOf: string): ResolvedRuleSet {
  let date = asOf;
  const year = Number(date.slice(0, 4));
  if (year > latestYear) date = `${latestYear}-12-31`;
  if (year < earliestYear) date = `${earliestYear}-01-01`;
  // 간이세액표가 아직 없는 이른 날짜(예: 2026년 1~2월)는 첫 표의 적용 시작일로 보정한다
  const firstTable = tableList[0];
  if (firstTable && date < firstTable.effectiveFrom) date = firstTable.effectiveFrom;
  const rules = getRules(Number(date.slice(0, 4)));
  const table = findTableFor(date) ?? getIncomeTaxTable(rules.incomeTax.tableId);
  return { rules, table, asOf: date };
}

/** 오늘 기준일 (YYYY-MM-DD, 로컬 시간). 레지스트리 범위로 보정된다. */
export function defaultAsOf(now: Date = new Date()): string {
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return resolveRuleSet(iso).asOf;
}

export interface MonthOption {
  /** "2026-03" */
  value: string;
  /** "2026년 3월" */
  label: string;
  /** 그 달 1일 기준일 "2026-03-01" */
  asOf: string;
}

/** 선택 가능한 기준 월 목록 (최신이 앞). 요율과 간이세액표가 둘 다 있는 달만 */
export function availableMonths(): MonthOption[] {
  const out: MonthOption[] = [];
  for (const year of availableYears) {
    for (let m = 12; m >= 1; m -= 1) {
      const mm = String(m).padStart(2, "0");
      const asOf = `${year}-${mm}-01`;
      if (!findTableFor(asOf)) continue;
      out.push({ value: `${year}-${mm}`, label: `${year}년 ${m}월`, asOf });
    }
  }
  return out;
}

/** "2026-09-22" → "2026년 9월" */
export function formatAsOfMonth(asOf: string): string {
  return `${asOf.slice(0, 4)}년 ${Number(asOf.slice(5, 7))}월`;
}
