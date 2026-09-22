import { beforeEach, describe, expect, it } from "vitest";
import { getAdProvider, resetAdProviderCache } from "..";

describe("getAdProvider", () => {
  beforeEach(() => resetAdProviderCache());

  it("광고 비노출이면 어떤 플랫폼이든 Noop", () => {
    expect(getAdProvider({ platform: "ios", showAds: false }).name).toBe("noop");
    expect(getAdProvider({ platform: "web", showAds: false }).name).toBe("noop");
  });
  it("웹은 WebAdProvider, 앱은 AdMobProvider", () => {
    expect(getAdProvider({ platform: "web", showAds: true }).name).toBe("web");
    expect(getAdProvider({ platform: "android", showAds: true }).name).toBe("admob");
  });
  it("같은 조건이면 같은 인스턴스를 재사용", () => {
    const a = getAdProvider({ platform: "web", showAds: true });
    expect(getAdProvider({ platform: "web", showAds: true })).toBe(a);
  });
  it("AdMob 은 SDK 연결 전이라 failed 를 돌려주되 throw 하지 않는다", async () => {
    await expect(
      getAdProvider({ platform: "ios", showAds: true }).showInterstitial("to_result"),
    ).resolves.toBe("failed");
  });
});
