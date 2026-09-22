import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { preferencesStorage } from "@/platform/storage";

/**
 * 광고 제거 구매 상태. RevenueCat entitlement `no_ads` 를 반영한다.
 * 구매 즉시 배너가 사라져야 하므로 스토어로 반응형 관리한다.
 * TODO(native): RevenueCat 연동 시 앱 시작·구매·복원 시점에 setNoAds 를 호출한다.
 */
interface EntitlementStore {
  noAds: boolean;
  setNoAds: (value: boolean) => void;
}

export const useEntitlementStore = create<EntitlementStore>()(
  persist(
    (set) => ({
      noAds: false,
      setNoAds: (noAds) => set({ noAds }),
    }),
    {
      name: "salary-calc.entitlement.v1",
      storage: createJSONStorage(() => preferencesStorage),
    },
  ),
);
