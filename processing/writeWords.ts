import { toKIPBulk, toPOJBulk } from "./lib/pojtl-native.ts";

import { forEachWord } from "./lib/words.ts";
import { pnToInputForm, allPojKipRegexp } from "./lib/pnToInputForm.ts";

import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

async function writeDict(path: string, type: "kip" | "poj") {
  let i = 0;
  let lines = new Set<string>();
  let essayLines = new Set<string>();
  const titles = new Set<string>();
  const pns = new Set<string>();
  await forEachWord(
    (length) => {
      console.log(`Converting raw words (total ${length})...`);
    },
    async ({ pn, title }) => {
      // if title is all TL/POJ, then pn should be identical to it.
      // Sometimes this is not the case, so fix it.
      if (title.match(allPojKipRegexp) && pn !== title) {
        pn = title;
      }
      let [nPn, nTitle] =
        type === "kip"
          ? await toKIPBulk([pn, title])
          : await toPOJBulk([pn, title]);
      const inputForm = pnToInputForm(nPn);
      if (!(titles.has(nTitle) && pns.has(nPn))) {
        titles.add(nTitle);
        pns.add(nPn);
        lines.add(`${nTitle}\t${inputForm}`);
        essayLines.add(nTitle);
      }
      if (!(titles.has(nPn) && pns.has(nPn))) {
        titles.add(nPn);
        pns.add(nPn);
        lines.add(`${nPn}\t${inputForm}`);
        essayLines.add(nPn);
      }
      i++;
      if (i % 1000 === 0) {
        console.log(`${new Date().toISOString()}: convert ${i}`);
      }
    },
  );

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
version: "2026-07-08"
sort: by_weight
...

${[...lines]
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
}

async function main() {
  const parsedArgs = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: "boolean", short: "h" },
    },
  });
  if (parsedArgs.values.help) {
    console.log(`writeWords.ts

Write out words from Kemdict for the RIME dict.

Uses kesi.ts to convert words to KIP or POJ.`);
    process.exit(0);
  }
  await Promise.all([
    writeDict("../yataigi-kip.words.dict.yaml", "kip"),
    writeDict("../yataigi-poj.words.dict.yaml", "poj"),
  ]);
}

await main();
