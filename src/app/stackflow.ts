import { seedPlugin } from "@seed-design/stackflow";
import { historySyncPlugin } from "@stackflow/plugin-history-sync";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { stackflow } from "@stackflow/react";
import { DeductionInfoActivity } from "@/activities/DeductionInfoActivity";
import { DetailActivity } from "@/activities/DetailActivity";
import { HomeActivity } from "@/activities/HomeActivity";
import { LicensesActivity, PrivacyActivity, TermsActivity } from "@/activities/LegalActivity";
import { ResultActivity } from "@/activities/ResultActivity";
import { RulesInfoActivity } from "@/activities/RulesInfoActivity";
import { SettingsActivity } from "@/activities/SettingsActivity";
import { getStackflowTheme } from "@/platform";
import { config } from "./stackflow.config";

export const { Stack, actions } = stackflow({
  config,
  components: {
    HomeActivity,
    DetailActivity,
    ResultActivity,
    SettingsActivity,
    RulesInfoActivity,
    DeductionInfoActivity,
    PrivacyActivity,
    TermsActivity,
    LicensesActivity,
  },
  plugins: [
    basicRendererPlugin(),
    historySyncPlugin({ config, fallbackActivity: () => "HomeActivity" }),
    // iOS 앱은 cupertino, Android 앱과 웹은 android (README 2절)
    seedPlugin({ theme: getStackflowTheme() }),
  ],
});
