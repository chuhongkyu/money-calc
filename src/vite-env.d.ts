/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TARGET?: "web" | "app";
  readonly VITE_ADS_ENABLED?: string;
  readonly VITE_ADMOB_APP_ID_IOS?: string;
  readonly VITE_ADMOB_APP_ID_ANDROID?: string;
  readonly VITE_ADMOB_BANNER_RESULT?: string;
  readonly VITE_ADMOB_INTERSTITIAL_TO_RESULT?: string;
  readonly VITE_ADFIT_UNIT_RESULT?: string;
  readonly VITE_REVENUECAT_KEY_IOS?: string;
  readonly VITE_REVENUECAT_KEY_ANDROID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
