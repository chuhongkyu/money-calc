import { Preferences } from "@capacitor/preferences";
import type { StateStorage } from "zustand/middleware";

/**
 * Zustand persist 용 저장소 어댑터.
 * 네이티브에서는 Capacitor Preferences(UserDefaults/SharedPreferences), 웹에서는 localStorage 로 동작한다.
 * 입력값은 기기에만 저장하고 서버로 보내지 않는다 (README 9절).
 */
export const preferencesStorage: StateStorage = {
  getItem: async (name) => (await Preferences.get({ key: name })).value,
  setItem: async (name, value) => {
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name) => {
    await Preferences.remove({ key: name });
  },
};
