import { getPlatform, type Platform } from "@/platform";
import { adsConfig } from "./config";
import { AdMobProvider } from "./providers/AdMobProvider";
import { NoopProvider } from "./providers/NoopProvider";
import { WebAdProvider } from "./providers/WebAdProvider";
import type { AdProvider } from "./types";

export type { AdProvider } from "./types";
export { shouldShowAds, isAdFreePath } from "./policy";
export { adsConfig } from "./config";

export interface AdProviderSelection {
  platform: Platform;
  /** shouldShowAds() 결과 */
  showAds: boolean;
}

let cached: { key: string; provider: AdProvider } | null = null;

function admobIds(platform: Platform) {
  const env = import.meta.env;
  const isIOS = platform === "ios";
  return {
    banner:
      env.VITE_ADMOB_BANNER_RESULT ||
      (isIOS ? adsConfig.admobTestIds.bannerIOS : adsConfig.admobTestIds.bannerAndroid),
    interstitial:
      env.VITE_ADMOB_INTERSTITIAL_TO_RESULT ||
      (isIOS ? adsConfig.admobTestIds.interstitialIOS : adsConfig.admobTestIds.interstitialAndroid),
  };
}

/**
 * 환경과 사용자 상태로 구현체를 고른다. UI 는 구현체를 직접 import 하지 않는다.
 */
export function getAdProvider(
  selection: AdProviderSelection = { platform: getPlatform(), showAds: false },
): AdProvider {
  const key = `${selection.platform}:${selection.showAds}`;
  if (cached?.key === key) return cached.provider;

  let provider: AdProvider;
  if (!selection.showAds) {
    provider = new NoopProvider();
  } else if (selection.platform === "web") {
    provider = new WebAdProvider({ result_bottom: import.meta.env.VITE_ADFIT_UNIT_RESULT });
  } else {
    provider = new AdMobProvider(admobIds(selection.platform));
  }

  cached = { key, provider };
  return provider;
}

/** 테스트용 */
export function resetAdProviderCache(): void {
  cached = null;
}
