import type { IncomeTaxTable } from "@/rules/incomeTaxTable/types";

export type IncomeTaxSource = "table" | "formula" | "belowTable";

export interface IncomeTaxLookup {
  /** 자녀 차감 전 표 세액 */
  tableTax: number;
  /** 자녀 차감액 */
  childAdjustment: number;
  /** max(0, tableTax − childAdjustment) */
  amount: number;
  source: IncomeTaxSource;
}

/** 8세~20세 자녀 수에 따른 차감액. 표 하단 주석 3 을 데이터로 옮긴 childAdjustment 를 그대로 따른다. */
export function childAdjustmentAmount(table: IncomeTaxTable, children: number): number {
  const c = Math.max(0, Math.floor(children));
  const adj = table.childAdjustment;
  if (c === 0) return 0;
  if (c === 1) return adj.one;
  if (c === 2) return adj.two;
  return adj.threeOrMoreBase + (c - 2) * adj.perChildOverTwo;
}

/**
 * 공제대상가족 수에 해당하는 세액. 표 주석 4: 11명을 초과하면
 * (11명 세액) − (10명 세액 − 11명 세액) × 초과 인원. 음수면 0.
 */
export function taxForDependents(
  row: readonly number[],
  table: IncomeTaxTable,
  dependents: number,
): number {
  const [min, max] = table.dependentsRange;
  const d = Math.max(Math.floor(dependents), min);
  if (d <= max) return row[d - min] ?? 0;
  const atMax = row[max - min] ?? 0;
  const atMaxMinusOne = row[max - 1 - min] ?? atMax;
  return Math.max(0, atMax - (atMaxMinusOne - atMax) * (d - max));
}

/** 월 1,000만 원 이상 산식. 기준세액은 "10,000천원인 경우의 해당 세액" 행(baseTax). */
function highIncomeTax(
  table: IncomeTaxTable,
  taxableSalary: number,
  dependents: number,
): number | null {
  const baseRow =
    table.highIncome.baseTax.length > 0
      ? table.highIncome.baseTax
      : table.brackets[table.brackets.length - 1]?.tax;
  if (!baseRow) return null;
  const segment = table.highIncome.segments.find(
    (s) => taxableSalary >= s.over && (s.upTo === null || taxableSalary < s.upTo),
  );
  if (!segment) return null;
  const excess = taxableSalary - segment.over;
  return (
    taxForDependents(baseRow, table, dependents) +
    segment.fixed +
    excess * segment.taxableRatio * segment.rate
  );
}

/**
 * 간이세액표 조회. 표 데이터가 없거나 구간을 못 찾으면 null.
 * 원천징수 비율(80/100/120%)과 단수 처리는 호출 측(calculate.ts)에서 적용한다.
 */
export function lookupIncomeTax(
  table: IncomeTaxTable,
  taxableSalary: number,
  dependents: number,
  children: number,
): IncomeTaxLookup | null {
  if (table.brackets.length === 0) return null;
  const first = table.brackets[0] as (typeof table.brackets)[number];

  let tableTax: number;
  let source: IncomeTaxSource;

  if (taxableSalary < first.from) {
    tableTax = 0;
    source = "belowTable";
  } else if (taxableSalary >= table.highIncome.threshold) {
    const tax = highIncomeTax(table, taxableSalary, dependents);
    if (tax === null) return null;
    tableTax = Math.floor(tax);
    source = "formula";
  } else {
    const bracket = table.brackets.find((b) => taxableSalary >= b.from && taxableSalary < b.to);
    if (!bracket) return null;
    tableTax = taxForDependents(bracket.tax, table, dependents);
    source = "table";
  }

  const childAdjustment = tableTax > 0 ? childAdjustmentAmount(table, children) : 0;
  const amount = Math.max(0, tableTax - childAdjustment);
  return { tableTax, childAdjustment, amount, source };
}
