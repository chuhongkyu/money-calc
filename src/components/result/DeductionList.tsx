import { IconChevronRightSmallLine } from "@karrotmarket/react-monochrome-icon";
import { Text } from "@seed-design/react";
import { List, ListButtonItem, ListItem } from "seed-design/ui/list";
import { ListHeader } from "seed-design/ui/list-header";
import { DEDUCTION_ORDER, type DeductionKey, type SalaryResult } from "@/domain/salary";
import { DEDUCTION_LABELS } from "@/domain/salary/labels";
import { formatWon } from "@/lib/money";

export function DeductionList({
  result,
  onSelect,
}: {
  result: SalaryResult;
  onSelect: (key: DeductionKey) => void;
}) {
  return (
    <>
      <ListHeader as="h3">공제 내역</ListHeader>
      <List>
        {DEDUCTION_ORDER.map((key) => {
          const item = result.deductions[key];
          return (
            <ListButtonItem
              key={key}
              title={DEDUCTION_LABELS[key].title}
              detail={item.basis}
              suffix={
                <Text textStyle="t5Medium" className="tabular">
                  −{formatWon(item.amount)}
                  <IconChevronRightSmallLine
                    width={16}
                    height={16}
                    style={{ verticalAlign: "middle", marginLeft: 4 }}
                  />
                </Text>
              }
              onClick={() => onSelect(key)}
            />
          );
        })}
        <ListItem
          title="공제 합계"
          suffix={
            <Text textStyle="t5Bold" className="tabular">
              −{formatWon(result.totalDeductions)}
            </Text>
          }
        />
      </List>
    </>
  );
}
