import { adsConfig } from "./config";

export interface AdPolicyContext {
  /** RevenueCat entitlement `no_ads` */
  hasNoAdsEntitlement: boolean;
  /** import.meta.env.DEV */
  isDev: boolean;
  /** VITE_ADS_ENABLED */
  adsEnabledFlag: boolean;
  /** ?screenshot=1 또는 빌드 플래그 */
  screenshotMode: boolean;
  /** 현재 경로 (웹). 앱에서는 Stackflow 활동 경로 */
  pathname: string;
  /** (향후) 원격 킬스위치 */
  remoteKillSwitch?: boolean;
}

export function isAdFreePath(pathname: string): boolean {
  return adsConfig.adFreePaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * "광고를 빼는 경로" 를 빠짐없이 한곳에서 판단한다 (README 4.6).
 * ATT/EU 동의 거부는 여기서 끄지 않고 비개인화 광고로 전환한다 (provider 책임).
 */
export function shouldShowAds(ctx: AdPolicyContext): boolean {
  if (ctx.remoteKillSwitch) return false;
  if (ctx.hasNoAdsEntitlement) return false;
  if (ctx.isDev) return false;
  if (!ctx.adsEnabledFlag) return false;
  if (ctx.screenshotMode) return false;
  if (isAdFreePath(ctx.pathname)) return false;
  return true;
}

export function readScreenshotMode(search: string): boolean {
  return new URLSearchParams(search).get("screenshot") === "1";
}

export function readAdsEnabledFlag(raw: string | undefined): boolean {
  if (raw === undefined) return true;
  return raw !== "false" && raw !== "0";
}
