import { Box, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { List, ListButtonItem, ListItem } from "seed-design/ui/list";
import { ListHeader } from "seed-design/ui/list-header";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { useEntitlementStore } from "@/app/entitlementStore";
import { useCalculatorStore } from "@/app/store";
import { site } from "@/legal/site";

export const SettingsActivity: ActivityComponentType<"SettingsActivity"> = () => {
  const { push } = useFlow();
  const year = useCalculatorStore((s) => s.asOf.slice(0, 4));
  const noAds = useEntitlementStore((s) => s.noAds);
  const snackbar = useSnackbarAdapter();

  // TODO(native): RevenueCat 구매/복원 연결. 지금은 안내만.
  const notReady = () =>
    snackbar.create({
      render: () => <Snackbar message="앱 출시 버전에서 제공될 예정이에요." />,
      timeout: 2000,
    });

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
        <AppBarMain title="설정" />
      </AppBar>
      <AppScreenContent>
        <VStack gap="x4" py="x4">
          <ListHeader as="h3">광고</ListHeader>
          <List>
            <ListButtonItem
              title={noAds ? "광고 제거됨" : "광고 제거"}
              detail={noAds ? "구매해 주셔서 감사해요" : "₩TODO · 1회 결제"}
              onClick={notReady}
            />
            <ListButtonItem title="구매 복원" onClick={notReady} />
          </List>

          <ListHeader as="h3">정보</ListHeader>
          <List>
            <ListButtonItem
              title="계산 기준 안내"
              onClick={() => push("RulesInfoActivity", { year })}
            />
            <ListButtonItem title="개인정보처리방침" onClick={() => push("PrivacyActivity", {})} />
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
      </AppScreenContent>
    </AppScreen>
  );
};
