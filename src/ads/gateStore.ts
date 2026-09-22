import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { preferencesStorage } from "@/platform/storage";
import { initialInterstitialGateState, type InterstitialGateState } from "./frequency";

interface GateStore extends InterstitialGateState {
  update: (next: InterstitialGateState) => void;
}

/** resultViews / lastShownAt 은 영구 저장, shownThisSession 은 앱 실행마다 0 */
export const useInterstitialGateStore = create<GateStore>()(
  persist(
    (set) => ({
      ...initialInterstitialGateState,
      update: (next) => set(next),
    }),
    {
      name: "salary-calc.ads.gate.v1",
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (s) => ({ resultViews: s.resultViews, lastShownAt: s.lastShownAt }),
    },
  ),
);
