import type { AdsConfig } from "./config";

export interface InterstitialGateState {
  /** 설치 후 "결과 보기" 를 누른 누적 횟수 (영구 저장) */
  resultViews: number;
  /** 마지막 전면 광고 노출 시각 (epoch ms, 영구 저장) */
  lastShownAt: number | null;
  /** 이번 세션 노출 횟수 (메모리) */
  shownThisSession: number;
}

export const initialInterstitialGateState: InterstitialGateState = {
  resultViews: 0,
  lastShownAt: null,
  shownThisSession: 0,
};

export type InterstitialDecision =
  { allow: true } | { allow: false; reason: "freePass" | "tooSoon" | "sessionLimit" };

/**
 * 전면 광고 빈도 제한. 순수 함수라 테스트하기 쉽다.
 * 호출 순서: recordResultView → decide → (shown 이면) recordShown
 */
export function decideInterstitial(
  state: InterstitialGateState,
  config: AdsConfig["interstitial"],
  now: number,
): InterstitialDecision {
  if (state.resultViews <= config.freePassesAfterInstall)
    return { allow: false, reason: "freePass" };
  if (state.shownThisSession >= config.maxPerSession)
    return { allow: false, reason: "sessionLimit" };
  if (state.lastShownAt !== null && now - state.lastShownAt < config.minIntervalMs) {
    return { allow: false, reason: "tooSoon" };
  }
  return { allow: true };
}

export function recordResultView(state: InterstitialGateState): InterstitialGateState {
  return { ...state, resultViews: state.resultViews + 1 };
}

export function recordShown(state: InterstitialGateState, now: number): InterstitialGateState {
  return { ...state, lastShownAt: now, shownThisSession: state.shownThisSession + 1 };
}
