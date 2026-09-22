import { Box, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType } from "@stackflow/react";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { List, ListItem, ListLinkItem } from "seed-design/ui/list";
import { HeaderContainer, ScreenContainer } from "@/components/common/ScreenContainer";
import licenses from "@/legal/licenses.json";
import { privacyPolicy, type LegalSection } from "@/legal/privacy";
import { termsOfService } from "@/legal/terms";

function LegalDocument({
  title,
  effectiveDate,
  sections,
}: {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
}) {
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
  <LegalDocument {...privacyPolicy} />
);

/** 이용약관 (/terms) */
export const TermsActivity: ActivityComponentType<"TermsActivity"> = () => (
  <LegalDocument {...termsOfService} />
);

/** 오픈소스 라이선스 (/licenses). scripts/generate-licenses.mjs 가 만든 목록 */
export const LicensesActivity: ActivityComponentType<"LicensesActivity"> = () => (
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
