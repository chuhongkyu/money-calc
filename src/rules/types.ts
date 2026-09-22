import type { RoundingRule } from "@/lib/rounding";

/** 국민연금 기준소득월액 상·하한은 매년 7월에 바뀌므로 적용 기간으로 관리한다. */
export interface PensionPeriod {
  /** ISO date, inclusive. 예: "2026-01-01" */
  from: string;
  /** ISO date, inclusive. 예: "2026-06-30" */
  to: string;
  /** 기준소득월액 하한 (원) */
  monthlyIncomeMin: number;
  /** 기준소득월액 상한 (원) */
  monthlyIncomeMax: number;
}

export type LongTermCareCalcMethod = "ofHealthPremium" | "ofIncome";

export const WITHHOLDING_OPTIONS = [0.8, 1, 1.2] as const;
export type WithholdingRate = (typeof WITHHOLDING_OPTIONS)[number];

export interface YearRules {
  year: number;
  /** 4대보험 요율이 적용되는 달력 연도 라벨. 예: "2026년" */
  label: string;
  /** 요율 출처 한 줄 설명 */
  description: string;
  /** 사람이 공식 자료와 대조했는지 여부. true 로 바꾸기 전에 골든 테스트를 채운다. */
  verified: boolean;
  /** 근거 URL */
  sources: string[];

  nationalPension: {
    totalRate: number;
    employeeRate: number;
    periods: PensionPeriod[];
    /** 기준소득월액 단수 처리 (공단: 천원 미만 절사) TODO(verify) */
    incomeRounding: RoundingRule;
    /** 보험료 단수 처리 */
    premiumRounding: RoundingRule;
  };

  healthInsurance: {
    totalRate: number;
    employeeRate: number;
    premiumRounding: RoundingRule;
  };

  longTermCare: {
    /** 소득 대비 요율 (예: 0.009448) */
    rateOfIncome: number;
    /** 건강보험료 대비 비율 (예: 0.1314) */
    rateOfHealthPremium: number;
    /** 실제 고지 방식에 맞게 선택 */
    calcMethod: LongTermCareCalcMethod;
    premiumRounding: RoundingRule;
  };

  employmentInsurance: {
    employeeRate: number;
    premiumRounding: RoundingRule;
  };

  incomeTax: {
    /** incomeTaxTable/<tableId>.json */
    tableId: string;
    /** 지방소득세 = 소득세 × localTaxRate */
    localTaxRate: number;
    withholdingOptions: readonly WithholdingRate[];
    /** 원천징수 비율 적용 후 소득세 단수 처리 */
    taxRounding: RoundingRule;
    localTaxRounding: RoundingRule;
  };

  defaults: {
    /** 식대 비과세 기본값 (월) */
    nonTaxableMealMonthly: number;
  };

  minimumWage: {
    hourly: number;
    /** 주 40시간 · 월 209시간 기준 월 환산액 */
    monthly: number;
  };

  /** 사람이 확인해야 할 항목 메모 (TODO(verify) 목록) */
  notes: string[];
}
