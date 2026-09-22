import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  SALARY_LIMITS,
  type AmountType,
  type SalaryInput,
  type WithholdingRate,
} from "@/domain/salary";
import { preferencesStorage } from "@/platform/storage";
import { defaultAsOf, getRules, resolveRuleSet } from "@/rules";

export interface CalculatorData {
  /** 기준일 (YYYY-MM-DD). 요율 연도와 간이세액표를 이 날짜로 고른다. 기본은 오늘 */
  asOf: string;
  amountType: AmountType;
  amount: number | null;
  severanceIncluded: boolean;
  nonTaxableMonthly: number;
  dependents: number;
  children: number;
  withholdingRate: WithholdingRate;
}

export interface CalculatorActions {
  setAsOf: (asOf: string) => void;
  setAmountType: (type: AmountType) => void;
  setAmount: (amount: number | null) => void;
  addAmount: (delta: number) => void;
  setSeveranceIncluded: (included: boolean) => void;
  setNonTaxableMonthly: (amount: number | null) => void;
  setDependents: (count: number) => void;
  setChildren: (count: number) => void;
  setWithholdingRate: (rate: WithholdingRate) => void;
  reset: () => void;
}

export type CalculatorStore = CalculatorData & CalculatorActions;

export const initialCalculatorData = (asOf: string = defaultAsOf()): CalculatorData => ({
  asOf,
  amountType: "annual",
  amount: null,
  severanceIncluded: false,
  nonTaxableMonthly: getRules(resolveRuleSet(asOf).rules.year).defaults.nonTaxableMealMonthly,
  dependents: 1,
  children: 0,
  withholdingRate: 1,
});

const clampInt = (v: number, min: number, max: number) =>
  Math.min(Math.max(Math.round(v), min), max);

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set) => ({
      ...initialCalculatorData(),

      setAsOf: (asOf) => set({ asOf: resolveRuleSet(asOf).asOf }),
      setAmountType: (amountType) =>
        set((s) => {
          if (s.amountType === amountType) return {};
          const amount =
            s.amount === null
              ? null
              : amountType === "monthly"
                ? Math.floor(s.amount / 12)
                : s.amount * 12;
          const max = amountType === "annual" ? SALARY_LIMITS.maxAnnual : SALARY_LIMITS.maxMonthly;
          return { amountType, amount: amount === null ? null : Math.min(amount, max) };
        }),
      setAmount: (amount) => set({ amount }),
      addAmount: (delta) =>
        set((s) => {
          const max =
            s.amountType === "annual" ? SALARY_LIMITS.maxAnnual : SALARY_LIMITS.maxMonthly;
          return { amount: Math.min((s.amount ?? 0) + delta, max) };
        }),
      setSeveranceIncluded: (severanceIncluded) => set({ severanceIncluded }),
      setNonTaxableMonthly: (amount) => set({ nonTaxableMonthly: amount ?? 0 }),
      setDependents: (count) =>
        set((s) => {
          const dependents = clampInt(
            count,
            SALARY_LIMITS.minDependents,
            SALARY_LIMITS.maxDependents,
          );
          // 부양가족을 줄이면 자녀 수를 자동 보정 (README 4.2)
          const children = Math.min(s.children, dependents - 1);
          return { dependents, children };
        }),
      setChildren: (count) =>
        set((s) => ({ children: clampInt(count, 0, Math.max(0, s.dependents - 1)) })),
      setWithholdingRate: (withholdingRate) => set({ withholdingRate }),
      reset: () => set(() => ({ ...initialCalculatorData() })),
    }),
    {
      name: "salary-calc.calculator.v2",
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (s) => ({
        // 기준일은 저장하지 않는다: 다시 열면 오늘 기준. (상세 화면에서 바꾼 값은 세션 안에서만 유지)
        amountType: s.amountType,
        amount: s.amount,
        severanceIncluded: s.severanceIncluded,
        nonTaxableMonthly: s.nonTaxableMonthly,
        dependents: s.dependents,
        children: s.children,
        withholdingRate: s.withholdingRate,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...((persisted ?? {}) as Partial<CalculatorData>),
      }),
    },
  ),
);

/** 스토어 → 도메인 입력. 금액이 없으면 null */
export function selectSalaryInput(s: CalculatorData): SalaryInput | null {
  if (s.amount === null) return null;
  return {
    year: resolveRuleSet(s.asOf).rules.year,
    amountType: s.amountType,
    amount: s.amount,
    severanceIncluded: s.severanceIncluded,
    nonTaxableMonthly: s.nonTaxableMonthly,
    dependents: s.dependents,
    children: s.children,
    withholdingRate: s.withholdingRate,
  };
}
