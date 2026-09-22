import type { AdProvider } from "../types";

/** 광고 제거 구매자, 개발 모드, 스크린샷 모드, 광고 비활성 빌드 */
export class NoopProvider implements AdProvider {
  readonly name = "noop" as const;
  async init(): Promise<void> {}
  async showBanner(): Promise<void> {}
  async hideBanner(): Promise<void> {}
  async showInterstitial(): Promise<"skipped"> {
    return "skipped";
  }
}
