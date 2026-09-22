import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      css: false,
      server: {
        deps: {
          // SEED 패키지는 ESM 에서 .css 를 import 하므로 Vite 로 변환해야 한다
          inline: [/@seed-design\//, /@karrotmarket\//],
        },
      },
      include: ["src/**/*.test.{ts,tsx}"],
      coverage: {
        provider: "v8",
        include: ["src/domain/**", "src/lib/**", "src/rules/**"],
        exclude: ["**/__tests__/**", "**/*.test.*"],
        thresholds: {
          // README 4.3: domain/ 커버리지 90% 이상
          "src/domain/**": { lines: 90, functions: 90, branches: 85, statements: 90 },
        },
      },
    },
  }),
);
