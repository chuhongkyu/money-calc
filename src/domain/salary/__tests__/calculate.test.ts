import { describe, expect, it } from "vitest";
import { calculateSalary, toMonthlySalary, validateSalaryInput } from "../calculate";
import { compareResults } from "../compare";
import { DEDUCTION_ORDER, type SalaryInput } from "../types";
import { emptyTable, fixtureRules, fixtureTable } from "./fixtures";

const base: SalaryInput = {
  year: 2099,
  amountType: "annual",
  amount: 36_000_000,
  severanceIncluded: false,
  nonTaxableMonthly: 200_000,
  dependents: 1,
  children: 0,
  withholdingRate: 1,
};

describe("toMonthlySalary", () => {
  it("연봉 ÷ 12", () => expect(toMonthlySalary(base)).toBe(3_000_000));
  it("퇴직금 포함이면 ÷ 13 (절사)", () =>
    expect(toMonthlySalary({ ...base, severanceIncluded: true })).toBe(2_769_230));
  it("월급 입력은 그대로", () =>
    expect(toMonthlySalary({ ...base, amountType: "monthly", amount: 2_500_000 })).toBe(2_500_000));
});

describe("validateSalaryInput", () => {
  it("정상 입력은 이슈 없음", () => expect(validateSalaryInput(base)).toEqual([]));
  it("금액 없음", () =>
    expect(validateSalaryInput({ ...base, amount: 0 }).map((i) => i.code)).toEqual([
      "AMOUNT_REQUIRED",
    ]));
  it("연봉 상한 10억 / 월급 상한 1억", () => {
    expect(validateSalaryInput({ ...base, amount: 1_000_000_001 }).map((i) => i.code)).toEqual([
      "AMOUNT_EXCEEDS_MAX",
    ]);
    expect(validateSalaryInput({ ...base, amount: 1_000_000_000 })).toEqual([]);
    expect(
      validateSalaryInput({ ...base, amountType: "monthly", amount: 100_000_001 }).map(
        (i) => i.code,
      ),
    ).toEqual(["AMOUNT_EXCEEDS_MAX"]);
  });
  it("비과세가 월 급여 이상이면 막는다", () => {
    expect(
      validateSalaryInput({ ...base, nonTaxableMonthly: 3_000_000 }).map((i) => i.code),
    ).toEqual(["TAXABLE_NOT_POSITIVE"]);
    expect(validateSalaryInput({ ...base, nonTaxableMonthly: -1 }).map((i) => i.code)).toContain(
      "NON_TAXABLE_NEGATIVE",
    );
  });
  it("부양가족 1~11, 자녀는 부양가족 − 1 이하", () => {
    expect(validateSalaryInput({ ...base, dependents: 0 }).map((i) => i.code)).toContain(
      "DEPENDENTS_OUT_OF_RANGE",
    );
    expect(validateSalaryInput({ ...base, dependents: 12 }).map((i) => i.code)).toContain(
      "DEPENDENTS_OUT_OF_RANGE",
    );
    expect(validateSalaryInput({ ...base, dependents: 2, children: 2 }).map((i) => i.code)).toEqual(
      ["CHILDREN_OUT_OF_RANGE"],
    );
    expect(validateSalaryInput({ ...base, dependents: 2, children: 1 })).toEqual([]);
  });
});

