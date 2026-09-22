import { describe, expect, it } from "vitest";
import {
  formatKoreanMoney,
  formatRate,
  formatSignedWon,
  formatWithCommas,
  formatWon,
  onlyDigits,
  parseDigits,
  parseMoneyText,
  stripLeadingZeros,
} from "../money";

describe("formatWithCommas", () => {
  it("천 단위 콤마를 넣는다", () => {
    expect(formatWithCommas(0)).toBe("0");
    expect(formatWithCommas(999)).toBe("999");
    expect(formatWithCommas(1000)).toBe("1,000");
    expect(formatWithCommas(45000000)).toBe("45,000,000");
    expect(formatWithCommas(1000000000)).toBe("1,000,000,000");
  });
  it("null/undefined/NaN 은 빈 문자열", () => {
    expect(formatWithCommas(null)).toBe("");
    expect(formatWithCommas(undefined)).toBe("");
    expect(formatWithCommas(Number.NaN)).toBe("");
  });
  it("음수와 소수는 절대값·절사", () => {
    expect(formatWithCommas(-1234.9)).toBe("1,234");
  });
});

describe("onlyDigits / stripLeadingZeros / parseDigits", () => {
  it("숫자만 남긴다", () => {
    expect(onlyDigits("4,500만원")).toBe("4500");
    expect(onlyDigits("abc")).toBe("");
  });
  it("앞자리 0 제거, 단독 0 유지", () => {
    expect(stripLeadingZeros("007")).toBe("7");
    expect(stripLeadingZeros("0")).toBe("0");
    expect(stripLeadingZeros("000")).toBe("0");
  });
  it("parseDigits", () => {
    expect(parseDigits("45,000,000")).toBe(45000000);
    expect(parseDigits("")).toBeNull();
    expect(parseDigits("원")).toBeNull();
    expect(parseDigits("0")).toBe(0);
  });
});

describe("parseMoneyText (붙여넣기)", () => {
  it("콤마 숫자", () => {
    expect(parseMoneyText("3,000,000")).toBe(3000000);
    expect(parseMoneyText(" 3,000,000원 ")).toBe(3000000);
  });
  it("한글 단위 만/억/천", () => {
    expect(parseMoneyText("4,500만원")).toBe(45000000);
    expect(parseMoneyText("4500만")).toBe(45000000);
    expect(parseMoneyText("1억")).toBe(100000000);
    expect(parseMoneyText("1억 2천만")).toBe(120000000);
    expect(parseMoneyText("1억 2,345만 6,789원")).toBe(123456789);
    expect(parseMoneyText("억")).toBe(100000000);
  });
  it("앞에 붙은 문구는 무시", () => {
    expect(parseMoneyText("연봉 4,500만원")).toBe(45000000);
    expect(parseMoneyText("₩45,000,000")).toBe(45000000);
  });
  it("숫자가 없으면 null", () => {
    expect(parseMoneyText("없음")).toBeNull();
    expect(parseMoneyText("")).toBeNull();
  });
});

describe("formatKoreanMoney", () => {
  it("만 단위", () => {
    expect(formatKoreanMoney(45000000)).toBe("4,500만 원");
    expect(formatKoreanMoney(10000)).toBe("1만 원");
    expect(formatKoreanMoney(2000000)).toBe("200만 원");
  });
  it("억 단위와 나머지 원", () => {
    expect(formatKoreanMoney(100000000)).toBe("1억 원");
    expect(formatKoreanMoney(123456789)).toBe("1억 2,345만 6,789원");
    expect(formatKoreanMoney(100005000)).toBe("1억 5,000원");
  });
  it("만 미만", () => {
    expect(formatKoreanMoney(0)).toBe("0원");
    expect(formatKoreanMoney(9999)).toBe("9,999원");
  });
  it("null 은 빈 문자열", () => {
    expect(formatKoreanMoney(null)).toBe("");
  });
});

describe("formatWon / formatSignedWon / formatRate", () => {
  it("formatWon", () => {
    expect(formatWon(1234567)).toBe("1,234,567원");
    expect(formatWon(-500)).toBe("-500원");
  });
  it("formatSignedWon", () => {
    expect(formatSignedWon(1000)).toBe("+1,000원");
    expect(formatSignedWon(-1000)).toBe("−1,000원");
    expect(formatSignedWon(0)).toBe("0원");
  });
  it("formatRate", () => {
    expect(formatRate(0.0475)).toBe("4.75%");
    expect(formatRate(0.09)).toBe("9%");
    expect(formatRate(0.03595, 3)).toBe("3.595%");
  });
});
