import { Box, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType } from "@stackflow/react";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { List, ListItem, ListLinkItem } from "seed-design/ui/list";
import { useDocumentSeo } from "@/app/useDocumentSeo";
import { HeaderContainer, ScreenContainer } from "@/components/common/ScreenContainer";
import licenses from "@/legal/licenses.json";
import { privacyPolicy, type LegalSection } from "@/legal/privacy";
import { termsOfService } from "@/legal/terms";

function LegalDocument({
  title,
  effectiveDate,
  sections,
  path,
  description,
}: {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
  path: string;
  description: string;
}) {
  useDocumentSeo({ title: `${title} | 연봉 실수령액 계산기`, description, path });

  return (
    <AppScreen>
      <AppBar>
        <HeaderContainer>
          <AppBarLeft>
            <AppBarBackButton />
          </AppBarLeft>
          <AppBarMain title={title} />
        </HeaderContainer>
      </AppBar>
      <AppScreenContent>
        <ScreenContainer>
          <VStack gap="x6" px="spacingX.globalGutter" py="x4" pb="x10">
            <Text textStyle="t3Regular" color="fg.neutralMuted">
              시행일 {effectiveDate}
            </Text>
            {sections.map((s) => (
              <VStack key={s.title} gap="x2">
                <Text as="h2" textStyle="t6Bold">
                  {s.title}
                </Text>
                {s.paragraphs.map((p) => (
                  <Text key={p} as="p" textStyle="t5Regular" whiteSpace="pre-line">
                    {p}
                  </Text>
                ))}
              </VStack>
            ))}
          </VStack>
        </ScreenContainer>
      </AppScreenContent>
    </AppScreen>
  );
}

/** 개인정보처리방침 (/privacy). 광고 없음 (ads/config adFreePaths) */
export const PrivacyActivity: ActivityComponentType<"PrivacyActivity"> = () => (
  <LegalDocument
    {...privacyPolicy}
    path="/privacy"
    description="연봉 실수령액 계산기의 개인정보처리방침입니다. 로그인이 없고 입력한 연봉은 서버로 전송하지 않으며 내 기기에만 저장됩니다."
  />
);

/** 이용약관 (/terms) */
export const TermsActivity: ActivityComponentType<"TermsActivity"> = () => (
  <LegalDocument
    {...termsOfService}
    path="/terms"
    description="연봉 실수령액 계산기의 이용약관입니다. 계산 결과는 참고용 추정치이며 법적 효력이 없습니다."
  />
);

/** 오픈소스 라이선스 (/licenses). scripts/generate-licenses.mjs 가 만든 목록 */
export const LicensesActivity: ActivityComponentType<"LicensesActivity"> = () => {
  useDocumentSeo({
    title: `오픈소스 라이선스 | ${"연봉 실수령액 계산기"}`,
    description: "연봉 실수령액 계산기가 사용하는 오픈소스 소프트웨어와 각 라이선스 목록입니다.",
    path: "/licenses",
  });

  return (
    <AppScreen>
      <AppBar>
        <HeaderContainer>
          <AppBarLeft>
            <AppBarBackButton />
          </AppBarLeft>
          <AppBarMain title="오픈소스 라이선스" />
        </HeaderContainer>
      </AppBar>
      <AppScreenContent>
        <ScreenContainer>
          <VStack gap="x4" py="x4" pb="x10">
            <Box px="spacingX.globalGutter">
              <Text textStyle="t4Regular" color="fg.neutralMuted">
                이 서비스는 아래 오픈소스 소프트웨어를 사용합니다. 각 소프트웨어는 표시된 라이선스를
                따릅니다. ({licenses.count}개, {licenses.generatedAt} 기준)
              </Text>
            </Box>
            <List>
              {licenses.packages.map((p) =>
                p.repository ? (
                  <ListLinkItem
                    key={p.name}
                    title={p.name}
                    detail={`${p.version} · ${p.license}`}
                    href={p.repository}
                    target="_blank"
                    rel="noreferrer"
                  />
                ) : (
                  <ListItem key={p.name} title={p.name} detail={`${p.version} · ${p.license}`} />
                ),
              )}
            </List>
          </VStack>
        </ScreenContainer>
      </AppScreenContent>
    </AppScreen>
  );
};
