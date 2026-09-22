import { useMemo } from "react";
import {
  calculateSalary,
  compareResults,
  validateSalaryInput,
  type SalaryResult,
  type ValidationIssue,
  type YearComparison,
} from "@/domain/salary";
import { hasRules, resolveRuleSet, type ResolvedRuleSet } from "@/rules";
import { selectSalaryInput, useCalculatorStore } from "./store";

export interface SalaryPreview {
  ruleSet: ResolvedRuleSet;
  issues: ValidationIssue[];
  result: SalaryResult | null;
  /** 1년 전 같은 시점 기준과 비교. 규칙이 없으면 null */
  comparison: YearComparison | null;
}

/** 스토어 입력으로 실시간 계산. 계산은 순수 함수라 디바운스 없이 즉시 돌린다 (README 4.2). */
export function useSalaryPreview(): SalaryPreview {
  const store = useCalculatorStore();
  return useMemo(() => {
    const ruleSet = resolveRuleSet(store.asOf);
    const input = selectSalaryInput(store);
    const issues = input ? validateSalaryInput(input) : [];
    if (!input || issues.length > 0) return { ruleSet, issues, result: null, comparison: null };

    const result = calculateSalary(input, ruleSet.rules, ruleSet.table, { asOf: ruleSet.asOf });

    const prevYear = ruleSet.rules.year - 1;
    let comparison: YearComparison | null = null;
    if (hasRules(prevYear)) {
      const prev = resolveRuleSet(`${prevYear}${ruleSet.asOf.slice(4)}`);
      const other = calculateSalary({ ...input, year: prevYear }, prev.rules, prev.table, {
        asOf: prev.asOf,
      });
      comparison = compareResults(result, other);
    }
    return { ruleSet, issues, result, comparison };
  }, [store]);
}
