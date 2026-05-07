import { toKIP, toKIPBulk, toPOJ, toPOJBulk } from "./lib/pojtl.ts";
import {
  toKIPBulk as toKIPBulkNative,
  toPOJBulk as toPOJBulkNative,
} from "./lib/pojtl-native.ts";

const ipc = process.env["IPC"];
console.log(`Using pojtl-api: ${!!ipc}`);

import { pnToInputForm } from "./lib/pnToInputForm.ts";

import { z } from "zod";
import { Database } from "bun:sqlite";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function cleanTitle(title: string) {
  return title
    .replaceAll(/\*\*/gv, "")
    .replaceAll(/\(([浦泉漳同白文安]|XX)?\)/gv, "")
    .replaceAll(/^(:|##|【俗】)/gv, "");
}

function cleanPn(pn: string) {
  return cleanTitle(pn);
}

function getWords(): Array<{ title: string; pn: string }> {
  const kemdictDir = "../../kemdict/";
  const kemdictDb = kemdictDir + "dicts/entries.db";
  if (!existsSync(kemdictDb)) {
    console.log(`${kemdictDb} not found`);
    process.exit(1);
  }
  console.log("Connecting to local Kemdict database...");
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
  console.log("Retrieving words...");
  const rawWords = wordsSchema.parse(
    db
      .prepare(
        `
SELECT DISTINCT title, aliases.alias as pn FROM heteronyms
LEFT JOIN aliases ON heteronyms.id = aliases.het_id
WHERE lang = 'nan_TW'
  AND pn != title
  AND aliases.exact = 1
  AND "from" != 'chhoetaigi_itaigi'
ORDER BY title
`,
      )
      .all(),
  );
  const words: typeof rawWords = [];

  for (const { title, pn } of rawWords) {
    if (title.trim() === "") continue;
    if (pn.trim() === "") continue;
    if (
      title.startsWith("(") ||
      /。|\.|,/.test(title) ||
      title.startsWith("...") ||
      pn.startsWith("*") ||
      pn.startsWith("[") ||
      pn.startsWith('"') ||
      /\.|,|\?/.test(pn) ||
      /^[0-9]/v.test(pn) ||
      /^\p{Script=Han}/v.test(pn)
    ) {
      continue;
    }
    // Special case: if the title has full width parens and the pn has half
    // width parens, the contents of the parens correspond with each other.
    // For example, 富貴（南河） -> Hù-kuì(Lâm-hô)
    // This is different from the paren mess with Maryknoll
    if (/（.*）/.test(title) && /\(.*\)/.test(pn)) {
      words.push({
        title: cleanTitle(title.replaceAll(/（.*）/g, "")),
        pn: cleanPn(pn.replaceAll(/\(.*\)/g, "")),
      });
      words.push({
        title: cleanTitle(title.match(/（(.*)）/)![1]),
        pn: cleanPn(pn.match(/\((.*)\)/)![1]),
      });
      continue;
    }

    // Just get rid of all the other parens. This is better than giving up Maryknoll...
    if (/\(|\)|（|）/.test(title) || /\(|\)|（|）/.test(pn)) {
      continue;
    }

    words.push({
      title: cleanTitle(title),
      pn: cleanPn(pn),
    });
  }

  return words;
}

async function writeDict(path: string, essayPath: string, type: "kip" | "poj") {
  const rawWords = getWords();
  let lines: string[] = [];
  let essayLines = new Set<string>();
  let i = 0;
  const titles = new Set<string>();
  const pns = new Set<string>();
  console.log(`Converting raw words (total ${rawWords.length})...`);
  const newlines: [string, string][] = [];
  for (const { title, pn } of rawWords) {
    if (title.includes("\n") || pn.includes("\n")) {
      newlines.push([title, pn]);
    }
  }
  if (newlines.length > 0) {
    console.log("Some entries have newlines! This should not be the case");
    console.log("Entries with newlines:", newlines);
    process.exit(1);
  }
  for (const { title, pn } of rawWords) {
    if (title.startsWith("-")) continue;
    let [nPn, nTitle] =
      type === "kip"
        ? await (ipc ? toKIPBulk : toKIPBulkNative)([pn, title])
        : await (ipc ? toPOJBulk : toPOJBulkNative)([pn, title]);
    const inputForm = pnToInputForm(nPn);
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

  console.log(`Writing ${type} words dict to ${resolve(path)}...`);
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

${lines
  .sort((a, b) => {
    // sort by pn
    const re = /[^\t]*\t/;
    const aPn = a.replace(re, "");
    const bPn = b.replace(re, "");
    // pn includes paren -> sort to end
    if (/\(|\)/.test(aPn)) return 1;
    if (/\(|\)/.test(bPn)) return -1;
    return aPn < bPn ? -1 : 1;
  })
  .join("\n")}

`.trimStart(),
  );

  writeFileSync(essayPath, [...essayLines].sort().join("\n"));
}

if (ipc) {
  writeDict(
    "../yataigi-kip-ipc.words.dict.yaml",
    "../essay-taigi-ipc.txt",
    "kip",
  );
} else {
  writeDict("../yataigi-kip.words.dict.yaml", "../essay-taigi.txt", "kip");
}
// writeDict("../yataigi-poj.words.dict.yaml", "../essay-taigi.txt", "poj");
