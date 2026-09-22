import { expect, test } from "@playwright/test";

test("연봉을 입력하면 바로 월 실수령액이 보인다", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "연봉" });
  await input.fill("45000000");
  await expect(input).toHaveValue("45,000,000");
  await expect(page.getByText("4,500만 원")).toBeVisible();
  await expect(page.getByText("한 달에 실제로 받는 돈")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toContainText("원");
  await page.screenshot({ path: ".context/home.png", fullPage: false });
});

test("공제 내역 보기 → 결과 화면 → 공제 상세", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "연봉" }).fill("45000000");
  await page.getByRole("button", { name: "공제 내역 보기" }).click();
  await expect(page).toHaveURL(/\/result/);
  await expect(page.getByRole("heading", { name: "공제 내역" })).toBeVisible();
  await page.screenshot({ path: ".context/result.png", fullPage: false });

  await page.getByRole("button", { name: /국민연금/ }).click();
  await expect(page).toHaveURL(/\/deduction\/nationalPension/);
  await expect(page.getByText("기준소득월액(상·하한 적용)에", { exact: false })).toBeVisible();
});

test("더 정확하게 알아보기 → 조건 변경이 실수령액에 반영된다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "연봉" }).fill("45000000");
  const before = await page.getByRole("heading", { level: 2 }).textContent();
  await page.getByRole("button", { name: /더 정확하게 알아보기/ }).click();
  await expect(page).toHaveURL(/\/detail/);
  await page.getByRole("button", { name: "부양가족 수 늘리기" }).click();
  const after = await page.getByText("월 실수령액").locator("..").textContent();
  expect(after).not.toContain(before ?? "__none__");
  await page.screenshot({ path: ".context/detail.png", fullPage: false });
  await page.getByRole("button", { name: "결과 보기" }).click();
  await expect(page).toHaveURL(/\/result/);
});

test("설정 → 계산 기준 안내", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "계산 기준 안내" }).click();
  await expect(page).toHaveURL(/\/rules/);
  await expect(page.getByText("4대보험 (근로자 부담)")).toBeVisible();
  await expect(page.getByText("소득세 · 근로소득 간이세액표 (2026-03-01 이후 적용)")).toBeVisible();
  await page.screenshot({ path: ".context/rules.png", fullPage: false });
});

test("푸터 → 법적 페이지 3개", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "개인정보처리방침" }).click();
  await expect(page).toHaveURL(/\/privacy/);
  await expect(page.getByText("2. 입력값의 저장")).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByText("3. 계산 결과의 성격과 면책")).toBeVisible();
  await page.goto("/licenses");
  await expect(page.getByRole("link", { name: /@seed-design\/react/ }).first()).toBeVisible();
  await page.screenshot({ path: ".context/licenses.png", fullPage: false });
});
