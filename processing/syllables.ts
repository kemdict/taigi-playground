// Call the pojtl service, which calls the KeSi library, to convert input
// syllables into fully formed output syllables.
//
// Calling this file:
//   cd processing/
//   bun syllables.ts
// Then the syllables.dict.yaml files will be created in the parent folder.

import { load } from "js-yaml";
import { readFileSync } from "node:fs";
import { toKIP, toPOJ, toKIPBulk, toPOJBulk } from "./pojtl.ts";

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

const syllables = load(
  readFileSync("./all-syllables.yml", { encoding: "utf-8" }),
) as { kip: string[]; poj: string[] };

// "Input form" is what the user actually types, with the tone attached as a
// number at the end of the syllable. This naming is inspired by
// ChhoeTaigiDatabase. gua2 is the input form, while guá is its output.
// POJ input form has additional changes: ⁿ is nn, and o͘ is oo, because the
// original characters are not on keyboards.

// Here, the point is that we don't care about whether the key is POJ or KIP,
// which gives us 4 versions:
// - (kipInputForm or pojInputForm) to kip
// - (kipInputForm or pojInputForm) to poj
// - (kip or poj) to kipInputForm
// - (kip or poj) to pojInputForm
/** Map from either input form to KIP */
export const inputToKIP = new Map<string, string>();
/** Map from either input form to POJ */
export const inputToPOJ = new Map<string, string>();
/** Map from either KIP or POJ to KIP input form */
export const toInputKIP = new Map<string, string>();
/** Map from either KIP or POJ to POJ input form */
export const toInputPOJ = new Map<string, string>();

const pojInputForms = syllables.poj
  .flatMap(allTones)
  .map((s) => s.replaceAll("ⁿ", "nn").replaceAll("o͘", "oo"));
const pojInputToPojOutput = await toPOJBulk(pojInputForms);
const pojInputToKipOutput = await toKIPBulk(pojInputForms);
for (let i = 0; i < pojInputForms.length; i++) {
  inputToKIP.set(pojInputForms[i], pojInputToKipOutput[i]);
  inputToPOJ.set(pojInputForms[i], pojInputToPojOutput[i]);
  toInputPOJ.set(pojInputToKipOutput[i], pojInputForms[i]);
  toInputPOJ.set(pojInputToPojOutput[i], pojInputForms[i]);
}

const kipInputForms = syllables.kip.flatMap(allTones);
const kipInputToPojOutput = await toPOJBulk(kipInputForms);
const kipInputToKipOutput = await toKIPBulk(kipInputForms);
for (let i = 0; i < pojInputForms.length; i++) {
  inputToKIP.set(kipInputForms[i], kipInputToKipOutput[i]);
  inputToPOJ.set(kipInputForms[i], kipInputToPojOutput[i]);
  toInputKIP.set(kipInputToKipOutput[i], kipInputForms[i]);
  toInputKIP.set(kipInputToPojOutput[i], kipInputForms[i]);
}
