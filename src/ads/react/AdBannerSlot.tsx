import { Box } from "@seed-design/react";
import { useEffect } from "react";
import type { BannerSlot } from "../types";
import { useAdProvider } from "./useAds";

/**
 * 결과 화면 하단 배너 자리. 광고를 띄우지 않는 조건이면 아무것도 그리지 않는다.
 * 실제 광고 DOM(애드핏 ins 태그 / AdMob 네이티브 뷰)은 provider 가 담당한다.
 */
export function AdBannerSlot({ slot }: { slot: BannerSlot }) {
  const { showAds, provider } = useAdProvider();

  useEffect(() => {
    if (!showAds) return;
    let cancelled = false;
    provider
      .init()
      .then(() => (cancelled ? undefined : provider.showBanner(slot)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
      provider.hideBanner().catch(() => undefined);
    };
  }, [provider, showAds, slot]);

  if (!showAds) return null;
  return <Box data-ad-slot={slot} minHeight="50px" width="100%" />;
}
