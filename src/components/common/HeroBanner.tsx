import { Box } from "@seed-design/react";

/**
 * 홈 상단 배너. 브랜드 색(네이버 그린) 위에 투명 배경 일러스트를 얹는다.
 *
 * 이미지는 `public/img/banner.png` (1452×1083, 투명 PNG) 라 그대로 쓰면 너무 크다.
 * 상자 높이를 고정하고 이미지를 `object-fit: contain` 으로 맞춰 잘리지 않게 한다.
 * 장식용이라 대체 텍스트는 비우고 스크린리더에서 감춘다.
 */
export function HeroBanner() {
  return (
    <Box
      bg="bg.brandSolid"
      borderRadius="r5"
      overflowX="hidden"
      overflowY="hidden"
      height="180px"
      px="x4"
      pb="x2"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <img
        src="/img/banner.png"
        alt=""
        aria-hidden="true"
        width={1452}
        height={1083}
        decoding="async"
        style={{ height: "100%", width: "auto", maxWidth: "100%", objectFit: "contain" }}
      />
    </Box>
  );
}
