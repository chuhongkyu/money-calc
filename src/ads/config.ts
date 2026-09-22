/**
 * 광고 정책 값은 모두 여기서만 관리한다 (README 4.5).
 */
export const adsConfig = {
  interstitial: {
    /** 첫 실행 뒤 이 횟수만큼 "결과 보기" 는 전면 광고 없이 통과 */
    freePassesAfterInstall: 2,
    /** 전면 광고 사이 최소 간격 */
    minIntervalMs: 3 * 60 * 1000,
    /** 세션(앱 실행)당 최대 노출 횟수 */
    maxPerSession: 3,
    /** 로드 대기 한도. 넘기면 광고 없이 진행 */
    loadTimeoutMs: 1500,
  },
  banner: {
    slot: "result_bottom" as const,
  },
  /** 광고를 절대 띄우지 않는 웹 경로 (README 4.6) */
  adFreePaths: ["/privacy", "/terms", "/rules", "/licenses"],
  /** Google 공식 테스트 광고 ID. 실제 ID 는 환경변수로만 주입한다. */
  admobTestIds: {
    bannerAndroid: "ca-app-pub-3940256099942544/6300978111",
    bannerIOS: "ca-app-pub-3940256099942544/2934735716",
    interstitialAndroid: "ca-app-pub-3940256099942544/1033173712",
    interstitialIOS: "ca-app-pub-3940256099942544/4411468910",
  },
} as const;

export type AdsConfig = typeof adsConfig;
