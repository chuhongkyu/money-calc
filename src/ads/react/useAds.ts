import { useCallback, useMemo } from "react";
import { useEntitlementStore } from "@/app/entitlementStore";
import { getPlatform } from "@/platform";
import { getAdProvider } from "..";
import { adsConfig } from "../config";
import { decideInterstitial, recordResultView, recordShown } from "../frequency";
import { useInterstitialGateStore } from "../gateStore";
import { readAdsEnabledFlag, readScreenshotMode, shouldShowAds } from "../policy";
import type { AdProvider } from "../types";

function currentPathname(): string {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

export function useAdProvider(): { showAds: boolean; provider: AdProvider } {
  const noAds = useEntitlementStore((s) => s.noAds);
  return useMemo(() => {
    const showAds = shouldShowAds({
      hasNoAdsEntitlement: noAds,
      isDev: import.meta.env.DEV,
      adsEnabledFlag: readAdsEnabledFlag(import.meta.env.VITE_ADS_ENABLED),
      screenshotMode: typeof window !== "undefined" && readScreenshotMode(window.location.search),
      pathname: currentPathname(),
    });
    return { showAds, provider: getAdProvider({ platform: getPlatform(), showAds }) };
  }, [noAds]);
}

/**
 * "결과 보기" 전에 호출한다. 빈도 제한을 통과하면 전면 광고를 띄우고, 어떤 경우에도 resolve 한다.
 */
export function useInterstitialBeforeResult(): () => Promise<void> {
  const { showAds, provider } = useAdProvider();
  const gate = useInterstitialGateStore();

  return useCallback(async () => {
    const now = Date.now();
    let state = recordResultView(gate);
    gate.update(state);

    if (!showAds) return;
    const decision = decideInterstitial(state, adsConfig.interstitial, now);
    if (!decision.allow) return;

    try {
      const outcome = await provider.showInterstitial("to_result");
      if (outcome === "shown") {
        state = recordShown(state, now);
        gate.update(state);
      }
    } catch {
      // 광고 실패는 흐름을 막지 않는다
    }
  }, [gate, provider, showAds]);
}
