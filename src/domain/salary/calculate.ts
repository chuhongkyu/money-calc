import { formatWithCommas } from "@/lib/money";
import { applyRounding } from "@/lib/rounding";
import type { IncomeTaxTable } from "@/rules/incomeTaxTable/types";
import type { YearRules } from "@/rules/types";
import { lookupIncomeTax } from "./incomeTax";
import {
  calcEmploymentInsurance,
  calcHealthInsurance,
  calcLongTermCare,
  calcNationalPension,
  selectPensionPeriod,
} from "./insurance";
import {
  SALARY_LIMITS,
  type DeductionItem,
  type SalaryInput,
  type SalaryResult,
  type ValidationIssue,
  type WarningCode,
} from "./types";

export interface CalculateOptions {
  /** 국민연금 기간 선택 기준일 (ISO). 생략하면 선택 연도의 가장 최근 기간 */
  asOf?: string;
}

/** 월 급여 = 연봉 ÷ (퇴직금 포함 ? 13 : 12). 월급 입력이면 그대로. */
export function toMonthlySalary(
  input: Pick<SalaryInput, "amount" | "amountType" | "severanceIncluded">,
): number {
  if (input.amountType === "monthly") return Math.floor(input.amount);
  const divisor = input.severanceIncluded ? 13 : 12;
  return Math.floor(input.amount / divisor);
}

export function validateSalaryInput(input: SalaryInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const max = input.amountType === "annual" ? SALARY_LIMITS.maxAnnual : SALARY_LIMITS.maxMonthly;

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    issues.push({ code: "AMOUNT_REQUIRED", message: "금액을 입력해 주세요." });
  } else if (input.amount > max) {
    issues.push({
      code: "AMOUNT_EXCEEDS_MAX",
      message: `최대 ${formatWithCommas(max)}원까지 입력할 수 있어요.`,
    });
  }

  if (input.nonTaxableMonthly < 0) {
    issues.push({ code: "NON_TAXABLE_NEGATIVE", message: "비과세액은 0원 이상이어야 해요." });
  }

  if (issues.length === 0 && toMonthlySalary(input) - input.nonTaxableMonthly <= 0) {
    issues.push({
      code: "TAXABLE_NOT_POSITIVE",
      message: "비과세액이 월 급여보다 크거나 같아요. 비과세액을 줄여 주세요.",
    });
  }

  if (
    input.dependents < SALARY_LIMITS.minDependents ||
    input.dependents > SALARY_LIMITS.maxDependents
  ) {
    issues.push({
      code: "DEPENDENTS_OUT_OF_RANGE",
      message: `부양가족 수는 ${SALARY_LIMITS.minDependents}~${SALARY_LIMITS.maxDependents}명 사이여야 해요.`,
    });
  }

  if (input.children < 0 || input.children > Math.max(0, input.dependents - 1)) {
    issues.push({
      code: "CHILDREN_OUT_OF_RANGE",
      message: "자녀 수는 본인을 제외한 부양가족 수를 넘을 수 없어요.",
    });
  }

  return issues;
}

/**
 * 순수 계산 함수. (input, rules, table) => result
 * 입력은 validateSalaryInput 으로 먼저 검증한다. 검증되지 않은 입력이면 throw.
 */
