import { toKIP, toKIPBulk, toPOJ, toPOJBulk } from "./pojtl.ts";
import { z } from "zod";
import { Database } from "bun:sqlite";
import { writeFileSync } from "node:fs";

/**
 * Normalize `pn` so that it's searchable with an ASCII keyboard.
 */
function pnToImpreciseInputForm(pn: string) {
  let ret = pn.replaceAll("ⁿ", "nn").replaceAll("-", " ").normalize("NFKD");
  ret = [...ret].filter((c) => c.charCodeAt(0) < 128).join("");
  return ret;
}

function getWords(): Array<{ title: string; pn: string }> {
  const kemdictDir = "../../kemdict/";
  const kemdictDb = kemdictDir + "dicts/entries.db";
  const db = new Database(kemdictDb, {
    readonly: true,
    create: false,
    strict: true,
  });
  const wordsSchema = z.array(
    z.object({
      title: z.string(),
      pn: z.string(),
    }),
  );
  const words = wordsSchema.parse(
    db
      .prepare(
        `
SELECT DISTINCT title, aliases.alias as pn FROM heteronyms
LEFT JOIN aliases ON heteronyms.id = aliases.het_id
WHERE lang = 'nan_TW'
  AND pn != title
  AND aliases.exact = 1
ORDER BY title
`,
      )
      .all(),
  );
  return words
    .filter(
      ({ title, pn }) =>
        !title.startsWith("(") &&
        !title.includes("。") &&
        !pn.startsWith("*") &&
        !pn.startsWith("["),
    )
    .map(({ title, pn }) => ({
      title: title.replaceAll("(泉)", ""),
      pn: pn.replaceAll("(泉)", ""),
    }));
}

async function writeDict(path: string, essayPath: string, type: "kip" | "poj") {
  const rawWords = getWords();
  let lines: string[] = [];
  let essayLines = new Set<string>();
  let i = 0;
  const titles = new Set<string>();
  const pns = new Set<string>();
  for (const { title, pn } of rawWords) {
    let [nPn, nTitle] =
      type === "kip"
        ? await toKIPBulk([pn, title])
        : await toPOJBulk([pn, title]);
    nPn = nPn.toLowerCase();
    const inputForm = pnToImpreciseInputForm(nPn);
    if (!(titles.has(nTitle) && pns.has(nPn))) {
      titles.add(nTitle);
      pns.add(nPn);
      lines.push(`${nTitle}\t${inputForm}`);
      essayLines.add(nTitle);
    }
    if (!(titles.has(nPn) && pns.has(nPn))) {
      titles.add(nPn);
      pns.add(nPn);
      lines.push(`${nPn}\t${inputForm}`);
      essayLines.add(nPn);
    }
    i++;
    if (i % 1000 === 0) {
      console.log(`${new Date().toISOString()}: convert ${i}`);
    }
  }

  writeFileSync(
    path,
    `
# Rime dictionary
# encoding: utf-8
#
# yataigi-${type}.words
#
# Words from dictionaries.

---
name: yataigi-${type}.words
version: "2025-05-09"
sort: by_weight
...

${lines.sort().join("\n")}

`.trimStart(),
  );

  writeFileSync(essayPath, [...essayLines].sort().join("\n"));
}

writeDict("../yataigi-kip.words.dict.yaml", "../essay-taigi.txt", "kip");
