import { describe, expect, it } from "vitest";
import { adsConfig } from "../config";
import {
  decideInterstitial,
  initialInterstitialGateState,
  recordResultView,
  recordShown,
  type InterstitialGateState,
} from "../frequency";

const cfg = adsConfig.interstitial;
const T0 = 1_000_000;

function afterViews(n: number): InterstitialGateState {
  let s = initialInterstitialGateState;
  for (let i = 0; i < n; i += 1) s = recordResultView(s);
  return s;
}

describe("decideInterstitial", () => {
  it("첫 실행 뒤 N회는 무료 통과", () => {
    for (let i = 1; i <= cfg.freePassesAfterInstall; i += 1) {
      expect(decideInterstitial(afterViews(i), cfg, T0)).toEqual({
        allow: false,
        reason: "freePass",
      });
    }
    expect(decideInterstitial(afterViews(cfg.freePassesAfterInstall + 1), cfg, T0)).toEqual({
      allow: true,
    });
  });

  it("최소 간격 안에서는 다시 띄우지 않는다", () => {
    const s = recordShown(afterViews(10), T0);
    expect(decideInterstitial(s, cfg, T0 + cfg.minIntervalMs - 1)).toEqual({
      allow: false,
      reason: "tooSoon",
    });
    expect(decideInterstitial(s, cfg, T0 + cfg.minIntervalMs)).toEqual({ allow: true });
  });

  it("세션당 최대 횟수", () => {
    let s = afterViews(10);
    for (let i = 0; i < cfg.maxPerSession; i += 1) s = recordShown(s, T0 + i);
    expect(decideInterstitial(s, cfg, T0 + 10 * cfg.minIntervalMs)).toEqual({
      allow: false,
      reason: "sessionLimit",
    });
  });

  it("recordShown 은 카운트와 시각을 갱신한다", () => {
    const s = recordShown(initialInterstitialGateState, 42);
    expect(s).toMatchObject({ lastShownAt: 42, shownThisSession: 1 });
  });
});
