import { defineConfig, devices } from "@playwright/test";

/**
 * 기본 프로젝트는 iPhone(WebKit). 브라우저 설치: `pnpm exec playwright install webkit`
 * 로컬에 Chrome 만 있을 때: `pnpm e2e --project=chrome`
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
  },
  projects: [
    { name: "mobile-webkit", use: { ...devices["iPhone 13"] } },
    { name: "chrome", use: { ...devices["Pixel 7"], browserName: "chromium", channel: "chrome" } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
