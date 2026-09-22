import { Text, VStack } from "@seed-design/react";
import { useActivityZIndexBase } from "@seed-design/stackflow";
import { type ActivityComponentType, useActivity, useFlow } from "@stackflow/react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import { useSalaryPreview } from "@/app/useSalaryPreview";
import { DEDUCTION_LABELS } from "@/domain/salary/labels";
import { formatRate, formatWon } from "@/lib/money";

/** 공제 항목 설명 BottomSheet (Stackflow activity) */
export const DeductionInfoActivity: ActivityComponentType<"DeductionInfoActivity"> = ({
  params,
}) => {
  const { pop } = useFlow();
  const { isActive } = useActivity();
  const layerIndex = useActivityZIndexBase();
  const { result } = useSalaryPreview();
  const label = DEDUCTION_LABELS[params.key];
  const item = result?.deductions[params.key] ?? null;

  return (
    <BottomSheetRoot open={isActive} onOpenChange={(open) => !open && pop()}>
      <BottomSheetContent title={label.title} layerIndex={layerIndex}>
        <BottomSheetBody>
          <VStack gap="x3">
            {item && (
              <VStack gap="x1">
                <Text textStyle="t9Bold" className="tabular">
                  {formatWon(item.amount)}
                </Text>
                <Text textStyle="t4Regular" color="fg.neutralMuted">
                  {item.basis}
                  {item.rate !== null ? ` (요율 ${formatRate(item.rate, 4)})` : ""}
                </Text>
              </VStack>
            )}
            <Text textStyle="t5Regular">{label.description}</Text>
          </VStack>
        </BottomSheetBody>
        <BottomSheetFooter>
          <ActionButton variant="neutralWeak" onClick={() => pop()}>
            닫기
          </ActionButton>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
};
