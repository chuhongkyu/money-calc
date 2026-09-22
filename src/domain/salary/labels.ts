import type { DeductionKey, WarningCode } from "./types";

/** UI 표시용 라벨. 도메인 타입에 붙는 정적 텍스트라 여기 둔다. */
export const DEDUCTION_LABELS: Record<DeductionKey, { title: string; description: string }> = {
  nationalPension: {
    title: "국민연금",
    description:
      "기준소득월액(상·하한 적용)에 근로자 부담 요율을 곱합니다. 상·하한은 매년 7월에 바뀝니다.",
  },
  healthInsurance: {
    title: "건강보험",
    description: "과세 급여에 근로자 부담 요율을 곱합니다.",
  },
  longTermCare: {
    title: "장기요양보험",
    description: "건강보험료에 장기요양보험료율 비율을 곱해 산출합니다.",
  },
  employmentInsurance: {
    title: "고용보험",
    description: "과세 급여에 근로자 부담 요율(실업급여분)을 곱합니다.",
  },
  incomeTax: {
    title: "소득세",
    description:
      "국세청 근로소득 간이세액표에서 월 급여와 공제대상가족 수로 조회한 뒤 원천징수 비율(80/100/120%)을 적용합니다.",
  },
  localIncomeTax: {
    title: "지방소득세",
    description: "소득세의 10%입니다.",
  },
};

export const WARNING_MESSAGES: Record<WarningCode, string> = {
  BELOW_MINIMUM_WAGE: "입력한 월 급여가 해당 연도 최저임금 월 환산액보다 낮아요.",
  INCOME_TAX_TABLE_MISSING: "간이세액표 데이터가 아직 준비되지 않아 소득세를 0원으로 계산했어요.",
  RULES_UNVERIFIED: "적용 요율은 공식 자료와 최종 대조 전이에요. 참고용으로만 사용해 주세요.",
};
