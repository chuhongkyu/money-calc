import { Capacitor } from "@capacitor/core";

export type Platform = "ios" | "android" | "web";
export type BuildTarget = "web" | "app";

export function getPlatform(): Platform {
  const p = Capacitor.getPlatform();
  return p === "ios" || p === "android" ? p : "web";
}

export const isNative = (): boolean => Capacitor.isNativePlatform();
export const isIOS = (): boolean => getPlatform() === "ios";
export const isAndroid = (): boolean => getPlatform() === "android";

/** README 2절: iOS → cupertino, Android·웹 → android */
export function getStackflowTheme(platform: Platform = getPlatform()): "cupertino" | "android" {
  return platform === "ios" ? "cupertino" : "android";
}

export const buildTarget: BuildTarget = import.meta.env.VITE_TARGET === "app" ? "app" : "web";
