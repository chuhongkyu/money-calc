/**
 * 금액 문자열 처리 유틸. React/브라우저에 의존하지 않는다.
 */

/** 숫자 이외의 문자를 모두 제거한다. */
export function onlyDigits(text: string): string {
  return text.replace(/\D+/g, "");
}

/** "007" → "7", "0" → "0" */
export function stripLeadingZeros(digits: string): string {
  return digits.replace(/^0+(?=\d)/, "");
}

/** 45000000 → "45,000,000". null/NaN은 빈 문자열. 소수/음수는 절사·절대값 처리. */
export function formatWithCommas(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return Math.trunc(Math.abs(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** "45,000,000" → 45000000. 숫자가 하나도 없으면 null. */
export function parseDigits(text: string): number | null {
  const digits = stripLeadingZeros(onlyDigits(text));
  return digits === "" ? null : Number(digits);
}

/** "2천" → 2000, "2천5" → 2005, "2,345" → 2345, "" → 0 */
function parseKoreanGroup(text: string): number {
  let total = 0;
  let rest = text;
  const thousand = rest.match(/^(\d*)천/);
  if (thousand) {
    total += (thousand[1] === "" ? 1 : Number(thousand[1])) * 1_000;
    rest = rest.slice(thousand[0].length);
  }
  return total + (parseDigits(rest) ?? 0);
}

/**
 * 붙여넣기용 파서. 한글 단위(억/만/천)를 이해한다.
 * "4,500만원" → 45,000,000 / "1억 2천만" → 120,000,000 / "3,000,000" → 3,000,000
 * 숫자가 전혀 없으면 null.
 */
export function parseMoneyText(text: string): number | null {
  const cleaned = text.replace(/[\s,원₩]/g, "").replace(/^[^\d억만천]*/, "");
  if (!/[억만천]/.test(cleaned)) return parseDigits(cleaned);

  let total = 0;
  let rest = cleaned;
  for (const [unit, multiplier] of [
    ["억", 100_000_000],
    ["만", 10_000],
  ] as const) {
    const idx = rest.indexOf(unit);
    if (idx < 0) continue;
    const group = rest.slice(0, idx);
    total += (group === "" ? 1 : parseKoreanGroup(group)) * multiplier;
    rest = rest.slice(idx + 1);
  }
  total += parseKoreanGroup(rest);
  return total > 0 ? total : null;
}

/**
 * 한글 금액 표기. 45,000,000 → "4,500만 원", 123,456,789 → "1억 2,345만 6,789원", 0 → "0원"
 */
export function formatKoreanMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const n = Math.trunc(Math.abs(value));
  if (n === 0) return "0원";

  const eok = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const won = n % 10_000;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${formatWithCommas(eok)}억`);
  if (man > 0) parts.push(`${formatWithCommas(man)}만`);
  if (won > 0) parts.push(formatWithCommas(won));

  const endsWithUnit = won === 0;
  return `${parts.join(" ")}${endsWithUnit ? " 원" : "원"}`;
}

/** 1234567 → "1,234,567원" */
export function formatWon(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${formatWithCommas(value)}원`;
}

/** 차이 표시용. +1,000 → "+1,000원", -1,000 → "−1,000원", 0 → "0원" */
export function formatSignedWon(value: number): string {
  if (value === 0) return "0원";
  const sign = value > 0 ? "+" : "−";
  return `${sign}${formatWithCommas(value)}원`;
}

/** 0.0475 → "4.75%" */
export function formatRate(rate: number, fractionDigits = 2): string {
  const pct = rate * 100;
  const text = pct.toFixed(fractionDigits).replace(/\.?0+$/, "");
  return `${text}%`;
}
