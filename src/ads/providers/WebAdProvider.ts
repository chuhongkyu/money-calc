import type { AdProvider, BannerSlot } from "../types";

/**
 * 모바일 웹: 카카오 애드핏(1순위) / AdSense(2순위) 배너만. 웹에서는 전면 광고를 쓰지 않는다.
 * TODO(ads): 애드핏 스크립트 로딩과 <ins class="kakao_ad_area"> 렌더링을 AdBannerSlot 컴포넌트와 연결한다.
 */
export class WebAdProvider implements AdProvider {
  readonly name = "web" as const;
  constructor(private readonly unitIds: Partial<Record<BannerSlot, string>>) {}

  async init(): Promise<void> {}

  async showBanner(slot: BannerSlot): Promise<void> {
    const unit = this.unitIds[slot];
    if (!unit) return;
    // 배너 DOM 은 AdBannerSlot 이 그리고, 여기서는 스크립트 준비만 담당한다.
  }

  async hideBanner(): Promise<void> {}

  async showInterstitial(): Promise<"skipped"> {
    return "skipped";
  }
}
