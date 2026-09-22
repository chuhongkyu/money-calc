import { adsConfig } from "../config";
import type { AdProvider, BannerSlot, InterstitialOutcome } from "../types";

export interface AdMobIds {
  banner: string;
  interstitial: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ad timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(timer);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

/**
 * iOS/Android 앱 (Capacitor). 광고 로드에 실패해도 흐름을 막지 않는다 (타임아웃 1.5초).
 * TODO(native): `pnpm add @capacitor-community/admob` 후 아래 주석 코드를 활성화한다.
 * ATT/UMP 동의 거부 시 비개인화 광고(npa)로 전환한다.
 */
export class AdMobProvider implements AdProvider {
  readonly name = "admob" as const;
  private initialized = false;

  constructor(private readonly ids: AdMobIds) {}

  async init(): Promise<void> {
    if (this.initialized) return;
    // const { AdMob } = await import("@capacitor-community/admob");
    // await AdMob.initialize();
    this.initialized = true;
  }

  async showBanner(_slot: BannerSlot): Promise<void> {
    // const { AdMob, BannerAdSize, BannerAdPosition } = await import("@capacitor-community/admob");
    // await AdMob.showBanner({ adId: this.ids.banner, adSize: BannerAdSize.ADAPTIVE_BANNER, position: BannerAdPosition.BOTTOM_CENTER });
  }

  async hideBanner(): Promise<void> {
    // const { AdMob } = await import("@capacitor-community/admob");
    // await AdMob.hideBanner();
  }

  async showInterstitial(): Promise<InterstitialOutcome> {
    try {
      await withTimeout(this.prepareAndShowInterstitial(), adsConfig.interstitial.loadTimeoutMs);
      return "shown";
    } catch {
      return "failed";
    }
  }

  private async prepareAndShowInterstitial(): Promise<void> {
    // const { AdMob } = await import("@capacitor-community/admob");
    // await AdMob.prepareInterstitial({ adId: this.ids.interstitial });
    // await AdMob.showInterstitial();
    throw new Error(`AdMob SDK not wired yet (interstitial ${this.ids.interstitial})`);
  }
}
