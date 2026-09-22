import { applyRounding, clamp } from "@/lib/rounding";
import type { PensionPeriod, YearRules } from "@/rules/types";

/**
 * 적용할 국민연금 기간을 고른다.
 * asOf(ISO date)가 주어지면 그 날짜가 속한 기간, 없으면 가장 최근 기간(README 4.1).
 */
export function selectPensionPeriod(
  periods: readonly PensionPeriod[],
  asOf?: string,
): PensionPeriod {
  if (periods.length === 0) throw new Error("nationalPension.periods must not be empty");
  const sorted = [...periods].sort((a, b) => (a.from < b.from ? -1 : 1));
  if (asOf) {
    const hit = sorted.find((p) => p.from <= asOf && asOf <= p.to);
    if (hit) return hit;
  }
  return sorted[sorted.length - 1] as PensionPeriod;
}

export interface NationalPensionResult {
  /** 상·하한 적용 후 기준소득월액 */
  baseIncome: number;
  amount: number;
}

export function calcNationalPension(
  taxableSalary: number,
  rule: YearRules["nationalPension"],
  period: PensionPeriod,
): NationalPensionResult {
  const rounded = applyRounding(taxableSalary, rule.incomeRounding);
  const baseIncome = clamp(rounded, period.monthlyIncomeMin, period.monthlyIncomeMax);
  const amount = applyRounding(baseIncome * rule.employeeRate, rule.premiumRounding);
  return { baseIncome, amount };
}

export function calcHealthInsurance(
  taxableSalary: number,
  rule: YearRules["healthInsurance"],
): number {
  return applyRounding(taxableSalary * rule.employeeRate, rule.premiumRounding);
}

export function calcLongTermCare(
  taxableSalary: number,
  healthPremium: number,
  rule: YearRules["longTermCare"],
): number {
  const raw =
    rule.calcMethod === "ofHealthPremium"
      ? healthPremium * rule.rateOfHealthPremium
      : taxableSalary * rule.rateOfIncome;
  return applyRounding(raw, rule.premiumRounding);
}

export function calcEmploymentInsurance(
  taxableSalary: number,
  rule: YearRules["employmentInsurance"],
): number {
  return applyRounding(taxableSalary * rule.employeeRate, rule.premiumRounding);
}
