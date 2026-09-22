import { HStack, Text, VStack } from "@seed-design/react";
import { useFlow } from "@stackflow/react";
import { site } from "@/legal/site";

const linkStyle = {
  background: "none",
  border: 0,
  padding: 0,
  font: "inherit",
  color: "inherit",
  textDecoration: "underline",
  cursor: "pointer",
} as const;

/** 메인 하단 푸터. 필수 페이지 링크와 추정치 고지 (README 9절) */
export function LegalFooter() {
  const { push } = useFlow();
  return (
    <VStack as="footer" gap="x2" pt="x8" align="center">
      <HStack gap="x4" wrap="wrap" justify="center">
        <Text textStyle="t3Regular" color="fg.neutralMuted">
          <button type="button" style={linkStyle} onClick={() => push("PrivacyActivity", {})}>
            개인정보처리방침
          </button>
        </Text>
        <Text textStyle="t3Regular" color="fg.neutralMuted">
          <button type="button" style={linkStyle} onClick={() => push("TermsActivity", {})}>
            이용약관
          </button>
        </Text>
        <Text textStyle="t3Regular" color="fg.neutralMuted">
          <button type="button" style={linkStyle} onClick={() => push("LicensesActivity", {})}>
            오픈소스 라이선스
          </button>
        </Text>
      </HStack>
      <Text textStyle="t2Regular" color="fg.neutralSubtle" align="center">
        계산 결과는 참고용 추정치이며 법적 효력이 없습니다. 입력값은 이 기기에만 저장됩니다.
      </Text>
      <Text textStyle="t2Regular" color="fg.neutralSubtle">
        © {site.legalEffectiveDate.slice(0, 4)} {site.operator} · v{site.version}
      </Text>
    </VStack>
  );
}
