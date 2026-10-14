// Usage: node build_names.mjs <api-root> <out-dir> [--only en,de,...]
// Builds per-locale { byMykelId: name } maps from ByMykel/CSGO-API's generated folders.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Upstream folder -> site locale. The only place this mapping lives.
const LOCALES = {
    en: "en", "zh-CN": "zh-CN", "pt-BR": "pt", "es-ES": "es",
    fr: "fr", de: "de", it: "it", nl: "nl", sv: "sv", tr: "tr", ja: "ja", pl: "pl", ko: "ko",
};
const MIN_COVERAGE = 0.9;

const [root, outDir, ...rest] = process.argv.slice(2);
if (!root || !outDir) throw new Error("usage: build_names.mjs <api-root> <out-dir> [--only a,b]");
const only = rest[0] === "--only" ? rest[1].split(",") : Object.keys(LOCALES);

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// every entry of all.json (object keyed by id) and skins.json (array)
const entries = (folder) => [
    ...Object.entries(readJson(join(root, folder, "all.json"))),
    ...readJson(join(root, folder, "skins.json")).map((s) => [s.id, s]),
];

const build = (folder, pick) => {
    const map = {};
    for (const [id, item] of entries(folder)) {
        const name = pick(item);
        if (typeof name === "string" && name) map[id] = name;
    }
    return Object.fromEntries(Object.entries(map).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
};
const write = (file, data) => writeFileSync(file, JSON.stringify(data));

mkdirSync(join(outDir, "names"), { recursive: true });

// Mirrors apps/meta: rawItem.market_hash_name ?? rawItem.name
const en = build("en", (i) => i.market_hash_name ?? i.name);
const enCount = Object.keys(en).length;
write(join(outDir, "names", "en.json"), en);
console.log(`en: ${enCount} ids`);

for (const folder of only) {
    if (folder === "en") continue;
    const map = build(folder, (i) => i.name);
    const count = Object.keys(map).length;
    if (count < enCount * MIN_COVERAGE) {
        throw new Error(`${folder}: ${count} ids is under ${MIN_COVERAGE * 100}% of en (${enCount})`);
    }
    write(join(outDir, "names", `${LOCALES[folder]}.json`), map);
    console.log(`${LOCALES[folder]}: ${count} ids`);
}

// No timestamp: identical output must not trigger a publish.
write(join(outDir, "source.json"), {
    fileTrackerManifestId: process.env.FILE_TRACKER_MANIFEST_ID ?? null,
    upstreamSha: execFileSync("git", ["-C", resolve(root, "../.."), "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
});
