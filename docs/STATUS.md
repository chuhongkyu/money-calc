# 프로젝트 상태 (2026-09-22 초안)

## 완료

| README 단계 | 내용                                                                                                          | 상태                        |
| ----------- | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1           | Vite + React 19 + TS strict + pnpm, SEED Design(CLI 스니펫) + Stackflow, cupertino/android 테마 주입          | ✅                          |
| 2           | `rules/` 스키마, 2026 데이터 (4대보험 검증 완료, `verified: true`), 최저임금·단수 처리 필드 포함              | ✅                          |
| 3           | `domain/salary` 순수 계산 + 단위 테스트, 간이세액표 JSON 조회 구조, 골든 테스트 틀(연도별 25케이스 `it.todo`) | ✅                          |
| 4           | `MoneyInput`(커서 유지·붙여넣기·한글 금액·빠른 입력 칩·상한), `StepperInput`(SEED QuantityPicker) + 테스트    | ✅                          |
| 5           | Home / Result / Settings / RulesInfo / 공제 상세 BottomSheet 화면                                             | ✅ 초안                     |
| 6           | `ads/` 추상화, `policy.ts`, 빈도 제한, Noop / Web / AdMob(스텁)                                               | ✅ 초안                     |
| 7           | Capacitor iOS/Android, AdMob·RevenueCat·Share·Haptics 실제 연결                                               | ⬜ 스텁만                   |
| 8           | SEO 메타, 연도별 랜딩(SSG), 앱 설치 배너                                                                      | ⬜ `index.html` 기본 메타만 |

## 확인이 필요한 값 (TODO(verify)) — 진행 상황은 README 10절과 docs/verify-checklist.md

`src/rules/2025.ts`, `src/rules/2026.ts` 의 `notes` 와 인라인 주석, `src/rules/incomeTaxTable/README.md` 참고.

1. 국민연금 요율(2026 9.5%)과 기준소득월액 상·하한(기간별)
2. 건강보험·장기요양 요율과 장기요양 산출 방식(건보료 대비 비율 vs 소득 대비)
3. 각 보험료·세액의 단수 처리(원 단위 절사 vs 10원 미만 절사)
4. ~~근로소득 간이세액표 원본 → `brackets` 채우기~~ (2024.03·2026.03 홈택스 원본으로 채움. 자녀 차감액·산식은 표 주석과 대조 완료) → 남은 것: 골든 케이스로 국세청 계산기와 결과 대조
5. 최저임금(2025: 10,030 / 2026: 10,320)
6. 골든 테스트 기대값(연도별 25개) 사람 확인 후 `verified: true`

## 다음 작업

1. ~~간이세액표 CSV 확보~~ 완료 (`src/rules/incomeTaxTable/README.md`)
2. 골든 테스트 채우기 → `verified: true`
3. Capacitor 추가 (`pnpm add @capacitor/cli @capacitor/ios @capacitor/android @capacitor/share @capacitor/haptics @capacitor/keyboard @capacitor-community/admob @revenuecat/purchases-capacitor`) 후 `platform/share.ts`, `platform/haptics.ts`, `ads/providers/AdMobProvider.ts` 주석 코드 활성화
4. Playwright 브라우저 설치 후 `pnpm e2e`
