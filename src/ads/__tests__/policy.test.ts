import { describe, expect, it } from "vitest";
import {
  isAdFreePath,
  readAdsEnabledFlag,
  readScreenshotMode,
  shouldShowAds,
  type AdPolicyContext,
} from "../policy";

const ok: AdPolicyContext = {
  hasNoAdsEntitlement: false,
  isDev: false,
  adsEnabledFlag: true,
  screenshotMode: false,
  pathname: "/result",
};

describe("shouldShowAds", () => {
  it("기본 조건이면 노출", () => expect(shouldShowAds(ok)).toBe(true));
  it("광고 제거 구매자", () =>
    expect(shouldShowAds({ ...ok, hasNoAdsEntitlement: true })).toBe(false));
  it("개발 모드", () => expect(shouldShowAds({ ...ok, isDev: true })).toBe(false));
  it("VITE_ADS_ENABLED=false", () =>
    expect(shouldShowAds({ ...ok, adsEnabledFlag: false })).toBe(false));
  it("스크린샷 모드", () => expect(shouldShowAds({ ...ok, screenshotMode: true })).toBe(false));
  it("광고 제외 경로", () => {
    expect(shouldShowAds({ ...ok, pathname: "/privacy" })).toBe(false);
    expect(shouldShowAds({ ...ok, pathname: "/rules/2026" })).toBe(false);
  });
  it("원격 킬스위치", () => expect(shouldShowAds({ ...ok, remoteKillSwitch: true })).toBe(false));
});

describe("helpers", () => {
  it("isAdFreePath", () => {
    expect(isAdFreePath("/terms")).toBe(true);
    expect(isAdFreePath("/terms-of-something")).toBe(false);
    expect(isAdFreePath("/")).toBe(false);
  });
  it("readScreenshotMode", () => {
    expect(readScreenshotMode("?screenshot=1")).toBe(true);
    expect(readScreenshotMode("?screenshot=0")).toBe(false);
    expect(readScreenshotMode("")).toBe(false);
  });
  it("readAdsEnabledFlag", () => {
    expect(readAdsEnabledFlag(undefined)).toBe(true);
    expect(readAdsEnabledFlag("true")).toBe(true);
    expect(readAdsEnabledFlag("false")).toBe(false);
    expect(readAdsEnabledFlag("0")).toBe(false);
  });
});
