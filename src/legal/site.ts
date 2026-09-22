/**
 * 서비스·운영자 정보. 법적 페이지와 SEO 메타에서 함께 쓴다.
 * TODO(user): 운영자명·연락처·도메인을 실제 값으로 바꾼다.
 */
export const site = {
  name: "연봉 실수령액 계산기",
  shortName: "실수령액 계산기",
  description:
    "연봉을 입력하면 지금 시점 기준 월 실수령액과 4대보험·소득세 공제 내역을 바로 계산합니다. 로그인 없음, 입력값은 기기에만 저장.",
  /** 배포 도메인. sitemap·canonical·OG url 에 쓴다 */
  url: "https://salary-calc.example.com", // TODO(user)
  operator: "운영자명", // TODO(user)
  contactEmail: "contact@example.com", // TODO(user)
  /** 개인정보처리방침·이용약관 시행일 */
  legalEffectiveDate: "2026-09-22",
  version: "0.1.0",
} as const;
