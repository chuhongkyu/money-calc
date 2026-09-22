export type BannerSlot = "result_bottom";
export type InterstitialPlacement = "to_result";
export type InterstitialOutcome = "shown" | "skipped" | "failed";
export type RewardedOutcome = "rewarded" | "dismissed" | "failed";

export interface AdProvider {
  readonly name: "admob" | "web" | "noop";
  init(): Promise<void>;
  showBanner(slot: BannerSlot): Promise<void>;
  hideBanner(): Promise<void>;
  showInterstitial(placement: InterstitialPlacement): Promise<InterstitialOutcome>;
  showRewarded?(placement: string): Promise<RewardedOutcome>;
}
