#!/usr/bin/env node
/**
 * package.json 의 dependencies (런타임 번들에 들어가는 것) 와 그 하위 의존성의 라이선스를 모아
 * src/legal/licenses.json 을 만든다. 앱의 "오픈소스 라이선스" 화면이 이 파일을 읽는다.
 * 실행: pnpm licenses
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, sep } from "node:path";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const require = createRequire(join(root, "package.json"));

const seen = new Map();
const queue = Object.keys(pkg.dependencies ?? {});

function enclosingNodeModules(dir) {
  const marker = `${sep}node_modules${sep}`;
  const idx = dir.lastIndexOf(marker);
  return idx < 0 ? null : dir.slice(0, idx + marker.length);
}

function readPkg(name, from) {
  // pnpm 레이아웃: 하위 의존성은 부모(실경로)를 감싼 node_modules 의 형제로 놓인다.
  // exports 로 package.json 을 막은 패키지도 있으므로 require.resolve 대신 경로를 직접 본다.
  const real = realpathSync(from);
  const candidates = [
    enclosingNodeModules(real) ? join(enclosingNodeModules(real), name, "package.json") : null,
    join(real, "node_modules", name, "package.json"),
    join(root, "node_modules", name, "package.json"),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p))
      return { dir: realpathSync(dirname(p)), json: JSON.parse(readFileSync(p, "utf8")) };
  }
  try {
    const p = createRequire(join(real, "package.json")).resolve(`${name}/package.json`);
    return { dir: realpathSync(dirname(p)), json: JSON.parse(readFileSync(p, "utf8")) };
  } catch {
    return null;
  }
}

const pending = queue.map((name) => ({ name, from: root }));
while (pending.length > 0) {
  const { name, from } = pending.shift();
  if (seen.has(name)) continue;
  const found = readPkg(name, from);
  if (!found) {
    seen.set(name, { name, version: "?", license: "UNKNOWN", repository: null });
    continue;
  }
  const { dir, json } = found;
  const repo =
    typeof json.repository === "string" ? json.repository : (json.repository?.url ?? null);
  seen.set(name, {
    name,
    version: json.version ?? "?",
    license:
      json.license ??
      (Array.isArray(json.licenses) ? json.licenses.map((l) => l.type).join(", ") : null) ??
      // package.json 에 license 가 없는 패키지: 같은 저장소(모노레포)의 라이선스를 따른다
      (typeof repo === "string" && repo.includes("github.com/daangn/seed-design")
        ? "Apache-2.0"
        : null) ??
      "UNKNOWN",
    repository: repo
      ? repo
          .replace(/^git\+/, "")
          .replace(/\.git$/, "")
          .replace(/^git:\/\//, "https://")
      : null,
  });
  for (const dep of Object.keys(json.dependencies ?? {})) pending.push({ name: dep, from: dir });
}

const list = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  count: list.length,
  packages: list,
};
writeFileSync(join(root, "src/legal/licenses.json"), `${JSON.stringify(out, null, 2)}\n`);
const summary = list.reduce((acc, p) => ((acc[p.license] = (acc[p.license] ?? 0) + 1), acc), {});
console.log(`${list.length} packages →`, summary);
