import { HStack, Text, VStack } from "@seed-design/react";
import { QuantityPicker } from "seed-design/ui/quantity-picker";
import type { ReactNode } from "react";

export interface StepperInputProps {
  label: string;
  description?: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

/** 부양가족 수·자녀 수 입력. SEED QuantityPicker 를 라벨과 함께 감싼다. */
export function StepperInput({
  label,
  description,
  value,
  min,
  max,
  onChange,
  unit = "명",
}: StepperInputProps) {
  return (
    <HStack justify="space-between" align="center" gap="x4">
      <VStack gap="x1">
        <Text textStyle="t5Medium">{label}</Text>
        {description && (
          <Text textStyle="t3Regular" color="fg.neutralMuted">
            {description}
          </Text>
        )}
      </VStack>
      <QuantityPicker
        size="small"
        min={min}
        max={max}
        value={value}
        onValueChange={onChange}
        aria-label={`${label} (${unit})`}
        decrementAriaLabel={`${label} 줄이기`}
        incrementAriaLabel={`${label} 늘리기`}
      />
    </HStack>
  );
}
