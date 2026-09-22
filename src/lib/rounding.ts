export type RoundingMode = "floor" | "round" | "ceil";

/** 단수 처리 규칙. unit=10, mode="floor" 이면 10원 미만 절사. */
export interface RoundingRule {
  unit: 1 | 10 | 100 | 1000;
  mode: RoundingMode;
}

const EPSILON = 1e-9;

export function applyRounding(value: number, rule: RoundingRule): number {
  const quotient = value / rule.unit;
  let rounded: number;
  switch (rule.mode) {
    case "floor":
      rounded = Math.floor(quotient + EPSILON);
      break;
    case "ceil":
      rounded = Math.ceil(quotient - EPSILON);
      break;
    case "round":
      rounded = Math.round(quotient);
      break;
  }
  return rounded * rule.unit;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
