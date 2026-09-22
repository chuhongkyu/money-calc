#!/usr/bin/env node
/**
 * 국세청 근로소득 간이세액표 → rules/incomeTaxTable/<tableId>.json 의 brackets / highIncome.baseTax 갱신.
 *
 * 1) 홈택스에서 받은 xlsx 를 CSV 로 덤프:  python3 scripts/xlsx-to-csv.py <xlsx> <csv>
 * 2) JSON 갱신:                          node scripts/build-income-tax-table.mjs <csv> <tableId>
 *
 * CSV 규칙 (xlsx-to-csv.py 출력 그대로):
 *   - "이상(천원),미만(천원),1명,...,11명" 숫자 행을 구간으로 읽는다. "-" 는 0원.
 *   - "10000천원,,세액×11" 행은 1,000만 원 초과 산식의 기준세액(baseTax)으로 읽는다.
 *   - 그 외 행(제목, 주석, 산식 설명)은 건너뛴다.
 *
 * childAdjustment / highIncome.segments / effective 기간은 JSON 에 사람이 적는다 (표 주석 참고).
 * 변환 후에도 verified 는 false 로 유지된다. 골든 테스트 통과 후 사람이 true 로 바꾼다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [csvPath, tableId] = process.argv.slice(2);
if (!csvPath || !tableId) {
  console.error("usage: node scripts/build-income-tax-table.mjs <table.csv> <tableId>");
  process.exit(1);
}

const jsonPath = resolve("src/rules/incomeTaxTable", `${tableId}.json`);
const table = JSON.parse(readFileSync(jsonPath, "utf8"));
const columns = table.dependentsRange[1] - table.dependentsRange[0] + 1;

const toWon = (cell) => {
  const s = String(cell).trim();
  if (s === "-" || s === "") return 0;
  return /^\d+$/.test(s) ? Number(s) : null;
};

const brackets = [];
let baseTax = null;
for (const line of readFileSync(csvPath, "utf8").split(/\r?\n/)) {
  const cells = line.split(",").map((c) => c.trim());
  if (cells.length < columns + 2) continue;
  const tax = cells.slice(2, 2 + columns).map(toWon);
  if (tax.some((t) => t === null)) continue;

  if (/^\d+천원$/.test(cells[0]) && cells[1] === "") {
    baseTax = tax;
    continue;
  }
  if (!/^\d+$/.test(cells[0]) || !/^\d+$/.test(cells[1])) continue;
  brackets.push({ from: Number(cells[0]) * 1000, to: Number(cells[1]) * 1000, tax });
}

if (brackets.length === 0) {
  console.error("변환된 구간이 없습니다. CSV 형식을 확인하세요.");
  process.exit(1);
}
if (!baseTax) {
  console.error("1,000만 원 기준세액 행(예: '10000천원,,...')을 찾지 못했습니다.");
  process.exit(1);
}

brackets.sort((a, b) => a.from - b.from);
for (let i = 1; i < brackets.length; i += 1) {
  if (brackets[i - 1].to !== brackets[i].from) {
    console.warn(`구간이 이어지지 않습니다: ${brackets[i - 1].to} → ${brackets[i].from}`);
  }
}
const last = brackets[brackets.length - 1];
if (last.to !== table.highIncome.threshold) {
  console.warn(
    `마지막 구간 상한 ${last.to} 이 highIncome.threshold ${table.highIncome.threshold} 와 다릅니다.`,
  );
}

table.brackets = brackets;
table.highIncome.baseTax = baseTax;
table.verified = false;
writeFileSync(jsonPath, `${JSON.stringify(table, null, 2)}\n`);
console.log(
  `${jsonPath}: ${brackets.length} 구간 (${brackets[0].from.toLocaleString()} ~ ${last.to.toLocaleString()}원), baseTax[0]=${baseTax[0].toLocaleString()}`,
);
