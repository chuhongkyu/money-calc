import { Text, VStack } from "@seed-design/react";
import { formatWon } from "@/lib/money";
import type { SalaryResult } from "@/domain/salary";

export function NetSummary({ result }: { result: SalaryResult }) {
  return (
    <VStack gap="x1" align="center" py="x6">
      <Text textStyle="t4Regular" color="fg.neutralMuted">
        월 실수령액
      </Text>
      <Text as="h2" textStyle="t12Bold" className="tabular">
        {formatWon(result.monthlyNet)}
      </Text>
      <Text textStyle="t4Regular" color="fg.neutralMuted" className="tabular">
        연 {formatWon(result.annualNet)} · 세전 월 {formatWon(result.monthlySalary)}
      </Text>
    </VStack>
  );
}
