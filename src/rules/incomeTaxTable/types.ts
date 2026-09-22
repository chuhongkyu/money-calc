/**
 * 근로소득 간이세액표 데이터 스키마.
 * 국세청 원본 표(엑셀)를 scripts/build-income-tax-table.mjs 로 변환해서 JSON 으로 둔다.
 */
export interface IncomeTaxBracket {
  /** 월 급여(비과세 제외) 구간 시작, inclusive (원) */
  from: number;
  /** 구간 끝, exclusive (원) */
  to: number;
  /** 공제대상가족 수 1명 ~ 11명 순서. 길이 11. 단위: 원 */
  tax: number[];
}

/** 8세 이상 20세 이하 자녀가 있는 경우 표 세액에서 차감하는 금액. 표 하단 주석을 그대로 따른다. */
export interface ChildAdjustment {
  one: number;
  two: number;
  threeOrMoreBase: number;
  perChildOverTwo: number;
}

/**
 * 표 상한(월 1,000만 원)을 넘는 구간의 산식.
 * tax = baseTax(표 마지막 구간 세액) + fixed + (income − over) × taxableRatio × rate
 */
export interface HighIncomeSegment {
  /** 초과 기준액 (원) */
  over: number;
  /** 이 구간의 상한, exclusive. null 이면 무한대 */
  upTo: number | null;
  fixed: number;
  taxableRatio: number;
  rate: number;
}

export interface IncomeTaxTable {
  /** 예: "2026-03-01" (적용 시작일) */
  tableId: string;
  title: string;
  /** 적용 시작일 (ISO) */
  effectiveFrom: string;
  /** 적용 종료일 (ISO). null 이면 현재 적용 중 */
  effectiveTo: string | null;
  verified: boolean;
  sources: string[];
  unit: "KRW";
  /** [최소, 최대] 공제대상가족 수 */
  dependentsRange: [number, number];
  /** 구간이 비어 있으면 세액을 계산할 수 없다 (INCOME_TAX_TABLE_MISSING 경고) */
  brackets: IncomeTaxBracket[];
  childAdjustment: ChildAdjustment;
  highIncome: {
    /** 이 금액 이상이면 산식 적용 (원). 예: 10,000,000 */
    threshold: number;
    /** "10,000천원인 경우의 해당 세액" 행. 공제대상가족 1~11명. 표 마지막 구간과 값이 다르다 */
    baseTax: number[];
    segments: HighIncomeSegment[];
  };
}

function isNumberArray(v: unknown, length?: number): v is number[] {
  return (
    Array.isArray(v) &&
    (length === undefined || v.length === length) &&
    v.every((n) => typeof n === "number")
  );
}

/**
 * JSON 을 IncomeTaxTable 로 검증한다. 잘못된 데이터는 앱 시작 시 바로 드러나야 한다.
 */
export function parseIncomeTaxTable(json: unknown): IncomeTaxTable {
  const t = json as Record<string, unknown>;
  const fail = (msg: string): never => {
    throw new Error(`Invalid income tax table (${String(t.tableId)}): ${msg}`);
  };

  if (typeof t.tableId !== "string") fail("tableId");
  if (typeof t.title !== "string") fail("title");
  if (typeof t.effectiveFrom !== "string") fail("effectiveFrom");
  if (t.effectiveTo !== null && typeof t.effectiveTo !== "string") fail("effectiveTo");
  if (typeof t.verified !== "boolean") fail("verified");
  if (!Array.isArray(t.sources)) fail("sources");
  if (t.unit !== "KRW") fail("unit");
  if (!isNumberArray(t.dependentsRange, 2)) fail("dependentsRange");
  const [min, max] = t.dependentsRange as [number, number];
  const columns = max - min + 1;

  if (!Array.isArray(t.brackets)) fail("brackets");
  const brackets = (t.brackets as unknown[]).map((b, i) => {
    const r = b as Record<string, unknown>;
    if (typeof r.from !== "number" || typeof r.to !== "number" || r.from >= r.to)
      fail(`brackets[${i}] range`);
    if (!isNumberArray(r.tax, columns)) fail(`brackets[${i}].tax must have ${columns} entries`);
    return { from: r.from as number, to: r.to as number, tax: r.tax as number[] };
  });

  const c = t.childAdjustment as Record<string, unknown>;
  for (const k of ["one", "two", "threeOrMoreBase", "perChildOverTwo"]) {
    if (typeof c?.[k] !== "number") fail(`childAdjustment.${k}`);
  }

  const h = t.highIncome as Record<string, unknown>;
  if (typeof h?.threshold !== "number" || !Array.isArray(h.segments)) fail("highIncome");
  if (!isNumberArray(h.baseTax) || (h.baseTax.length !== 0 && h.baseTax.length !== columns)) {
    fail(`highIncome.baseTax must be empty or have ${columns} entries`);
  }
  const segments = (h.segments as unknown[]).map((s, i) => {
    const r = s as Record<string, unknown>;
    const ok =
      typeof r.over === "number" &&
      (r.upTo === null || typeof r.upTo === "number") &&
      typeof r.fixed === "number" &&
      typeof r.taxableRatio === "number" &&
      typeof r.rate === "number";
    if (!ok) fail(`highIncome.segments[${i}]`);
    return r as unknown as HighIncomeSegment;
  });

  return {
    tableId: t.tableId as string,
    title: t.title as string,
    effectiveFrom: t.effectiveFrom as string,
    effectiveTo: t.effectiveTo as string | null,
    verified: t.verified as boolean,
    sources: t.sources as string[],
    unit: "KRW",
    dependentsRange: [min, max],
    brackets,
    childAdjustment: c as unknown as ChildAdjustment,
    highIncome: { threshold: h.threshold as number, baseTax: h.baseTax as number[], segments },
  };
}
