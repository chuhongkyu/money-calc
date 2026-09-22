#!/usr/bin/env node
/**
 * scripts/og-image.html 을 로컬 Chrome 으로 렌더해 public/og.png (1200×630) 를 만든다.
 * 실행: pnpm og   (Playwright + 로컬 Chrome 필요)
 */
import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(pathToFileURL(resolve("scripts/og-image.html")).href, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: "public/og.png", type: "png" });
await browser.close();
console.log("public/og.png written");
