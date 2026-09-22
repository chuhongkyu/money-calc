# CLAUDE.md

이 저장소의 기준 문서는 **README.md** 다. 작업 전 전체를 읽고 거기서 정한 규칙(정확성 최우선, 연도 규칙은 데이터, 광고는 `ads/` 안에서만, 법령 값은 추측하지 않고 `TODO(verify)`)을 지킨다.

## 환경

- Node **22.12 이상** (`.nvmrc` = 22.19.0; jsdom 30 이 require(esm) 을 써서 22.11 에선 Vitest 가 깨진다) + pnpm 12 (corepack). `nvm use && pnpm install && pnpm dev`
- SEED 컴포넌트는 `npx @seed-design/cli@latest add ui:<name>` 로 `seed-design/ui/` 에 받아 쓴다. 직접 만들지 않는다.
- 경로 별칭: `@/*` → `src/*`, `seed-design/*` → `./seed-design/*`
- 스크립트: `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, `pnpm build:web`, `pnpm build:app`, `pnpm e2e` (WebKit 설치 전엔 `pnpm e2e --project=chrome`)
- SEED 스니펫은 Stackflow v1 훅(`useActions`)을 쓰므로 받은 뒤 `useFlow` 로 바꿔야 한다 (app-bar, app-screen 에 적용됨).

## 코드 규칙

- TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. `any` 금지.
- `src/domain/` 은 React/브라우저/Capacitor 를 import 하지 않는다. `(input, rules, table) => result` 순수 함수.
- 연도별 값은 `src/rules/YYYY.ts` + `src/rules/incomeTaxTable/YYYY.json` 에만 둔다. 새 연도는 `src/rules/index.ts` 레지스트리에 등록만 하면 UI 수정 없이 반영된다.
- 광고 SDK 는 `src/ads/providers/*` 에서만 호출한다. 광고 제외 판단은 `src/ads/policy.ts` 의 `shouldShowAds()` 한곳.
- 색상·간격·폰트는 SEED 토큰(`Text textStyle`, `Box px/py/gap` 등)만 쓴다. 하드코딩 금지.
- 계산 로직을 바꾸면 `src/domain/salary/__tests__` 를 같이 갱신하고 전부 통과시킨다.

## 현재 상태 (2026-09-22)

- README 8절 1~3단계 + 4·5·6단계 초안까지 골격 완료. 세부는 `docs/STATUS.md` 참고.
- 제품 결정(2026-09-22): **2026년 3월 이후만 지원** (2025 는 검증 불가로 제외). 2026 4대보험은 4insure 모의계산으로 검증됨(`verified: true`), 잔여 미확인 항목은 `rules/2026.ts` notes 와 README 10절. 간이세액표는 홈택스 원본(2026.03). 갱신 절차는 `src/rules/incomeTaxTable/README.md`.
