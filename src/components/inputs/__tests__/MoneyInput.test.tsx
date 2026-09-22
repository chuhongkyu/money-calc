import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MoneyInput, type MoneyInputProps } from "../MoneyInput";

function Harness(props: Partial<MoneyInputProps> & { initial?: number | null }) {
  const [value, setValue] = useState<number | null>(props.initial ?? null);
  return (
    <MoneyInput
      label="연봉"
      value={value}
      onChange={(v) => {
        setValue(v);
        props.onChange?.(v);
      }}
      max={props.max ?? 1_000_000_000}
      {...(props.quickAmounts ? { quickAmounts: props.quickAmounts } : {})}
      {...(props.showKorean === undefined ? {} : { showKorean: props.showKorean })}
    />
  );
}

const getInput = () => screen.getByLabelText("연봉") as HTMLInputElement;

describe("MoneyInput", () => {
  it("숫자 키패드 속성", () => {
    render(<Harness />);
    const input = getInput();
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("pattern", "[0-9]*");
  });

  it("입력하면서 실시간으로 콤마가 들어가고 값이 숫자로 전달된다", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = getInput();
    await userEvent.type(input, "45000000");
    expect(input.value).toBe("45,000,000");
    expect(onChange).toHaveBeenLastCalledWith(45_000_000);
  });

  it("한글 금액을 표시하고 스크린리더가 읽도록 연결한다", async () => {
    render(<Harness />);
    const input = getInput();
    await userEvent.type(input, "45000000");
    const korean = screen.getByText("4,500만 원");
    expect(input.getAttribute("aria-describedby")).toBe(korean.id);
  });

  it("중간에 숫자를 넣어 콤마가 추가돼도 커서가 튀지 않는다", async () => {
    render(<Harness initial={1234} />); // "1,234"
    const input = getInput();
    input.focus();
    // "1,|234" 위치에 5 삽입 → "15,234", 커서는 5 뒤(인덱스 2)
    input.setSelectionRange(2, 2);
    fireEvent.change(input, { target: { value: "1,5234", selectionStart: 3, selectionEnd: 3 } });
    expect(input.value).toBe("15,234");
    expect(input.selectionStart).toBe(2);
  });

  it("맨 앞에 숫자를 넣어 자릿수가 바뀌어도 커서가 유지된다", async () => {
    render(<Harness initial={999} />); // "999"
    const input = getInput();
    input.focus();
    input.setSelectionRange(0, 0);
    fireEvent.change(input, { target: { value: "1999", selectionStart: 1, selectionEnd: 1 } });
    expect(input.value).toBe("1,999");
    expect(input.selectionStart).toBe(1);
  });

  it("백스페이스로 콤마를 지우면 앞 숫자가 지워진다", () => {
    render(<Harness initial={1234} />); // "1,234"
    const input = getInput();
    input.focus();
    input.setSelectionRange(2, 2);
    fireEvent.keyDown(input, { key: "Backspace" });
    // 브라우저가 콤마만 지운 상태를 흉내낸다: "1234", 커서 1
    fireEvent.change(input, { target: { value: "1234", selectionStart: 1, selectionEnd: 1 } });
    expect(input.value).toBe("234");
    expect(input.selectionStart).toBe(0);
  });

  it("붙여넣기: 숫자 이외 문자를 제거하고 한글 단위를 해석한다", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = getInput();
    fireEvent.paste(input, { clipboardData: { getData: () => "4,500만원" } });
    expect(onChange).toHaveBeenLastCalledWith(45_000_000);
    expect(input.value).toBe("45,000,000");
  });

  it("앞자리 0 은 제거된다", async () => {
    render(<Harness />);
    const input = getInput();
    await userEvent.type(input, "007");
    expect(input.value).toBe("7");
  });

  it("최대값을 넘으면 입력을 막고 안내한다", async () => {
    const onChange = vi.fn();
    render(<Harness max={1_000_000} onChange={onChange} />);
    const input = getInput();
    await userEvent.type(input, "1000000");
    expect(input.value).toBe("1,000,000");
    await userEvent.type(input, "0");
    expect(input.value).toBe("1,000,000");
    expect(screen.getByText("최대 100만 원까지 입력할 수 있어요.")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(1_000_000);
  });

  it("음수·소수 키는 무시된다", async () => {
    render(<Harness />);
    const input = getInput();
    await userEvent.type(input, "-1.5e3");
    expect(input.value).toBe("153");
  });

  it("지우기 버튼", async () => {
    const onChange = vi.fn();
    render(<Harness initial={5000} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "연봉 지우기" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(getInput().value).toBe("");
  });

  it("빠른 입력 칩", async () => {
    render(
      <Harness
        quickAmounts={[
          { label: "+100만", delta: 1_000_000 },
          { label: "초기화", delta: null },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "+100만" }));
    await userEvent.click(screen.getByRole("button", { name: "+100만" }));
    expect(getInput().value).toBe("2,000,000");
    await userEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(getInput().value).toBe("");
  });
});
