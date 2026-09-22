#!/usr/bin/env python3
"""
국세청 간이세액표 xlsx 를 표준 라이브러리만으로 CSV 로 덤프한다.
사용법: python3 scripts/xlsx-to-csv.py <xlsx> <out.csv>
출력: 각 행의 셀 값을 콤마로 이어 쓴다 (셀 안 콤마는 제거).
"""
import re, sys, zipfile
import xml.etree.ElementTree as ET

src, out = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(src)
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
shared = []
if "xl/sharedStrings.xml" in z.namelist():
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    for si in root.findall("m:si", NS):
        shared.append("".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])))

# 세액 표는 보통 두 번째 시트에 있고 첫 시트는 주석이다. 행이 가장 많은 시트를 고른다.
sheet_names = sorted(n for n in z.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml$", n))
sheets = [ET.fromstring(z.read(n)) for n in sheet_names]
sheet = max(sheets, key=lambda s: len(list(s.iter("{%s}row" % NS["m"]))))
def col_index(ref):
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n - 1

rows = []
for row in sheet.iter("{%s}row" % NS["m"]):
    cells = {}
    for c in row.findall("m:c", NS):
        v = c.find("m:v", NS)
        if v is None:
            continue
        val = v.text or ""
        if c.get("t") == "s":
            val = shared[int(val)]
        cells[col_index(c.get("r"))] = val.replace(",", "").replace("\n", " ").strip()
    if not cells:
        continue
    width = max(cells) + 1
    rows.append([cells.get(i, "") for i in range(width)])

with open(out, "w", encoding="utf8") as f:
    for r in rows:
        f.write(",".join(r) + "\n")
print(f"{out}: {len(rows)} rows")
