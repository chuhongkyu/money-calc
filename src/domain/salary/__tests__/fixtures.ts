import type { IncomeTaxTable } from "@/rules/incomeTaxTable/types";
import type { YearRules } from "@/rules/types";

/** 계산 로직 검증용 단순 요율. 실제 연도 값과 무관하다. */
export const fixtureRules: YearRules = {
  year: 2099,
  label: "테스트",
  description: "테스트 요율",
  verified: true,
  sources: [],
  nationalPension: {
    totalRate: 0.1,
    employeeRate: 0.05,
    periods: [
      {
        from: "2099-01-01",
        to: "2099-06-30",
        monthlyIncomeMin: 400_000,
        monthlyIncomeMax: 4_000_000,
      },
      {
        from: "2099-07-01",
        to: "2099-12-31",
        monthlyIncomeMin: 500_000,
        monthlyIncomeMax: 5_000_000,
      },
    ],
    incomeRounding: { unit: 1000, mode: "floor" },
    premiumRounding: { unit: 1, mode: "floor" },
  },
  healthInsurance: {
    totalRate: 0.06,
    employeeRate: 0.03,
    premiumRounding: { unit: 1, mode: "floor" },
  },
  longTermCare: {
    rateOfIncome: 0.003,
    rateOfHealthPremium: 0.1,
    calcMethod: "ofHealthPremium",
    premiumRounding: { unit: 1, mode: "floor" },
  },
  employmentInsurance: { employeeRate: 0.01, premiumRounding: { unit: 1, mode: "floor" } },
  incomeTax: {
    tableId: "fixture",
    localTaxRate: 0.1,
    withholdingOptions: [0.8, 1, 1.2],
    taxRounding: { unit: 1, mode: "floor" },
    localTaxRounding: { unit: 1, mode: "floor" },
  },
  defaults: { nonTaxableMealMonthly: 200_000 },
  minimumWage: { hourly: 10_000, monthly: 2_090_000 },
  notes: [],
};

const eleven = (first: number, step: number): number[] =>
  Array.from({ length: 11 }, (_, i) => Math.max(0, first - i * step));

export const fixtureTable: IncomeTaxTable = {
  tableId: "fixture",
  title: "테스트 표",
  effectiveFrom: "2099-01-01",
  effectiveTo: null,
  verified: true,
  sources: [],
  unit: "KRW",
  dependentsRange: [1, 11],
  brackets: [
    { from: 1_000_000, to: 2_000_000, tax: eleven(10_000, 1_000) },
    { from: 2_000_000, to: 5_000_000, tax: eleven(100_000, 10_000) },
    { from: 5_000_000, to: 10_000_000, tax: eleven(500_000, 20_000) },
  ],
  childAdjustment: { one: 1_000, two: 2_500, threeOrMoreBase: 2_500, perChildOverTwo: 500 },
  highIncome: {
    threshold: 10_000_000,
    // 실제 표처럼 기준행이 마지막 구간보다 조금 크다
    baseTax: eleven(510_000, 20_000),
    segments: [
      { over: 10_000_000, upTo: 20_000_000, fixed: 1_000, taxableRatio: 0.5, rate: 0.2 },
      { over: 20_000_000, upTo: null, fixed: 2_000, taxableRatio: 1, rate: 0.4 },
    ],
  },
};

export const emptyTable: IncomeTaxTable = { ...fixtureTable, brackets: [] };
