import { IconGearLine } from "@karrotmarket/react-monochrome-icon";
import { Box, HStack, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, AppBarIconButton, AppBarMain, AppBarRight } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Callout } from "seed-design/ui/callout";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { useInterstitialBeforeResult } from "@/ads/react/useAds";
import { useCalculatorStore } from "@/app/store";
import { useSalaryPreview } from "@/app/useSalaryPreview";
import { LegalFooter } from "@/components/common/LegalFooter";
import { RuleBadge } from "@/components/common/RuleBadge";
import { HeroBanner } from "@/components/common/HeroBanner";
import { HeaderContainer, ScreenContainer } from "@/components/common/ScreenContainer";
import { DEFAULT_QUICK_AMOUNTS, MoneyInput } from "@/components/inputs/MoneyInput";
import { SALARY_LIMITS } from "@/domain/salary";
import { WARNING_MESSAGES } from "@/domain/salary/labels";
import { formatKoreanMoney, formatWon } from "@/lib/money";

/**
 * 메인: 연봉만 넣으면 바로 월 실수령액이 보인다.
 * 나머지 조건(비과세, 부양가족, 자녀, 퇴직금, 기준 시점)은 기본값으로 계산하고,
 * "더 정확하게 알아보기" 에서 바꾼다.
 */
export const HomeActivity: ActivityComponentType<"HomeActivity"> = () => {
  const { push } = useFlow();
  const store = useCalculatorStore();
  const { ruleSet, result } = useSalaryPreview();
  const showInterstitial = useInterstitialBeforeResult();

  const amountMax =
    store.amountType === "annual" ? SALARY_LIMITS.maxAnnual : SALARY_LIMITS.maxMonthly;
  const amountLabel = store.amountType === "annual" ? "연봉" : "월급";

  const goResult = async () => {
    if (!result) return;
    await showInterstitial();
    push("ResultActivity", {});
  };

  return (
    <AppScreen>
      <AppBar>
        <HeaderContainer>
          <AppBarMain title="연봉 실수령액 계산기" />
          <AppBarRight>
            <AppBarIconButton aria-label="설정" onClick={() => push("SettingsActivity", {})}>
              <IconGearLine />
            </AppBarIconButton>
          </AppBarRight>
        </HeaderContainer>
      </AppBar>
      <AppScreenContent>
        <ScreenContainer>
          <VStack gap="x6" px="spacingX.globalGutter" pt="0" pb="x10">
            <HeroBanner />

            <VStack gap="x4">
              <SegmentedControl
                aria-label="입력 단위"
                value={store.amountType}
                onValueChange={(v) => store.setAmountType(v === "monthly" ? "monthly" : "annual")}
              >
                <SegmentedControlItem value="annual">연봉</SegmentedControlItem>
                <SegmentedControlItem value="monthly">월급</SegmentedControlItem>
              </SegmentedControl>

              <MoneyInput
                label={amountLabel}
                name="amount"
                value={store.amount}
                onChange={store.setAmount}
                max={amountMax}
                placeholder={store.amountType === "annual" ? "45,000,000" : "3,750,000"}
                quickAmounts={DEFAULT_QUICK_AMOUNTS}
                autoFocus
              />
            </VStack>

            {result ? (
              <VStack gap="x4">
                <Box bg="bg.layerFloating" borderRadius="r4" px="x5" py="x5">
                  <VStack gap="x1" align="center">
                    <Text textStyle="t4Regular" color="fg.neutralMuted">
                      한 달에 실제로 받는 돈
                    </Text>
                    <Text as="h2" textStyle="t12Bold" className="tabular" aria-live="polite">
                      {formatWon(result.monthlyNet)}
                    </Text>
                    <Text textStyle="t4Regular" color="fg.neutralMuted" className="tabular">
                      세전 월급 {formatWon(result.monthlySalary)} · 공제{" "}
                      {formatWon(result.totalDeductions)}
                    </Text>
                    <Text textStyle="t3Regular" color="fg.neutralSubtle" align="center">
                      부양가족 {store.dependents}명 · 비과세{" "}
                      {formatKoreanMoney(store.nonTaxableMonthly)} ·{" "}
                      {store.severanceIncluded ? "퇴직금 포함" : "퇴직금 별도"} 기준
                    </Text>
                    <Box pt="x2">
                      <RuleBadge
                        ruleSet={ruleSet}
                        onClick={() =>
                          push("RulesInfoActivity", { year: String(ruleSet.rules.year) })
                        }
                      />
                    </Box>
                  </VStack>
                </Box>

                <VStack gap="x2">
                  <ActionButton variant="brandSolid" size="large" onClick={goResult}>
                    공제 내역 보기
                  </ActionButton>
                  <ActionButton
                    variant="neutralWeak"
                    size="large"
                    onClick={() => push("DetailActivity", {})}
                  >
                    실수령액이 다른가요? 더 정확하게 알아보기
                  </ActionButton>
                </VStack>

                {result.warnings
                  .filter((w) => w !== "RULES_UNVERIFIED")
                  .map((w) => (
                    <Callout key={w} tone="warning" description={WARNING_MESSAGES[w]} />
                  ))}
              </VStack>
            ) : (
              <HStack justify="center" py="x6">
                <Text textStyle="t4Regular" color="fg.neutralSubtle" align="center">
                  {amountLabel}을 입력하면 월 실수령액이 바로 나와요.
                </Text>
              </HStack>
            )}

            <LegalFooter />
          </VStack>
        </ScreenContainer>
      </AppScreenContent>
    </AppScreen>
  );
};
