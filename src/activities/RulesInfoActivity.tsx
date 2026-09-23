import { Text, VStack } from "@seed-design/react";
import { type ActivityComponentType } from "@stackflow/react";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Callout } from "seed-design/ui/callout";
import { List, ListItem, ListLinkItem } from "seed-design/ui/list";
import { ListHeader } from "seed-design/ui/list-header";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { useState } from "react";
import { useCalculatorStore } from "@/app/store";
import { useDocumentSeo } from "@/app/useDocumentSeo";
import { HeaderContainer, ScreenContainer } from "@/components/common/ScreenContainer";
import { formatRate, formatWon } from "@/lib/money";
import { availableTables, availableYears, getRuleSet, getRules, hasRules } from "@/rules";

/** "계산 기준 안내": 적용 요율과 기간별 값을 보여준다. 광고 없음 (README 4.6). */
export const RulesInfoActivity: ActivityComponentType<"RulesInfoActivity"> = ({ params }) => {
  const storeYear = Number(useCalculatorStore((s) => s.asOf).slice(0, 4));
  const paramYear = Number(params.year);
  const [year, setYear] = useState(hasRules(paramYear) ? paramYear : storeYear);
  const { rules, table } = getRuleSet(year);

  useDocumentSeo({
    title: `${year}년 4대보험 요율·근로소득 간이세액표 | 연봉 실수령액 계산기`,
    description:
      `${year}년 국민연금 ${formatRate(rules.nationalPension.employeeRate)}, ` +
      `건강보험 ${formatRate(rules.healthInsurance.employeeRate, 3)}, ` +
      `고용보험 ${formatRate(rules.employmentInsurance.employeeRate)} 등 ` +
      `근로자 부담 요율과 ${table.title} 적용 기준을 정리했습니다.`,
    path: `/rules/${year}`,
  });

  return (
    <AppScreen>
      <AppBar>
        <HeaderContainer>
          <AppBarLeft>
            <AppBarBackButton />
          </AppBarLeft>
          <AppBarMain title="계산 기준 안내" />
        </HeaderContainer>
      </AppBar>
      <AppScreenContent>
        <ScreenContainer>
          <VStack gap="x4" py="x4" pb="x10">
            <VStack px="spacingX.globalGutter" gap="x3">
              <SegmentedControl
                aria-label="기준 연도"
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                {availableYears.map((y) => (
                  <SegmentedControlItem key={y} value={String(y)}>
                    {getRules(y).label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
              <Text textStyle="t4Regular" color="fg.neutralMuted">
                {rules.description}. 소득세는 급여를 받는 시점에 적용되는 간이세액표로 계산해요.
              </Text>
              {!(rules.verified && table.verified) && (
                <Callout
                  tone="neutral"
                  title="검증 전 데이터"
                  description="아래 값은 공식 자료와 최종 대조 전이에요. 참고용으로만 사용해 주세요."
                />
              )}
            </VStack>

            <ListHeader as="h3">4대보험 (근로자 부담)</ListHeader>
            <List>
              <ListItem
                title="국민연금"
                detail={`전체 ${formatRate(rules.nationalPension.totalRate)}`}
                suffix={
                  <Text textStyle="t5Medium">{formatRate(rules.nationalPension.employeeRate)}</Text>
                }
              />
              {rules.nationalPension.periods.map((p) => (
                <ListItem
                  key={p.from}
                  title={`기준소득월액 (${p.from.slice(5, 7)}월 ~ ${p.to.slice(5, 7)}월)`}
                  detail={`하한 ${formatWon(p.monthlyIncomeMin)} · 상한 ${formatWon(p.monthlyIncomeMax)}`}
                />
              ))}
              <ListItem
                title="건강보험"
                detail={`전체 ${formatRate(rules.healthInsurance.totalRate)}`}
                suffix={
                  <Text textStyle="t5Medium">
                    {formatRate(rules.healthInsurance.employeeRate, 3)}
                  </Text>
                }
              />
              <ListItem
                title="장기요양보험"
                detail={
                  rules.longTermCare.calcMethod === "ofHealthPremium"
                    ? `건강보험료의 ${formatRate(rules.longTermCare.rateOfHealthPremium)}`
                    : `소득의 ${formatRate(rules.longTermCare.rateOfIncome, 4)}`
                }
                suffix={
                  <Text textStyle="t5Medium">{formatRate(rules.longTermCare.rateOfIncome, 4)}</Text>
                }
              />
              <ListItem
                title="고용보험"
                suffix={
                  <Text textStyle="t5Medium">
                    {formatRate(rules.employmentInsurance.employeeRate)}
                  </Text>
                }
              />
            </List>

            <ListHeader as="h3">세금</ListHeader>
            <List>
              {availableTables.map((t) => (
                <ListItem
                  key={t.tableId}
                  title={`소득세 · ${t.title}`}
                  detail={`적용 ${t.effectiveFrom} ~ ${t.effectiveTo ?? "현재"} · 자녀 차감 1명 ${formatWon(t.childAdjustment.one)}, 2명 ${formatWon(t.childAdjustment.two)}`}
                />
              ))}
              <ListItem
                title="지방소득세"
                detail="소득세의 10%"
                suffix={
                  <Text textStyle="t5Medium">{formatRate(rules.incomeTax.localTaxRate)}</Text>
                }
              />
              <ListItem
                title="비과세 기본값 (식대)"
                suffix={
                  <Text textStyle="t5Medium">
                    {formatWon(rules.defaults.nonTaxableMealMonthly)}
                  </Text>
                }
              />
              <ListItem
                title="최저임금"
                detail={`시급 ${formatWon(rules.minimumWage.hourly)}`}
                suffix={<Text textStyle="t5Medium">월 {formatWon(rules.minimumWage.monthly)}</Text>}
              />
            </List>

            <ListHeader as="h3">출처</ListHeader>
            <List>
              {rules.sources.map((url) => (
                <ListLinkItem
                  key={url}
                  title={url.replace(/^https?:\/\//, "")}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                />
              ))}
            </List>

            {import.meta.env.DEV && rules.notes.length > 0 && (
              <VStack px="spacingX.globalGutter" gap="x2">
                <Text textStyle="t4Bold">확인 필요 (개발 모드에서만 표시)</Text>
                {rules.notes.map((n) => (
                  <Text key={n} textStyle="t3Regular" color="fg.neutralMuted">
                    · {n}
                  </Text>
                ))}
              </VStack>
            )}
          </VStack>
        </ScreenContainer>
      </AppScreenContent>
    </AppScreen>
  );
};
