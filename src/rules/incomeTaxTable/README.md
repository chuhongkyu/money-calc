# 근로소득 간이세액표 데이터

소득세는 국세청이 고시하는 **근로소득 간이세액표** 하나로 전 사용자 공통 조회한다. 앱은 이 표를 JSON 으로 내장하며,
사용자가 따로 준비할 것은 없다. 로그인·서버 없음.

## 출처 (홈택스 → 원천징수 → 근로소득 간이세액표)

https://hometax.go.kr/websquare/websquare.html?w2xPath=/ui/pp/index_pp.xml&tmIdx=41&tm2lIdx=4106000000&tm3lIdx=4106030000

| 파일                                | 적용 기간     | JSON              | 원본 보관       |
| ----------------------------------- | ------------- | ----------------- | --------------- |
| 근로소득 간이세액표_2026.03.01.xlsx | 2026.3.1 이후 | `2026-03-01.json` | `docs/sources/` |

제품 결정(2026-09-22): 개정 전 표(2024.3.1 ~ 2026.2.28)는 담지 않는다. 기준일이 2026.3.1 이전이면 2026.3.1 로 보정한다.
참고로 2024.3.1 표와 2026.3.1 표는 세액 구간(646개)이 같고 8~20세 자녀 차감액만 다르다
(2024.03: 12,500 / 29,160 / +25,000 → 2026.03: 20,830 / 45,830 / +33,330).

## JSON 에 들어 있는 것

- `brackets`: 월급여액(비과세 제외) 구간별 · 공제대상가족 1~11명 세액 (표 본문, "-" 는 0원)
- `highIncome.baseTax`: "10,000천원인 경우의 해당 세액" 행. 1,000만 원 초과 산식의 기준값 (마지막 구간과 값이 다름)
- `highIncome.segments`: 1,000만 원 초과 산식 (표 하단 주석)
- `childAdjustment`: 자녀 차감액 (표 하단 주석 3)
- 11명 초과는 주석 4 대로 코드에서 계산한다 (`taxForDependents`)

## 갱신 절차 (표가 바뀌는 해, 보통 2~3월)

```bash
# 1. 홈택스에서 xlsx 다운로드 → docs/sources/ 에 보관
# 2. CSV 로 덤프 (표준 라이브러리만 사용)
python3 scripts/xlsx-to-csv.py "docs/sources/근로소득 간이세액표_YYYY.MM.01.xlsx" .context/tables/YYYY-MM.csv
# 3. JSON 골격을 만든다 (기존 파일 복사 후 tableId/title/effectiveFrom/childAdjustment 수정, 이전 표의 effectiveTo 채우기)
# 4. brackets / baseTax 채우기
node scripts/build-income-tax-table.mjs .context/tables/YYYY-MM.csv YYYY-MM-01
# 5. src/rules/index.ts 에 등록. 자녀 차감액이 바뀌었으면 표 주석과 대조 후 verified: true
```
