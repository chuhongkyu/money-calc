import { Box, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { List, ListButtonItem, ListItem } from "seed-design/ui/list";
import { ListHeader } from "seed-design/ui/list-header";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { useEntitlementStore } from "@/app/entitlementStore";
import { useCalculatorStore } from "@/app/store";
import { useDocumentSeo } from "@/app/useDocumentSeo";
import { HeaderContainer, ScreenContainer } from "@/components/common/ScreenContainer";
import { site } from "@/legal/site";

export const SettingsActivity: ActivityComponentType<"SettingsActivity"> = () => {
  const { push } = useFlow();
  const year = useCalculatorStore((s) => s.asOf.slice(0, 4));
  const noAds = useEntitlementStore((s) => s.noAds);
  const snackbar = useSnackbarAdapter();

  useDocumentSeo({
    title: "설정 | 연봉 실수령액 계산기",
    description: "광고 제거와 계산 기준 안내, 법적 고지를 확인합니다.",
    path: "/settings",
    noIndex: true,
  });

  // TODO(native): RevenueCat 구매/복원 연결. 지금은 안내만.
  const notReady = () =>
    snackbar.create({
      render: () => <Snackbar message="앱 출시 버전에서 제공될 예정이에요." />,
      timeout: 2000,
    });

  return (
    <AppScreen>
      <AppBar>
        <HeaderContainer>
          <AppBarLeft>
            <AppBarBackButton />
          </AppBarLeft>
          <AppBarMain title="설정" />
        </HeaderContainer>
      </AppBar>
      <AppScreenContent>
        <ScreenContainer>
          <VStack gap="x4" py="x4">
            <ListHeader as="h3">광고</ListHeader>
            <List>
              {/* TODO(native): RevenueCat 붙이기 전까지 비활성. disabled 만 떼면 다시 동작한다. */}
              <ListButtonItem
                title={noAds ? "광고 제거됨" : "광고 제거"}
                detail={noAds ? "구매해 주셔서 감사해요" : "앱 출시 버전에서 제공될 예정이에요"}
                onClick={notReady}
                disabled
              />
              <ListButtonItem title="구매 복원" onClick={notReady} disabled />
            </List>

            <ListHeader as="h3">정보</ListHeader>
            <List>
              <ListButtonItem
                title="계산 기준 안내"
                onClick={() => push("RulesInfoActivity", { year })}
              />
              <ListButtonItem
                title="개인정보처리방침"
                onClick={() => push("PrivacyActivity", {})}
              />
              <ListButtonItem title="이용약관" onClick={() => push("TermsActivity", {})} />
              <ListButtonItem
                title="오픈소스 라이선스"
                onClick={() => push("LicensesActivity", {})}
              />
              <ListItem
                title="버전"
                suffix={
                  <Text textStyle="t5Regular" color="fg.neutralMuted">
                    {site.version}
                  </Text>
                }
              />
            </List>

            <Box px="spacingX.globalGutter">
              <Text textStyle="t3Regular" color="fg.neutralSubtle">
                입력값은 이 기기에만 저장되며 서버로 전송하지 않습니다.
              </Text>
            </Box>
          </VStack>
        </ScreenContainer>
      </AppScreenContent>
    </AppScreen>
  );
};
