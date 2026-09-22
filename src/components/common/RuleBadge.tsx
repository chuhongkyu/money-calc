import { IconChevronRightSmallLine } from "@karrotmarket/react-monochrome-icon";
import { HStack, Text } from "@seed-design/react";
import { ButtonChip, ChipLabel } from "seed-design/ui/chip";
import { formatRate } from "@/lib/money";
import { formatAsOfMonth, type ResolvedRuleSet } from "@/rules";

/** "2026년 9월 기준 · 국민연금 4.75%" 뱃지. 누르면 계산 기준 안내로 이동. */
export function RuleBadge({ ruleSet, onClick }: { ruleSet: ResolvedRuleSet; onClick: () => void }) {
  const { rules, table, asOf } = ruleSet;
  const verified = rules.verified && table.verified;
  return (
    <ButtonChip
      size="small"
      variant="outlineWeak"
      onClick={onClick}
      aria-label="계산 기준 안내 열기"
    >
      <ChipLabel>
        <HStack gap="x1" align="center">
          <Text textStyle="t3Medium">
            {formatAsOfMonth(asOf)} 기준 · 국민연금 {formatRate(rules.nationalPension.employeeRate)}
            {verified ? "" : " · 검증 전"}
          </Text>
          <IconChevronRightSmallLine width={14} height={14} />
        </HStack>
      </ChipLabel>
    </ButtonChip>
  );
}
