import { IconAndroidshareLine } from "@karrotmarket/react-monochrome-icon";
import { Box, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  AppBar,
  AppBarBackButton,
  AppBarIconButton,
  AppBarLeft,
  AppBarMain,
  AppBarRight,
} from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Callout } from "seed-design/ui/callout";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { AdBannerSlot } from "@/ads/react/AdBannerSlot";
import { useCalculatorStore } from "@/app/store";
import { useDocumentSeo } from "@/app/useDocumentSeo";
import { useSalaryPreview } from "@/app/useSalaryPreview";
import { RuleBadge } from "@/components/common/RuleBadge";
import { HeaderContainer, ScreenContainer } from "@/components/common/ScreenContainer";
import { DeductionList } from "@/components/result/DeductionList";
import { NetSummary } from "@/components/result/NetSummary";
import { WARNING_MESSAGES } from "@/domain/salary/labels";
import { formatAsOfMonth } from "@/rules";
import { formatKoreanMoney, formatSignedWon, formatWon } from "@/lib/money";
import { share } from "@/platform/share";

export const ResultActivity: ActivityComponentType<"ResultActivity"> = () => {
  const { push, pop } = useFlow();
  const store = useCalculatorStore();
  const { ruleSet, result, comparison } = useSalaryPreview();

  // robots.txt 로 크롤링을 막은 화면. 홈 계산기의 한 상태일 뿐이라 canonical 은 "/" 를 가리킨다.
  useDocumentSeo({
    title: "계산 결과 | 연봉 실수령액 계산기",
    description: "월 실수령액과 4대보험·소득세 공제 내역을 항목별로 보여줍니다.",
    path: "/",
    noIndex: true,
  });
  const snackbar = useSnackbarAdapter();

  const handleShare = async () => {
    if (!result || store.amount === null) return;
    const outcome = await share({
      title: "연봉 실수령액 계산기",
      text: `${formatAsOfMonth(ruleSet.asOf)} 기준 ${store.amountType === "annual" ? "연봉" : "월급"} ${formatKoreanMoney(store.amount)} → 월 실수령액 ${formatWon(result.monthlyNet)}`,
      url: typeof window === "undefined" ? undefined : window.location.origin,
    });
    if (outcome === "copied")
      snackbar.create({ render: () => <Snackbar message="결과를 복사했어요." />, timeout: 2000 });
  };

  return (
    <AppScreen>
      <AppBar>
        <HeaderContainer>
          <AppBarLeft>
            <AppBarBackButton />
          </AppBarLeft>
          <AppBarMain title="계산 결과" />
          <AppBarRight>
            <AppBarIconButton aria-label="공유" onClick={handleShare}>
              <IconAndroidshareLine />
            </AppBarIconButton>
          </AppBarRight>
        </HeaderContainer>
      </AppBar>
      <AppScreenContent>
        <ScreenContainer>
          {!result ? (
            <VStack gap="x4" px="spacingX.globalGutter" py="x6">
              <Callout
                tone="warning"
                description="입력값이 없거나 올바르지 않아요. 다시 입력해 주세요."
              />
              <ActionButton variant="neutralWeak" onClick={() => pop()}>
                입력으로 돌아가기
              </ActionButton>
            </VStack>
          ) : (
            <VStack gap="x6" pb="x10">
              <VStack gap="x3" px="spacingX.globalGutter" pt="x4" align="center">
                <RuleBadge
                  ruleSet={ruleSet}
                  onClick={() => push("RulesInfoActivity", { year: String(ruleSet.rules.year) })}
                />
                <NetSummary result={result} />
                {comparison && (
                  <Text textStyle="t4Regular" color="fg.neutralMuted" className="tabular">
                    {comparison.otherLabel} 같은 시점 대비 월{" "}
                    {formatSignedWon(comparison.monthlyNetDiff)}
                  </Text>
                )}
              </VStack>

              <DeductionList
                result={result}
                onSelect={(key) => push("DeductionInfoActivity", { key })}
              />

              <VStack gap="x3" px="spacingX.globalGutter">
                {result.warnings.map((w) => (
                  <Callout
                    key={w}
                    tone={w === "RULES_UNVERIFIED" ? "neutral" : "warning"}
                    description={WARNING_MESSAGES[w]}
                  />
                ))}
                <Text textStyle="t3Regular" color="fg.neutralSubtle">
                  본 계산은 {result.tableTitle} 기준 추정치이며 실제 급여와 다를 수 있습니다.
                </Text>
              </VStack>

              <VStack px="spacingX.globalGutter" gap="x2">
                <ActionButton
                  variant="neutralWeak"
                  size="large"
                  onClick={() => push("DetailActivity", {})}
                >
                  실수령액이 다른가요? 더 정확하게 알아보기
                </ActionButton>
                <ActionButton variant="brandSolid" size="large" onClick={handleShare}>
                  공유
                </ActionButton>
              </VStack>

              <Box px="spacingX.globalGutter">
                <AdBannerSlot slot="result_bottom" />
              </Box>
            </VStack>
          )}
        </ScreenContainer>
      </AppScreenContent>
    </AppScreen>
  );
};
