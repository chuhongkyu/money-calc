import { describe, expect, it } from "vitest";
import { childAdjustmentAmount, lookupIncomeTax } from "../incomeTax";
import { emptyTable, fixtureTable } from "./fixtures";

describe("childAdjustmentAmount", () => {
  it("자녀 수별 차감액", () => {
    expect(childAdjustmentAmount(fixtureTable, 0)).toBe(0);
    expect(childAdjustmentAmount(fixtureTable, 1)).toBe(1_000);
    expect(childAdjustmentAmount(fixtureTable, 2)).toBe(2_500);
    expect(childAdjustmentAmount(fixtureTable, 3)).toBe(3_000);
    expect(childAdjustmentAmount(fixtureTable, 5)).toBe(4_000);
  });
});

describe("lookupIncomeTax", () => {
  it("표 데이터가 없으면 null", () => {
    expect(lookupIncomeTax(emptyTable, 3_000_000, 1, 0)).toBeNull();
  });

  it("표 하한 미만은 0 (belowTable)", () => {
    expect(lookupIncomeTax(fixtureTable, 999_999, 1, 0)).toMatchObject({
      amount: 0,
      source: "belowTable",
    });
  });

  it("구간 조회 (from 포함, to 제외)", () => {
    expect(lookupIncomeTax(fixtureTable, 1_000_000, 1, 0)).toMatchObject({
      amount: 10_000,
      source: "table",
    });
    expect(lookupIncomeTax(fixtureTable, 1_999_999, 1, 0)).toMatchObject({ amount: 10_000 });
    expect(lookupIncomeTax(fixtureTable, 2_000_000, 1, 0)).toMatchObject({ amount: 100_000 });
  });

  it("부양가족 수에 따라 열이 바뀌고 범위를 벗어나면 클램프", () => {
    expect(lookupIncomeTax(fixtureTable, 3_000_000, 2, 0)?.amount).toBe(90_000);
    expect(lookupIncomeTax(fixtureTable, 3_000_000, 11, 0)?.amount).toBe(0);
    expect(lookupIncomeTax(fixtureTable, 3_000_000, 0, 0)?.amount).toBe(100_000);
  });

  it("11명 초과: 11명 세액 − (10명 − 11명) × 초과 인원 (표 주석 4), 음수면 0", () => {
    // 구간 3 (5,000,000~): 10명 320,000 / 11명 300,000 → 12명 280,000, 13명 260,000
    expect(lookupIncomeTax(fixtureTable, 6_000_000, 12, 0)?.amount).toBe(280_000);
    expect(lookupIncomeTax(fixtureTable, 6_000_000, 13, 0)?.amount).toBe(260_000);
    // 구간 2: 10명 10,000 / 11명 0 → 12명은 음수 → 0
    expect(lookupIncomeTax(fixtureTable, 3_000_000, 12, 0)?.amount).toBe(0);
  });

  it("자녀 차감은 0 아래로 내려가지 않는다", () => {
    expect(lookupIncomeTax(fixtureTable, 1_500_000, 1, 2)).toMatchObject({
      tableTax: 10_000,
      childAdjustment: 2_500,
      amount: 7_500,
    });
    expect(lookupIncomeTax(fixtureTable, 1_500_000, 10, 3)?.amount).toBe(0);
  });

  it("세액이 0이면 자녀 차감도 0", () => {
    expect(lookupIncomeTax(fixtureTable, 500_000, 1, 2)?.childAdjustment).toBe(0);
  });

  it("월 1,000만 원 이상은 산식 (formula)", () => {
    // baseTax(부양 1명) 510,000 + fixed 1,000 + (12,000,000 − 10,000,000) × 0.5 × 0.2 = 701,000
    expect(lookupIncomeTax(fixtureTable, 12_000_000, 1, 0)).toMatchObject({
      amount: 711_000,
      source: "formula",
    });
    // 두 번째 구간: 510,000 + 2,000 + (25,000,000 − 20,000,000) × 1 × 0.4 = 2,502,000
    expect(lookupIncomeTax(fixtureTable, 25_000_000, 1, 0)?.amount).toBe(2_512_000);
    // 부양가족 3명 열 (510,000 − 40,000)
    expect(lookupIncomeTax(fixtureTable, 10_000_000, 3, 0)?.amount).toBe(471_000);
  });

  it("산식 구간에도 자녀 차감 적용", () => {
    expect(lookupIncomeTax(fixtureTable, 12_000_000, 1, 1)?.amount).toBe(710_000);
  });
});
