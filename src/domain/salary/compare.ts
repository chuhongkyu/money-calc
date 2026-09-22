import { DEDUCTION_ORDER, type DeductionKey, type SalaryResult } from "./types";

export interface YearComparison {
  baseYear: number;
  otherYear: number;
  otherLabel: string;
  /** base.monthlyNet − other.monthlyNet */
  monthlyNetDiff: number;
  deductionDiffs: Record<DeductionKey, number>;
}

/** "○○년 같은 시점 대비 월 −○○원" 을 위한 비교. base 가 현재 기준. 이전 연도 규칙이 있을 때만 쓴다. */
export function compareResults(base: SalaryResult, other: SalaryResult): YearComparison {
  const deductionDiffs = Object.fromEntries(
    DEDUCTION_ORDER.map((key) => [key, base.deductions[key].amount - other.deductions[key].amount]),
  ) as Record<DeductionKey, number>;

  return {
    baseYear: base.year,
    otherYear: other.year,
    otherLabel: other.rulesLabel,
    monthlyNetDiff: base.monthlyNet - other.monthlyNet,
    deductionDiffs,
  };
}
