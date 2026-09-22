import { describe, expect, it } from "vitest";
import { applyRounding, clamp } from "../rounding";

describe("applyRounding", () => {
  it("원 단위 절사", () => {
    expect(applyRounding(1234.9, { unit: 1, mode: "floor" })).toBe(1234);
  });
  it("10원 미만 절사", () => {
    expect(applyRounding(1239, { unit: 10, mode: "floor" })).toBe(1230);
  });
  it("천원 미만 절사", () => {
    expect(applyRounding(2_845_999, { unit: 1000, mode: "floor" })).toBe(2_845_000);
  });
  it("반올림 / 올림", () => {
    expect(applyRounding(1235, { unit: 10, mode: "round" })).toBe(1240);
    expect(applyRounding(1231, { unit: 10, mode: "ceil" })).toBe(1240);
  });
  it("부동소수점 오차를 흡수한다 (2,800,000 × 0.03)", () => {
    expect(applyRounding(2_800_000 * 0.03, { unit: 1, mode: "floor" })).toBe(84_000);
    expect(applyRounding(84_000 * 0.1, { unit: 1, mode: "floor" })).toBe(8_400);
  });
});

describe("clamp", () => {
  it("범위 안으로 자른다", () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 1, 10)).toBe(1);
    expect(clamp(99, 1, 10)).toBe(10);
  });
});
