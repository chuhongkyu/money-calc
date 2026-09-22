import { site } from "./site";

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

/**
 * 개인정보처리방침. 서버가 없고 계정도 없으므로 "수집하지 않는다"가 핵심이며,
 * 광고 SDK 가 수집하는 항목만 정확히 밝힌다 (README 9절).
 * TODO(user): 출시 전 법무 검토. 광고 SDK 를 바꾸면 3항을 갱신한다.
 */
export const privacyPolicy: { title: string; effectiveDate: string; sections: LegalSection[] } = {
  title: "개인정보처리방침",
  effectiveDate: site.legalEffectiveDate,
  sections: [
    {
      title: "1. 개요",
      paragraphs: [
        `${site.operator}(이하 "운영자")는 ${site.name}(이하 "서비스")를 제공하면서 이용자의 개인정보를 어떻게 다루는지 이 방침에 따릅니다.`,
        "서비스는 회원가입이나 로그인이 없으며, 운영자가 운영하는 서버로 이용자의 정보를 전송하지 않습니다.",
      ],
    },
    {
      title: "2. 입력값의 저장",
      paragraphs: [
        "연봉, 비과세액, 부양가족 수 등 이용자가 입력한 값은 계산 편의를 위해 이용자의 기기(브라우저 저장소 또는 앱 저장소)에만 저장됩니다.",
        "이 값은 운영자에게 전송되지 않으며, 브라우저 데이터 삭제 또는 앱 삭제로 언제든지 지울 수 있습니다.",
      ],
    },
    {
      title: "3. 광고 서비스와 제3자 수집",
      paragraphs: [
        "서비스는 광고를 표시하기 위해 다음 제3자 광고 서비스를 사용할 수 있으며, 이들 서비스는 자체 정책에 따라 광고 식별자, 기기 정보, 대략적인 위치, 광고 반응 정보를 수집할 수 있습니다.",
        "· Google AdMob (앱): https://policies.google.com/privacy",
        "· 카카오 애드핏 (웹): https://adfit.kakao.com",
        "iOS 에서는 앱 추적 투명성(ATT) 동의를 요청하며, 동의하지 않아도 서비스를 이용할 수 있고 이 경우 개인 맞춤이 아닌 광고가 표시됩니다.",
        "광고 제거 상품을 구매한 이용자에게는 광고와 관련 수집이 이루어지지 않습니다.",
      ],
    },
    {
      title: "4. 결제",
      paragraphs: [
        "광고 제거 인앱결제는 Apple App Store 또는 Google Play 를 통해 처리되며, 운영자는 결제 수단 정보를 수집하지 않습니다.",
        "구매 상태 확인을 위해 RevenueCat 서비스를 사용할 수 있으며, 이때 앱 스토어가 발급한 익명 식별자와 구매 영수증 정보가 처리됩니다.",
      ],
    },
    {
      title: "5. 아동의 개인정보",
      paragraphs: [
        "서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지 않습니다.",
      ],
    },
    {
      title: "6. 이용자의 권리",
      paragraphs: [
        "운영자는 이용자를 식별할 수 있는 정보를 보유하지 않으므로 별도의 열람·정정·삭제 절차가 필요하지 않습니다. 기기에 저장된 입력값은 이용자가 직접 삭제할 수 있습니다.",
        "광고 식별자 재설정과 맞춤 광고 거부는 각 기기의 설정에서 할 수 있습니다.",
      ],
    },
    {
      title: "7. 방침의 변경",
      paragraphs: ["이 방침을 변경하는 경우 서비스 안에서 변경 사항과 시행일을 안내합니다."],
    },
    {
      title: "8. 문의",
      paragraphs: [`개인정보 관련 문의: ${site.contactEmail}`],
    },
  ],
};
