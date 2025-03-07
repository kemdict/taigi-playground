// Call the pojtl service, which calls the KeSi library, to convert input
// syllables into fully formed output syllables.
//
// Calling this file:
//   cd processing/
//   bun syllables.ts
// Then the syllables.dict.yaml files will be created in the parent folder.

import { load } from "js-yaml";
import { readFileSync, writeFileSync } from "node:fs";
import { toTL, toPOJ, toTLBulk, toPOJBulk } from "./pojtl.ts";

function uniq<T>(arr: T[]) {
  const set = new Set<T>();
  for (const it of arr) {
    set.add(it);
  }
  return [...set];
}

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
...

${[...data].map(([inputForm, output]) => `${output}\t${inputForm}`).join("\n")}
`.trimStart(),
  );
}

const syllables = load(
  readFileSync("./all-syllables.yml", { encoding: "utf-8" }),
) as { kip: string[]; poj: string[] };
const inputToTL = new Map<string, string>();
const inputToPOJ = new Map<string, string>();
// Allow input in either POJ or TL
// This does make converting from POJ or TL to input form ambiguous. We can
// worry about that later.
// ...maybe we can just allow either? Typing chhoe with tshue might be too
// weird, but typing 揣 with either is definitely fine.
const inputForms = uniq([
  ...syllables.kip.flatMap(allTones),
  ...syllables.poj.flatMap(allTones),
]);
const kip = await toTLBulk(inputForms);
const poj = await toPOJBulk(inputForms);
let i = 0;
for (const inputForm of inputForms) {
  if (kip[i] === undefined || poj[i] === undefined) {
    console.log(`Failed for ${inputForm}!`);
    console.log(`Previous: ${inputForms[i - 1]}, ${kip[i - 1]}, ${poj[i - 1]}`);
    console.log(`This: ${inputForms[i]}, ${kip[i]}, ${poj[i]}`);
    console.log(`Next: ${inputForms[i + 1]}, ${kip[i + 1]}, ${poj[i + 1]}`);
    process.exit(1);
  }
  inputToTL.set(inputForm, kip[i]);
  inputToPOJ.set(inputForm, poj[i]);
  i++;
}

writeDict("../taigi-kip.syllables.dict.yaml", "kip", inputToTL);
writeDict("../taigi-poj.syllables.dict.yaml", "poj", inputToPOJ);
