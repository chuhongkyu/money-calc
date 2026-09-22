import { Box, HStack, Text, VStack } from "@seed-design/react";
import { type ActivityComponentType, useFlow } from "@stackflow/react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Callout } from "seed-design/ui/callout";
import { ChipLabel, RadioChipItem, RadioChipRoot } from "seed-design/ui/chip";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { Switch } from "seed-design/ui/switch";
import { useInterstitialBeforeResult } from "@/ads/react/useAds";
import { useCalculatorStore } from "@/app/store";
import { useSalaryPreview } from "@/app/useSalaryPreview";
import { MoneyInput } from "@/components/inputs/MoneyInput";
import { StepperInput } from "@/components/inputs/StepperInput";
import { SALARY_LIMITS, type WithholdingRate } from "@/domain/salary";
import { WARNING_MESSAGES } from "@/domain/salary/labels";
import { formatWon } from "@/lib/money";
import { useKeyboardInset } from "@/platform/useKeyboardInset";
import { WITHHOLDING_OPTIONS } from "@/rules";

/** "더 정확하게 알아보기": 기본값으로 가정했던 조건을 직접 입력한다. */
export const DetailActivity: ActivityComponentType<"DetailActivity"> = () => {
  const { push } = useFlow();
  const store = useCalculatorStore();
  const { issues, result } = useSalaryPreview();
  const keyboardInset = useKeyboardInset();
  const showInterstitial = useInterstitialBeforeResult();

  const amountMax =
    store.amountType === "annual" ? SALARY_LIMITS.maxAnnual : SALARY_LIMITS.maxMonthly;
  const amountLabel = store.amountType === "annual" ? "연봉" : "월급";
  const taxableIssue = issues.find((i) => i.code === "TAXABLE_NOT_POSITIVE");

  const goResult = async () => {
    if (!result) return;
    await showInterstitial();
    push("ResultActivity", {});
  };

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
        <AppBarMain title="더 정확하게 알아보기" />
      </AppBar>
      <AppScreenContent>
        <VStack gap="x6" px="spacingX.globalGutter" py="x4" style={{ paddingBottom: 140 }}>
          <Callout
            tone="informative"
            description="회사 급여명세서와 같은 조건을 넣을수록 실수령액이 정확해져요. 입력값은 이 기기에만 저장돼요."
          />

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
              size="medium"
            />
          </VStack>

          {store.amountType === "annual" && (
            <Switch
              label="퇴직금 포함 (연봉 ÷ 13)"
              checked={store.severanceIncluded}
              onCheckedChange={store.setSeveranceIncluded}
            />
          )}

          <MoneyInput
            label="비과세액 (월)"
            name="nonTaxable"
            size="medium"
            value={store.nonTaxableMonthly}
            onChange={store.setNonTaxableMonthly}
            max={SALARY_LIMITS.maxMonthly}
            description="식대 등 비과세 항목. 식대 비과세 한도 200,000원"
            errorMessage={taxableIssue?.message}
            showKorean={false}
          />

          <VStack gap="x4">
            <StepperInput
              label="부양가족 수"
              description="본인 포함"
              value={store.dependents}
              min={SALARY_LIMITS.minDependents}
              max={SALARY_LIMITS.maxDependents}
              onChange={store.setDependents}
            />
            <StepperInput
              label="8세~20세 자녀 수"
              value={store.children}
              min={0}
              max={Math.max(0, store.dependents - 1)}
              onChange={store.setChildren}
            />
          </VStack>

          <VStack gap="x2">
            <Text textStyle="t5Medium">원천징수 비율</Text>
            <Text textStyle="t3Regular" color="fg.neutralMuted">
              회사에 신고한 비율. 모르면 100%
            </Text>
            <RadioChipRoot
              aria-label="원천징수 비율"
              value={String(store.withholdingRate)}
              onValueChange={(v) => store.setWithholdingRate(Number(v) as WithholdingRate)}
            >
              <HStack gap="x2">
                {WITHHOLDING_OPTIONS.map((r) => (
                  <RadioChipItem key={r} value={String(r)} size="small">
                    <ChipLabel>{r * 100}%</ChipLabel>
                  </RadioChipItem>
                ))}
              </HStack>
            </RadioChipRoot>
          </VStack>

          {result?.warnings
            .filter((w) => w !== "RULES_UNVERIFIED")
            .map((w) => (
              <Callout key={w} tone="warning" description={WARNING_MESSAGES[w]} />
            ))}

          <Box
            position="fixed"
            left={0}
            right={0}
            px="spacingX.globalGutter"
            py="x3"
            bg="layerDefault"
            style={{
              bottom: keyboardInset,
              paddingBottom: `calc(var(--seed-dimension-x3) + env(safe-area-inset-bottom))`,
              boxShadow: "0 -1px 0 var(--seed-color-stroke-neutral-muted)",
            }}
          >
            <HStack justify="space-between" align="center" gap="x4">
              <VStack gap="x0">
                <Text textStyle="t3Regular" color="fg.neutralMuted">
                  월 실수령액
                </Text>
                <Text textStyle="t7Bold" className="tabular" aria-live="polite">
                  {result ? formatWon(result.monthlyNet) : "—"}
                </Text>
              </VStack>
              <ActionButton variant="brandSolid" size="large" disabled={!result} onClick={goResult}>
                결과 보기
              </ActionButton>
            </HStack>
          </Box>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
};
