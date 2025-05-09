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
  return words;
}

function writeDict(path: string, type: "kip" | "poj") {
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

${getWords().map(({ title, pn }) => {
  const kip = toKIP(pn);
  const poj = toPOJ(pn);
  if (type === "kip") {
    return `${title}\t${kip}`;
  } else {
    return `${title}\t${poj}`;
  }
})}

`.trimStart(),
  );
}
