import { IconXmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { HStack, Text, VStack } from "@seed-design/react";
import { ButtonChip, ChipLabel } from "seed-design/ui/chip";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  formatKoreanMoney,
  formatWithCommas,
  onlyDigits,
  parseMoneyText,
  stripLeadingZeros,
} from "@/lib/money";

export interface QuickAmount {
  label: string;
  /** 양수면 더하기, null 이면 초기화 */
  delta: number | null;
}

export const DEFAULT_QUICK_AMOUNTS: readonly QuickAmount[] = [
  { label: "+100만", delta: 1_000_000 },
  { label: "+500만", delta: 5_000_000 },
  { label: "+1,000만", delta: 10_000_000 },
  { label: "초기화", delta: null },
];

export interface MoneyInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** 이 값을 넘는 입력은 막고 helper text 로 안내 */
  max: number;
  placeholder?: string;
  description?: ReactNode;
  /** 외부 검증 오류 */
  errorMessage?: ReactNode;
  quickAmounts?: readonly QuickAmount[];
  /** 입력 아래 한글 금액 표시 (기본 true) */
  showKorean?: boolean;
  size?: "large" | "medium";
  autoFocus?: boolean;
  name?: string;
}

/**
 * 금액 입력 (README 4.2).
 * - 숫자 키패드, 실시간 콤마, 커서 위치 유지, 붙여넣기 정리, 앞자리 0 제거, 상한 안내, 지우기, 한글 금액, 빠른 입력 칩
 */
export function MoneyInput({
  label,
  value,
  onChange,
  max,
  placeholder = "0",
  description,
  errorMessage,
  quickAmounts,
  showKorean = true,
  size = "large",
  autoFocus,
  name,
}: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);
  const lastKey = useRef<string | null>(null);
  const [overflow, setOverflow] = useState(false);
  const koreanId = useId();

  const digits = value === null ? "" : String(value);
  const display = formatWithCommas(value);

  // 리렌더 뒤 커서를 복원한다. 콤마가 끼어들어도 커서가 튀지 않게 하는 핵심.
  useLayoutEffect(() => {
    const pos = pendingCursor.current;
    const el = inputRef.current;
    if (pos === null || !el) return;
    pendingCursor.current = null;
    if (document.activeElement === el) el.setSelectionRange(pos, pos);
  });

  /** 포맷된 문자열에서 n번째 숫자 뒤의 인덱스 */
  const cursorAfterDigits = (formatted: string, n: number): number => {
    if (n <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i += 1) {
      if (/\d/.test(formatted.charAt(i))) {
        seen += 1;
        if (seen === n) return i + 1;
      }
    }
    return formatted.length;
  };

  const commit = (nextDigits: string, digitsBeforeCursor: number) => {
    const cleaned = stripLeadingZeros(nextDigits);
    if (cleaned === "") {
      setOverflow(false);
      pendingCursor.current = 0;
      onChange(null);
      return;
    }
    const num = Number(cleaned);
    if (num > max) {
      // 입력을 막고 이전 값 유지 (React 가 DOM 값을 되돌린다)
      setOverflow(true);
      pendingCursor.current = cursorAfterDigits(
        display,
        Math.min(digitsBeforeCursor, digits.length),
      );
      onChange(value);
      return;
    }
    setOverflow(false);
    const removedLeadingZeros = nextDigits.length - cleaned.length;
    pendingCursor.current = cursorAfterDigits(
      formatWithCommas(num),
      digitsBeforeCursor - removedLeadingZeros,
    );
    onChange(num);
  };

  const handleValueChange = ({ value: raw }: { value: string }) => {
    const el = inputRef.current;
    const selection = el?.selectionStart ?? raw.length;
    let before = onlyDigits(raw.slice(0, selection)).length;
    let next = onlyDigits(raw);

    // 콤마만 지워진 경우(백스페이스/Delete 가 구분자를 지움): 인접한 숫자를 대신 지운다
    if (next === digits && raw.length < display.length) {
      if (lastKey.current === "Delete") {
        next = next.slice(0, before) + next.slice(before + 1);
      } else if (before > 0) {
        next = next.slice(0, before - 1) + next.slice(before);
        before -= 1;
      }
    }
    commit(next, before);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const parsed = parseMoneyText(e.clipboardData.getData("text"));
    if (parsed === null) return;
    // 붙여넣기는 전체 값을 대체한다 ("4,500만원" → 45,000,000)
    const str = String(parsed);
    commit(str, str.length);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    lastKey.current = e.key;
    // 음수·소수·지수 입력 차단 (모바일 숫자 키패드에는 없지만 데스크톱 대비)
    if (e.key === "-" || e.key === "." || e.key === "e" || e.key === "E" || e.key === "+") {
      e.preventDefault();
    }
  };

  const clear = () => {
    setOverflow(false);
    onChange(null);
    inputRef.current?.focus();
  };

  const applyQuick = (q: QuickAmount) => {
    setOverflow(false);
    if (q.delta === null) {
      onChange(null);
      return;
    }
    const next = Math.min((value ?? 0) + q.delta, max);
    setOverflow((value ?? 0) + q.delta > max);
    onChange(next);
  };

  const korean = showKorean ? formatKoreanMoney(value) : "";
  const overflowMessage = `최대 ${formatKoreanMoney(max)}까지 입력할 수 있어요.`;
  const invalid = overflow || !!errorMessage;

  return (
    <VStack gap="x2">
      <TextField
        label={label}
        size={size}
        value={display}
        onValueChange={handleValueChange}
        invalid={invalid}
        errorMessage={overflow ? overflowMessage : errorMessage}
        description={description}
        suffix={
          <HStack gap="x2" align="center">
            <Text textStyle="t5Regular" color="fg.neutralMuted">
              원
            </Text>
            {value !== null && (
              <button
                type="button"
                aria-label={`${label} 지우기`}
                onClick={clear}
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  display: "inline-flex",
                  cursor: "pointer",
                }}
              >
                <IconXmarkCircleFill width={20} height={20} />
              </button>
            )}
          </HStack>
        }
      >
        <TextFieldInput
          ref={inputRef}
          name={name}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          enterKeyHint="done"
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="tabular"
          aria-describedby={showKorean ? koreanId : undefined}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        />
      </TextField>

      {showKorean && (
        <Text id={koreanId} textStyle="t4Regular" color="fg.neutralMuted" aria-live="polite">
          {korean || " "}
        </Text>
      )}

      {quickAmounts && quickAmounts.length > 0 && (
        <HStack gap="x2" wrap="wrap" role="group" aria-label={`${label} 빠른 입력`}>
          {quickAmounts.map((q) => (
            <ButtonChip
              key={q.label}
              size="small"
              variant="outlineWeak"
              onClick={() => applyQuick(q)}
            >
              <ChipLabel>{q.label}</ChipLabel>
            </ButtonChip>
          ))}
        </HStack>
      )}
    </VStack>
  );
}
