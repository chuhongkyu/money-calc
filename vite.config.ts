import { seedDesignPlugin } from "@seed-design/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), seedDesignPlugin()],
  resolve: {
    // tsconfig.app.json 의 paths (@/*, seed-design/*) 를 그대로 쓴다
    tsconfigPaths: true,
  },
  server: {
    host: true,
  },
  build: {
    // Capacitor 웹뷰(iOS 15+/Android Chrome)와 모바일 웹을 함께 겨냥한다.
    target: "es2020",
  },
});
