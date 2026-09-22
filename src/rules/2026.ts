import type { YearRules } from "./types";

/**
 * 2026년 적용 규칙.
 * 값은 README 4.1 표(2026년 9월 기획 시점 뉴스·공단 자료)에서 가져왔으며 아직 공식 자료와 대조하지 않았다. (verified: false)
 */
export const rules2026: YearRules = {
  year: 2026,
  label: "2026년",
  description: "4대보험 2026년 요율 (국민연금 상·하한은 7월에 변경)",
  verified: true, // 2026-09-22 사용자 결정: 4대보험은 4insure 모의계산으로 확인, 나머지는 notes 의 잔여 항목 참고
  sources: [
    "https://www.4insure.or.kr", // 4대보험 모의계산 (2026-09-22): 요율 4종, 10원 미만 절사, 국민연금 7월~ 상·하한 확인
    "https://www.nps.or.kr", // TODO(verify) 2026년 1~6월 기준소득월액 상·하한
    "https://hometax.go.kr", // 근로소득 간이세액표 2026.3.1 적용분 (docs/sources)
    "https://www.minimumwage.go.kr", // TODO(verify) 2026년 최저임금
  ],
  nationalPension: {
    totalRate: 0.095, // 4insure 모의계산 2026 (2026-09-22, 월급여 3,550,000 → 근로자 168,620) 로 확인
    employeeRate: 0.0475,
    periods: [
      {
        from: "2026-01-01",
        to: "2026-06-30",
        monthlyIncomeMin: 400_000,
        monthlyIncomeMax: 6_370_000,
      }, // TODO(verify)
      {
        from: "2026-07-01",
        to: "2026-12-31",
        monthlyIncomeMin: 410_000,
        monthlyIncomeMax: 6_590_000,
      }, // 4insure 모의계산(2026-09-22, 월급여 300,000 / 7,000,000)으로 확인
    ],
    incomeRounding: { unit: 1000, mode: "floor" }, // TODO(verify)
    premiumRounding: { unit: 10, mode: "floor" }, // 4insure 로 확인: 3,550,000 × 4.75% = 168,625 → 168,620 (10원 미만 절사)
  },
  healthInsurance: {
    totalRate: 0.0719, // 4insure 로 확인 (127,620)
    employeeRate: 0.03595,
    premiumRounding: { unit: 10, mode: "floor" }, // 4insure 로 확인: 127,622.5 → 127,620
  },
  longTermCare: {
    rateOfIncome: 0.009448, // 4insure 로 확인
    rateOfHealthPremium: 0.009448 / 0.0719, // 공단 산식: 건강보험료 × (장기요양보험료율 ÷ 건강보험료율)
    calcMethod: "ofHealthPremium", // 4insure 로 확인: 127,620 × 0.9448/7.19 = 16,769.9 → 16,760
    premiumRounding: { unit: 10, mode: "floor" },
  },
  employmentInsurance: {
    employeeRate: 0.009, // 4insure 로 확인 (31,950)
    premiumRounding: { unit: 10, mode: "floor" },
  },
  incomeTax: {
    tableId: "2026-03-01", // 기본 표. 실제 조회는 기준일(asOf)로 resolveRuleSet 이 고른다 (2026.1~2월은 2024-03-01 표)
    localTaxRate: 0.1,
    withholdingOptions: [0.8, 1, 1.2],
    taxRounding: { unit: 1, mode: "floor" }, // TODO(verify)
    localTaxRounding: { unit: 1, mode: "floor" }, // TODO(verify)
  },
  defaults: {
    nonTaxableMealMonthly: 200_000,
  },
  minimumWage: {
    hourly: 10_320, // TODO(verify)
    monthly: 2_156_880, // TODO(verify) 10,320 × 209h
  },
  notes: [
    "확인됨(2026-09-22, 4insure 모의계산 월급여 3,550,000 / 7,000,000 / 300,000): 국민연금 4.75%, 건강 3.595%, 장기요양 0.9448%, 고용 0.9%, 10원 미만 절사, 7월~ 기준소득월액 하한 41만 / 상한 659만",
    "잔여 확인(제품 결정으로 우선 적용): 1~6월 기준소득월액 40만/637만, 기준소득월액 천원 미만 절사, 소득세·지방소득세 단수 처리, 최저임금 10,320원",
  ],
};
