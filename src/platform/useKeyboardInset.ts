import { useEffect, useState } from "react";

/**
 * 소프트 키보드가 올라올 때 하단 CTA 가 가려지지 않도록 visualViewport 기준 하단 여백(px)을 돌려준다.
 * iOS 웹뷰에서는 layout viewport 가 줄어들지 않으므로 visualViewport 로 계산해야 한다.
 * Capacitor 앱에서는 @capacitor/keyboard 의 resize 모드와 함께 쓴다. (TODO: 네이티브 연동 단계)
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const bottomGap = window.innerHeight - (vv.height + vv.offsetTop);
      setInset(Math.max(0, Math.round(bottomGap)));
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