describe("calculateSalary", () => {
  it("연봉 3,600만 · 부양 1 · 비과세 20만 (fixture 요율)", () => {
    const r = calculateSalary(base, fixtureRules, fixtureTable);
    expect(r.monthlySalary).toBe(3_000_000);
    expect(r.taxableSalary).toBe(2_800_000);
    expect(r.deductions.nationalPension.amount).toBe(140_000); // 2,800,000 × 5%
    expect(r.deductions.healthInsurance.amount).toBe(84_000); // × 3%
    expect(r.deductions.longTermCare.amount).toBe(8_400); // 건보 × 10%
    expect(r.deductions.employmentInsurance.amount).toBe(28_000); // × 1%
    expect(r.deductions.incomeTax.amount).toBe(100_000); // 표 2구간 부양 1명
    expect(r.deductions.localIncomeTax.amount).toBe(10_000);
    expect(r.totalDeductions).toBe(370_400);
    expect(r.monthlyNet).toBe(2_629_600);
    expect(r.annualNet).toBe(31_555_200);
    expect(r.annualGross).toBe(36_000_000);
    expect(r.appliedPensionPeriod.from).toBe("2099-07-01");
    expect(r.warnings).toEqual([]);
    expect(r.verified).toBe(true);
    expect(Object.keys(r.deductions)).toEqual([...DEDUCTION_ORDER]);
  });

  it("원천징수 비율 80% / 120%", () => {
    expect(
      calculateSalary({ ...base, withholdingRate: 0.8 }, fixtureRules, fixtureTable).deductions
        .incomeTax.amount,
    ).toBe(80_000);
    const r120 = calculateSalary({ ...base, withholdingRate: 1.2 }, fixtureRules, fixtureTable);
    expect(r120.deductions.incomeTax.amount).toBe(120_000);
    expect(r120.deductions.localIncomeTax.amount).toBe(12_000);
  });

  it("자녀 차감이 소득세와 지방소득세에 반영", () => {
    const r = calculateSalary({ ...base, dependents: 3, children: 2 }, fixtureRules, fixtureTable);
    // 표 2구간 부양 3명 = 80,000 − 자녀 2명 2,500 = 77,500
    expect(r.deductions.incomeTax.amount).toBe(77_500);
    expect(r.deductions.localIncomeTax.amount).toBe(7_750);
  });

  it("국민연금 상한 적용 (연봉 1.2억)", () => {
    const r = calculateSalary({ ...base, amount: 120_000_000 }, fixtureRules, fixtureTable);
    expect(r.taxableSalary).toBe(9_800_000);
    expect(r.deductions.nationalPension.amount).toBe(250_000); // 상한 5,000,000 × 5%
  });

  it("asOf 로 상반기 기간 선택", () => {
    const r = calculateSalary({ ...base, amount: 120_000_000 }, fixtureRules, fixtureTable, {
      asOf: "2099-03-01",
    });
    expect(r.appliedPensionPeriod.from).toBe("2099-01-01");
    expect(r.deductions.nationalPension.amount).toBe(200_000); // 상한 4,000,000 × 5%
  });

  it("월 1,000만 원 초과 산식 구간", () => {
    const r = calculateSalary(
      { ...base, amountType: "monthly", amount: 12_200_000 },
      fixtureRules,
      fixtureTable,
    );
    expect(r.taxableSalary).toBe(12_000_000);
    expect(r.deductions.incomeTax.amount).toBe(711_000);
  });

  it("퇴직금 포함이면 월 급여 = 연봉 ÷ 13", () => {
    const r = calculateSalary({ ...base, severanceIncluded: true }, fixtureRules, fixtureTable);
    expect(r.monthlySalary).toBe(2_769_230);
    expect(r.annualGross).toBe(2_769_230 * 12);
  });

  it("최저임금 미만 경고", () => {
    const r = calculateSalary(
      { ...base, amountType: "monthly", amount: 1_500_000 },
      fixtureRules,
      fixtureTable,
    );
    expect(r.warnings).toContain("BELOW_MINIMUM_WAGE");
  });

  it("간이세액표가 비어 있으면 소득세 0 + 경고", () => {
    const r = calculateSalary(base, fixtureRules, emptyTable);
    expect(r.deductions.incomeTax.amount).toBe(0);
    expect(r.deductions.localIncomeTax.amount).toBe(0);
    expect(r.warnings).toContain("INCOME_TAX_TABLE_MISSING");
  });

  it("검증 전 규칙이면 RULES_UNVERIFIED 경고", () => {
    const r = calculateSalary(base, { ...fixtureRules, verified: false }, fixtureTable);
    expect(r.warnings).toContain("RULES_UNVERIFIED");
    expect(r.verified).toBe(false);
  });

  it("검증 실패 입력은 throw", () => {
    expect(() => calculateSalary({ ...base, amount: 0 }, fixtureRules, fixtureTable)).toThrow(
      /AMOUNT_REQUIRED/,
    );
  });
});

describe("compareResults", () => {
  it("연도 간 월 실수령액·항목별 차이", () => {
    const a = calculateSalary(base, fixtureRules, fixtureTable);
    const b = calculateSalary(
      base,
      {
        ...fixtureRules,
        year: 2098,
        nationalPension: { ...fixtureRules.nationalPension, employeeRate: 0.045 },
      },
      fixtureTable,
    );
    const c = compareResults(a, b);
    expect(c.baseYear).toBe(2099);
    expect(c.otherYear).toBe(2098);
    expect(c.deductionDiffs.nationalPension).toBe(140_000 - 126_000);
    expect(c.monthlyNetDiff).toBe(-14_000);
    expect(c.deductionDiffs.healthInsurance).toBe(0);
  });
});
