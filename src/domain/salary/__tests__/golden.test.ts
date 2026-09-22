import { describe, expect, it } from "vitest";
import { getRuleSet, resolveRuleSet } from "@/rules";
import { calculateSalary } from "../calculate";
import type { SalaryInput } from "../types";

/**
 * 골든 테스트 (README 4.3).
 * 기대값은 국세청 간이세액표·4대보험 모의계산 결과를 **사람이 확인한 값**으로 채운다.
 * expected 가 null 인 케이스는 it.todo 로 남는다. 절대 추측으로 채우지 않는다.
 *
 * 채우는 방법:
 *   1. https://www.4insure.or.kr 모의계산 → 국민연금/건강/장기요양/고용 값 기록
 *   2. https://www.nts.go.kr 간이세액표 조회 → 소득세, 지방소득세(10%) 기록
 *   3. expected 에 아래 6개 항목과 monthlyNet 을 입력하고 checkedBy/checkedAt 을 남긴다
 */
interface GoldenExpected {
  /** 아직 확인하지 못한 항목은 비워 둔다. 채워진 항목만 검사한다 */
  nationalPension?: number;
  healthInsurance?: number;
  longTermCare?: number;
  employmentInsurance?: number;
  incomeTax?: number;
  localIncomeTax?: number;
  monthlyNet?: number;
  /** 확인자 / 확인일 / 출처 메모 */
  checkedBy: string;
  checkedAt: string;
  source: string;
}

interface GoldenCase {
  name: string;
  input: Omit<SalaryInput, "year">;
  /** 국민연금 기간 기준일. 생략하면 해당 연도 최근 기간 */
  asOf?: string;
  expected: GoldenExpected | null;
}

const withDefaults = (
  amount: number,
  dependents: number,
  children: number,
  extra: Partial<Omit<SalaryInput, "year">> = {},
): Omit<SalaryInput, "year"> => ({
  amountType: "annual",
  amount,
  severanceIncluded: false,
  nonTaxableMonthly: 200_000,
  dependents,
  children,
  withholdingRate: 1,
  ...extra,
});

const AMOUNTS = [
  24_000_000, 30_000_000, 40_000_000, 50_000_000, 70_000_000, 100_000_000, 150_000_000,
] as const;
const FAMILY: ReadonlyArray<readonly [dependents: number, children: number]> = [
  [1, 0],
  [2, 0],
  [3, 1],
  [4, 2],
];

function buildCases(): GoldenCase[] {
  const cases: GoldenCase[] = [];
  for (const amount of AMOUNTS) {
    for (const [dependents, children] of FAMILY) {
      cases.push({
        name: `연봉 ${amount / 10_000}만 · 부양 ${dependents} · 자녀 ${children}`,
        input: withDefaults(amount, dependents, children),
        expected: null, // TODO(verify)
      });
    }
  }
  cases.push({
    name: "연봉 5,000만 · 퇴직금 포함 · 부양 1",
    input: withDefaults(50_000_000, 1, 0, { severanceIncluded: true }),
    expected: null, // TODO(verify)
  });
  cases.push({
    name: "연봉 5,000만 · 원천징수 80% · 부양 1",
    input: withDefaults(50_000_000, 1, 0, { withholdingRate: 0.8 }),
    expected: null, // TODO(verify)
  });
  cases.push({
    name: "연봉 5,000만 · 원천징수 120% · 부양 1",
    input: withDefaults(50_000_000, 1, 0, { withholdingRate: 1.2 }),
    expected: null, // TODO(verify)
  });
  cases.push({
    name: "월급 300만 · 비과세 0 · 부양 1",
    input: withDefaults(3_000_000, 1, 0, { amountType: "monthly", nonTaxableMonthly: 0 }),
    expected: null, // TODO(verify)
  });
  return cases;
}

/** 사람이 공식 계산기로 확인한 케이스. 연도별 케이스 뒤에 붙는다 */
const VERIFIED_2026: GoldenCase[] = [
  {
    name: "월급여 3,550,000 (연봉 4,500만 · 비과세 20만) · 부양 1 · 4대보험",
    input: withDefaults(45_000_000, 1, 0),
    asOf: "2026-09-22",
    expected: {
      nationalPension: 168_620,
      healthInsurance: 127_620,
      longTermCare: 16_760,
      employmentInsurance: 31_950,
      // incomeTax / localIncomeTax: TODO(verify) 홈택스 간이세액 계산기
      checkedBy: "hongkyuchu",
      checkedAt: "2026-09-22",
      source: "4대사회보험 정보연계센터 모의계산 (2026년 기준, 150인 미만 기업)",
    },
  },
  {
    name: "월급여 7,000,000 · 국민연금 상한(6,590,000) 적용 · 4대보험",
    input: withDefaults(7_200_000, 1, 0, { amountType: "monthly" }),
    asOf: "2026-09-22",
    expected: {
      nationalPension: 313_020, // 6,590,000 × 4.75% = 313,025 → 10원 미만 절사
      healthInsurance: 251_650,
      longTermCare: 33_060,
      employmentInsurance: 63_000,
      checkedBy: "hongkyuchu",
      checkedAt: "2026-09-22",
      source: "4대사회보험 정보연계센터 모의계산 (2026년 기준, 150인 미만 기업)",
    },
  },
  {
    name: "월급여 300,000 · 국민연금 하한(410,000) 적용 · 4대보험",
    input: withDefaults(500_000, 1, 0, { amountType: "monthly" }),
    asOf: "2026-09-22",
    expected: {
      nationalPension: 19_470, // 410,000 × 4.75% = 19,475 → 10원 미만 절사
      healthInsurance: 10_780,
      longTermCare: 1_410,
      employmentInsurance: 2_700,
      checkedBy: "hongkyuchu",
      checkedAt: "2026-09-22",
      source: "4대사회보험 정보연계센터 모의계산 (2026년 기준, 150인 미만 기업)",
    },
  },
];

const GOLDEN: Record<number, GoldenCase[]> = {
  2026: [...buildCases(), ...VERIFIED_2026],
};

describe.each(Object.keys(GOLDEN).map(Number))("골든 테스트 %d", (year) => {
  const cases = GOLDEN[year] ?? [];

  it("케이스가 20개 이상이다", () => {
    expect(cases.length).toBeGreaterThanOrEqual(20);
  });

  for (const c of cases) {
    if (c.expected === null) {
      it.todo(`${c.name} — TODO(verify) 기대값 필요`);
      continue;
    }
    const expected = c.expected;
    it(c.name, () => {
      const { rules, table } = c.asOf ? resolveRuleSet(c.asOf) : getRuleSet(year);
      const r = calculateSalary({ ...c.input, year }, rules, table, c.asOf ? { asOf: c.asOf } : {});
      const checks: Array<[keyof typeof r.deductions, number | undefined]> = [
        ["nationalPension", expected.nationalPension],
        ["healthInsurance", expected.healthInsurance],
        ["longTermCare", expected.longTermCare],
        ["employmentInsurance", expected.employmentInsurance],
        ["incomeTax", expected.incomeTax],
        ["localIncomeTax", expected.localIncomeTax],
      ];
      for (const [key, value] of checks) {
        if (value !== undefined) expect(r.deductions[key].amount, key).toBe(value);
      }
      if (expected.monthlyNet !== undefined) expect(r.monthlyNet).toBe(expected.monthlyNet);
    });
  }
});
