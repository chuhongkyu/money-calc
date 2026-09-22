import type { WithholdingRate } from "@/rules/types";

export type { WithholdingRate };

export type AmountType = "annual" | "monthly";

export interface SalaryInput {
  year: number;
  amountType: AmountType;
  /** 연봉 또는 월급 (원) */
  amount: number;
  /** true 면 연봉 ÷ 13 으로 월 급여 계산 */
  severanceIncluded: boolean;
  /** 월 비과세액 (원) */
  nonTaxableMonthly: number;
  /** 본인 포함 부양가족 수 (1 ~ 11) */
  dependents: number;
  /** 8세 이상 20세 이하 자녀 수 (0 ~ dependents − 1) */
  children: number;
  withholdingRate: WithholdingRate;
}

export const SALARY_LIMITS = {
  maxAnnual: 1_000_000_000,
  maxMonthly: 100_000_000,
  minDependents: 1,
  maxDependents: 11,
} as const;

export type DeductionKey =
  | "nationalPension"
  | "healthInsurance"
  | "longTermCare"
  | "employmentInsurance"
  | "incomeTax"
  | "localIncomeTax";

export const DEDUCTION_ORDER: readonly DeductionKey[] = [
  "nationalPension",
  "healthInsurance",
  "longTermCare",
  "employmentInsurance",
  "incomeTax",
  "localIncomeTax",
];

export interface DeductionItem {
  key: DeductionKey;
  amount: number;
  /** 표시용 요율. 표 조회 항목(소득세)은 null */
  rate: number | null;
  /** 계산 근거 한 줄 설명 */
  basis: string;
}

export type WarningCode =
  /** 월 급여가 해당 연도 최저임금 월 환산액보다 낮다 */
  | "BELOW_MINIMUM_WAGE"
  /** 간이세액표 데이터가 없어 소득세를 0으로 두었다 */
  | "INCOME_TAX_TABLE_MISSING"
  /** 규칙 데이터가 아직 공식 자료와 대조되지 않았다 */
  | "RULES_UNVERIFIED";

export interface AppliedPensionPeriod {
  from: string;
  to: string;
  monthlyIncomeMin: number;
  monthlyIncomeMax: number;
}

export interface SalaryResult {
  year: number;
  rulesLabel: string;
  /** 적용한 간이세액표 제목 */
  tableTitle: string;
  /** 기준일 (ISO). 국민연금 기간 선택에 사용 */
  asOf: string | null;
  verified: boolean;
  input: SalaryInput;
  /** 월 급여 (세전) */
  monthlySalary: number;
  /** 월 급여 − 비과세 */
  taxableSalary: number;
  deductions: Record<DeductionKey, DeductionItem>;
  totalDeductions: number;
  monthlyNet: number;
  /** 월 실수령액 × 12 */
  annualNet: number;
  /** 세전 연 환산 (월 급여 × 12, 퇴직금 제외) */
  annualGross: number;
  appliedPensionPeriod: AppliedPensionPeriod;
  warnings: WarningCode[];
}

export type ValidationCode =
  | "AMOUNT_REQUIRED"
  | "AMOUNT_EXCEEDS_MAX"
  | "NON_TAXABLE_NEGATIVE"
  | "TAXABLE_NOT_POSITIVE"
  | "DEPENDENTS_OUT_OF_RANGE"
  | "CHILDREN_OUT_OF_RANGE";

export interface ValidationIssue {
  code: ValidationCode;
  message: string;
}
