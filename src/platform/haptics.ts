import { isNative } from "./index";

/**
 * 가벼운 햅틱. 앱에서만 동작하며 웹에서는 no-op.
 * TODO(native): @capacitor/haptics 설치 후 연결한다.
 */
export async function hapticLight(): Promise<void> {
  if (!isNative()) return;
  // const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  // await Haptics.impact({ style: ImpactStyle.Light });
}