export function calculateSalary(
  input: SalaryInput,
  rules: YearRules,
  table: IncomeTaxTable,
  options: CalculateOptions = {},
): SalaryResult {
  const issues = validateSalaryInput(input);
  if (issues.length > 0) {
    throw new Error(`Invalid salary input: ${issues.map((i) => i.code).join(", ")}`);
  }

  const warnings: WarningCode[] = [];
  const monthlySalary = toMonthlySalary(input);
  const taxableSalary = monthlySalary - input.nonTaxableMonthly;

  const period = selectPensionPeriod(rules.nationalPension.periods, options.asOf);
  const pension = calcNationalPension(taxableSalary, rules.nationalPension, period);
  const health = calcHealthInsurance(taxableSalary, rules.healthInsurance);
  const longTermCare = calcLongTermCare(taxableSalary, health, rules.longTermCare);
  const employment = calcEmploymentInsurance(taxableSalary, rules.employmentInsurance);

  const lookup = lookupIncomeTax(table, taxableSalary, input.dependents, input.children);
  if (lookup === null) warnings.push("INCOME_TAX_TABLE_MISSING");
  const incomeTax = applyRounding(
    (lookup?.amount ?? 0) * input.withholdingRate,
    rules.incomeTax.taxRounding,
  );
  const localIncomeTax = applyRounding(
    incomeTax * rules.incomeTax.localTaxRate,
    rules.incomeTax.localTaxRounding,
  );

  if (monthlySalary < rules.minimumWage.monthly) warnings.push("BELOW_MINIMUM_WAGE");
  if (!rules.verified || !table.verified) warnings.push("RULES_UNVERIFIED");

  const ltcBasis =
    rules.longTermCare.calcMethod === "ofHealthPremium"
      ? `건강보험료 × ${(rules.longTermCare.rateOfHealthPremium * 100).toFixed(2)}%`
      : `과세 급여 × ${(rules.longTermCare.rateOfIncome * 100).toFixed(4)}%`;

  const deductions: Record<DeductionItem["key"], DeductionItem> = {
    nationalPension: {
      key: "nationalPension",
      amount: pension.amount,
      rate: rules.nationalPension.employeeRate,
      basis: `기준소득월액 ${formatWithCommas(pension.baseIncome)}원 × ${(rules.nationalPension.employeeRate * 100).toFixed(2)}%`,
    },
    healthInsurance: {
      key: "healthInsurance",
      amount: health,
      rate: rules.healthInsurance.employeeRate,
      basis: `과세 급여 × ${(rules.healthInsurance.employeeRate * 100).toFixed(3)}%`,
    },
    longTermCare: {
      key: "longTermCare",
      amount: longTermCare,
      rate:
        rules.longTermCare.calcMethod === "ofHealthPremium"
          ? rules.longTermCare.rateOfHealthPremium
          : rules.longTermCare.rateOfIncome,
      basis: ltcBasis,
    },
    employmentInsurance: {
      key: "employmentInsurance",
      amount: employment,
      rate: rules.employmentInsurance.employeeRate,
      basis: `과세 급여 × ${(rules.employmentInsurance.employeeRate * 100).toFixed(1)}%`,
    },
    incomeTax: {
      key: "incomeTax",
      amount: incomeTax,
      rate: null,
      basis:
        lookup === null
          ? "간이세액표 데이터 준비 중"
          : `간이세액표(부양가족 ${input.dependents}명, 자녀 ${input.children}명) × ${input.withholdingRate * 100}%`,
    },
    localIncomeTax: {
      key: "localIncomeTax",
      amount: localIncomeTax,
      rate: rules.incomeTax.localTaxRate,
      basis: `소득세 × ${rules.incomeTax.localTaxRate * 100}%`,
    },
  };

  const totalDeductions = Object.values(deductions).reduce((sum, d) => sum + d.amount, 0);
  const monthlyNet = monthlySalary - totalDeductions;

  return {
    year: rules.year,
    rulesLabel: rules.label,
    tableTitle: table.title,
    asOf: options.asOf ?? null,
    verified: rules.verified && table.verified,
    input,
    monthlySalary,
    taxableSalary,
    deductions,
    totalDeductions,
    monthlyNet,
    annualNet: monthlyNet * 12,
    annualGross: monthlySalary * 12,
    appliedPensionPeriod: {
      from: period.from,
      to: period.to,
      monthlyIncomeMin: period.monthlyIncomeMin,
      monthlyIncomeMax: period.monthlyIncomeMax,
    },
    warnings,
  };
}
