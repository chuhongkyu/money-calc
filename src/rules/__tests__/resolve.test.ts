import { describe, expect, it } from "vitest";
import { availableMonths, defaultAsOf, findTableFor, formatAsOfMonth, resolveRuleSet } from "..";

describe("resolveRuleSet (기준일 → 요율 연도 + 간이세액표)", () => {
  it("2026.3.1 이후는 2026 요율 + 2026-03-01 표", () => {
    const r = resolveRuleSet("2026-09-22");
    expect(r.rules.year).toBe(2026);
    expect(r.table.tableId).toBe("2026-03-01");
  });
  it("첫 간이세액표(2026.3.1) 이전 날짜는 표 적용 시작일로 보정", () => {
    expect(resolveRuleSet("2026-02-28")).toMatchObject({ asOf: "2026-03-01" });
    expect(resolveRuleSet("2026-03-01").table.tableId).toBe("2026-03-01");
  });
  it("범위 밖 날짜는 가장 가까운 날짜로 보정", () => {
    expect(resolveRuleSet("2030-01-01")).toMatchObject({ asOf: "2026-12-31" });
    expect(resolveRuleSet("2020-01-01")).toMatchObject({ asOf: "2026-03-01" });
  });
  it("findTableFor 는 표가 없으면 null", () => {
    expect(findTableFor("2020-01-01")).toBeNull();
  });
  it("defaultAsOf 는 오늘을 범위 안으로 보정", () => {
    expect(defaultAsOf(new Date(2026, 8, 22))).toBe("2026-09-22");
    expect(defaultAsOf(new Date(2031, 0, 1))).toBe("2026-12-31");
    expect(defaultAsOf(new Date(2026, 0, 15))).toBe("2026-03-01");
  });
  it("availableMonths 는 최신 월이 앞", () => {
    const months = availableMonths();
    expect(months[0]).toEqual({ value: "2026-12", label: "2026년 12월", asOf: "2026-12-01" });
    expect(months[months.length - 1]?.value).toBe("2026-03");
    expect(months).toHaveLength(10);
  });
  it("formatAsOfMonth", () => {
    expect(formatAsOfMonth("2026-09-22")).toBe("2026년 9월");
  });
});
