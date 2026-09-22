import { defineConfig } from "@stackflow/config";
import type { DeductionKey } from "@/domain/salary";

declare module "@stackflow/config" {
  interface Register {
    HomeActivity: Record<string, never>;
    DetailActivity: Record<string, never>;
    ResultActivity: Record<string, never>;
    SettingsActivity: Record<string, never>;
    RulesInfoActivity: { year: string };
    DeductionInfoActivity: { key: DeductionKey };
    PrivacyActivity: Record<string, never>;
    TermsActivity: Record<string, never>;
    LicensesActivity: Record<string, never>;
  }
}

/**
 * 활동 등록. route 는 history-sync 플러그인이 웹 URL 과 동기화한다.
 * 주의: history-sync 는 활동당 라우트 하나로 URL 을 만들므로 선택적 path 파라미터는 쓰지 않는다.
 */
export const config = defineConfig({
  activities: [
    { name: "HomeActivity", route: "/" },
    { name: "DetailActivity", route: "/detail" },
    { name: "ResultActivity", route: "/result" },
    { name: "SettingsActivity", route: "/settings" },
    { name: "RulesInfoActivity", route: "/rules/:year" },
    { name: "DeductionInfoActivity", route: "/deduction/:key" },
    // 법적 페이지: ads/config.adFreePaths 와 경로를 맞춘다
    { name: "PrivacyActivity", route: "/privacy" },
    { name: "TermsActivity", route: "/terms" },
    { name: "LicensesActivity", route: "/licenses" },
  ],
  transitionDuration: 270,
});
