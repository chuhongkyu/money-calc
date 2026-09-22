import { Box, HStack } from "@seed-design/react";
import type { PropsWithChildren } from "react";

/**
 * 본문 최대 너비. 화면이 이보다 넓어지면 내용만 가운데로 모이고,
 * 배경(AppScreen·AppBar·하단 고정 바)은 화면 전체를 계속 덮는다.
 */
export const CONTENT_MAX_WIDTH = "1200px";

/**
 * 넓은 화면에서 본문이 양옆으로 늘어지지 않게 감싸는 컨테이너.
 *
 * - `AppScreenContent` 바로 안쪽에 둔다.
 * - 배경이 화면 전체를 덮어야 하는 요소(예: 하단 고정 바)는 바깥 상자는 그대로 두고
 *   그 안의 내용만 이걸로 감싼다.
 * - 1200px 보다 좁은 화면에서는 아무 영향이 없다.
 */
export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <Box width="full" maxWidth={CONTENT_MAX_WIDTH} mx="auto">
      {children}
    </Box>
  );
}

/**
 * AppBar 루트가 이미 갖고 있는 좌우 여백. 본문의 `spacingX.globalGutter` 와 같은 x4(16px) 다.
 * 그 여백은 가운데 정렬 바깥에 있으므로, 헤더 컨테이너를 그만큼 좁혀야
 * 제목·아이콘이 본문 텍스트와 같은 x 좌표에서 시작한다.
 */
const HEADER_MAX_WIDTH = `calc(${CONTENT_MAX_WIDTH} - var(--seed-dimension-x4) * 2)`;

/**
 * AppBar 안쪽 슬롯(뒤로가기·제목·우측 버튼)을 본문과 같은 너비로 맞춘다.
 *
 * AppBar 자체는 화면 전체를 덮는 배경을 갖고 있어서 그대로 두고, 그 안의 내용만 감싼다.
 * SEED 의 Left/Main/Right 는 AppBar 루트의 flex 자식인 걸 전제로 하므로
 * (Main 은 `flex:1`, Right 는 `margin-left:auto`) 이 컨테이너도 같은 flex 행이어야 한다.
 *
 * 좁은 화면에서는 maxWidth 가 걸리지 않아 기존 레이아웃과 완전히 같다.
 */
export function HeaderContainer({ children }: PropsWithChildren) {
  return (
    <HStack
      width="full"
      height="full"
      maxWidth={HEADER_MAX_WIDTH}
      mx="auto"
      align="center"
      gap="x0"
    >
      {children}
    </HStack>
  );
}
