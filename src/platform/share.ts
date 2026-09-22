import { isNative } from "./index";

export interface ShareInput {
  title: string;
  text: string;
  url?: string;
}

/**
 * 앱은 Capacitor Share, 웹은 Web Share API. 둘 다 안 되면 클립보드 복사로 대체한다.
 * TODO(native): @capacitor/share 설치 후 아래 분기를 연결한다.
 */
export async function share(input: ShareInput): Promise<"shared" | "copied" | "unavailable"> {
  if (isNative()) {
    // const { Share } = await import("@capacitor/share");
    // await Share.share({ title: input.title, text: input.text, url: input.url, dialogTitle: input.title });
    // return "shared";
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(input.url ? input : { title: input.title, text: input.text });
      return "shared";
    } catch {
      // 사용자가 취소한 경우 등. 아래 클립보드로 폴백하지 않고 조용히 종료.
      return "unavailable";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(`${input.text}${input.url ? `\n${input.url}` : ""}`);
    return "copied";
  }

  return "unavailable";
}
