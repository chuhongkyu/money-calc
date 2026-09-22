import { describe, expect, it } from "vitest";
import { availableYears, getIncomeTaxTable, getRuleSet, getRules, hasRules, latestYear } from "..";

describe("rules registry", () => {
  it("최신 연도가 앞에 온다", () => {
    expect(availableYears).toEqual([2026]);
    expect(latestYear).toBe(2026);
  });

  it("hasRules / getRules", () => {
    expect(hasRules(2026)).toBe(true);
    expect(hasRules(2030)).toBe(false);
    expect(() => getRules(2030)).toThrow();
  });

  it.each(availableYears)("%d 규칙 데이터 정합성", (year) => {
    const { rules, table } = getRuleSet(year);
    expect(rules.year).toBe(year);
    // 표의 적용 기간이 해당 연도를 덮는다
    expect(table.effectiveFrom <= `${year}-12-31`).toBe(true);
    expect(table.effectiveTo === null || table.effectiveTo >= `${year}-01-01`).toBe(true);
    expect(getIncomeTaxTable(rules.incomeTax.tableId)).toBe(table);

    // 근로자 요율은 총 요율의 절반
    expect(rules.nationalPension.employeeRate * 2).toBeCloseTo(rules.nationalPension.totalRate, 6);
    expect(rules.healthInsurance.employeeRate * 2).toBeCloseTo(rules.healthInsurance.totalRate, 6);

    // 기간은 해당 연도 안에서 빈틈 없이 이어진다
    const periods = [...rules.nationalPension.periods].sort((a, b) => (a.from < b.from ? -1 : 1));
    expect(periods[0]?.from).toBe(`${year}-01-01`);
    expect(periods[periods.length - 1]?.to).toBe(`${year}-12-31`);
    for (let i = 1; i < periods.length; i += 1) {
      const prev = new Date(periods[i - 1]!.to);
      const next = new Date(periods[i]!.from);
      expect(next.getTime() - prev.getTime()).toBe(24 * 60 * 60 * 1000);
    }
    for (const p of periods) {
      expect(p.monthlyIncomeMin).toBeLessThan(p.monthlyIncomeMax);
    }

    expect(rules.incomeTax.withholdingOptions).toEqual([0.8, 1, 1.2]);
    expect(rules.incomeTax.localTaxRate).toBe(0.1);
    expect(rules.minimumWage.monthly).toBeGreaterThan(rules.minimumWage.hourly * 200);

    // 간이세액표 스키마
    expect(table.dependentsRange).toEqual([1, 11]);
    for (const b of table.brackets) {
      expect(b.tax).toHaveLength(11);
      expect(b.from).toBeLessThan(b.to);
    }
    expect(table.brackets.length).toBeGreaterThan(600);
    expect(table.brackets[0]?.from).toBe(770_000);
    expect(table.brackets[table.brackets.length - 1]?.to).toBe(table.highIncome.threshold);
    expect(table.highIncome.baseTax).toHaveLength(11);
    const segs = table.highIncome.segments;
    expect(segs[0]?.over).toBe(table.highIncome.threshold);
    expect(segs[segs.length - 1]?.upTo).toBeNull();
  });

  it("2026 데이터는 verified: true (4insure 모의계산 + 홈택스 원본 표)", () => {
    const { rules, table } = getRuleSet(2026);
    expect(rules.verified).toBe(true);
    expect(table.verified).toBe(true);
  });
});
