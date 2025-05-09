import { toKIP, toPOJ } from "./pojtl";
import { z } from "zod";
import { Database } from "bun:sqlite";
import { writeFileSync } from "node:fs";

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
LIMIT 100
`,
      )
      .all(),
  );
  return words.filter(
    ({ title }) => !title.startsWith("(") && !title.includes("。"),
  );
}

async function writeDict(path: string, type: "kip" | "poj") {
  const rawWords = getWords();
  let lines: string[] = [];
  let i = 0;
  for (const { title, pn } of rawWords) {
    if (type === "kip") {
      const kip = await toKIP(pn);
      lines.push(`${title}\t${kip}`);
      i++;
      console.log(`convert ${i}`);
    } else {
      const poj = await toPOJ(pn);
      lines.push(`${title}\t${poj}`);
      i++;
      console.log(`convert ${i}`);
    }
  }

  writeFileSync(
    path,
    `
# Rime dictionary
# encoding: utf-8
#
# taigi-${type}.words
#
# Words from dictionaries.

---
name: taigi-${type}.words
version: "2025-05-09"
sort: by_weight
...

${lines.join("\n")}

`.trimStart(),
  );
}

writeDict("../taigi-kip.words.dict.yaml", "kip");
