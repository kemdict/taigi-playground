import { load } from "js-yaml";
import { readFileSync, writeFileSync } from "node:fs";
import { toTL, toPOJ } from "./pojtl.ts";
import { forMulti } from "./utils.ts";

/**
 * Take a syllable without a tone, then return versions of it with input tones
 * at the end.
 * allTones("a") -> ["a1", "a2" ... "a9"]
 */
function allTones(plainSyllable: string) {
  if (plainSyllable.match(/[1-9]$/)) {
    return plainSyllable;
  } else {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${plainSyllable}${n}`);
  }
}

function writeDict(
  path: string,
  type: "kip" | "poj",
  data: Map<string, string>,
) {
  writeFileSync(
    path,
    `
# Rime dictionary
# encoding: utf-8
#
# taigi-${type}.syllables
#
# All possible syllables. I'm not sure RIME can do Emacs IME-style direct
# replacements for the actual input itself.

---
name: taigi-${type}.syllables
version: "2025-03-08"
sort: by_weight
---

${[...data].map((inputForm, output) => `${output}\t${inputForm}`).join("\n")}
`.trim(),
  );
}

const syllables = load(
  readFileSync("./all-syllables.yml", { encoding: "utf-8" }),
) as string[];
const inputToTL = new Map<string, string>();
const inputToPOJ = new Map<string, string>();
for (const syllable of syllables) {
  forMulti(allTones(syllable), async (inputForm) => {
    inputToTL.set(inputForm, await toTL(inputForm));
    inputToPOJ.set(inputForm, await toPOJ(inputForm));
  });
}

writeDict("taigi-kip.syllables.dict.yaml", "kip", inputToTL);
writeDict("taigi-poj.syllables.dict.yaml", "poj", inputToPOJ);
