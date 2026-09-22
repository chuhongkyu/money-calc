import { describe, expect, it } from "vitest";
import {
  calcEmploymentInsurance,
  calcHealthInsurance,
  calcLongTermCare,
  calcNationalPension,
  selectPensionPeriod,
} from "../insurance";
import { fixtureRules } from "./fixtures";

const np = fixtureRules.nationalPension;

describe("selectPensionPeriod", () => {
  it("기준일이 없으면 가장 최근 기간", () => {
    expect(selectPensionPeriod(np.periods).from).toBe("2099-07-01");
  });
  it("기준일이 있으면 그 날짜가 속한 기간", () => {
    expect(selectPensionPeriod(np.periods, "2099-03-15").from).toBe("2099-01-01");
    expect(selectPensionPeriod(np.periods, "2099-07-01").from).toBe("2099-07-01");
  });
  it("기준일이 어느 기간에도 없으면 최근 기간", () => {
    expect(selectPensionPeriod(np.periods, "2100-01-01").from).toBe("2099-07-01");
  });
  it("정렬되지 않은 입력도 처리", () => {
    expect(selectPensionPeriod([...np.periods].reverse()).from).toBe("2099-07-01");
  });
  it("빈 배열이면 throw", () => {
    expect(() => selectPensionPeriod([])).toThrow();
  });
});

describe("calcNationalPension", () => {
  const period = np.periods[1]!;
  it("기준소득월액 천원 미만 절사 후 요율 적용", () => {
    expect(calcNationalPension(2_845_999, np, period)).toEqual({
      baseIncome: 2_845_000,
      amount: 142_250,
    });
  });
  it("상한 적용", () => {
    expect(calcNationalPension(9_000_000, np, period)).toEqual({
      baseIncome: 5_000_000,
      amount: 250_000,
    });
  });
  it("하한 적용", () => {
    expect(calcNationalPension(100_000, np, period)).toEqual({
      baseIncome: 500_000,
      amount: 25_000,
    });
  });
});

describe("건강보험 / 장기요양 / 고용보험", () => {
  it("건강보험 = 과세 급여 × 요율 (절사)", () => {
    expect(calcHealthInsurance(2_800_000, fixtureRules.healthInsurance)).toBe(84_000);
    expect(calcHealthInsurance(2_800_033, fixtureRules.healthInsurance)).toBe(84_000);
  });
  it("장기요양 ofHealthPremium", () => {
    expect(calcLongTermCare(2_800_000, 84_000, fixtureRules.longTermCare)).toBe(8_400);
  });
  it("장기요양 ofIncome", () => {
    const rule = { ...fixtureRules.longTermCare, calcMethod: "ofIncome" as const };
    expect(calcLongTermCare(2_800_000, 84_000, rule)).toBe(8_400);
    expect(calcLongTermCare(2_800_333, 0, rule)).toBe(8_400);
  });
  it("고용보험", () => {
    expect(calcEmploymentInsurance(2_800_000, fixtureRules.employmentInsurance)).toBe(28_000);
  });
});
