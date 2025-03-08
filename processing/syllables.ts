// Call the pojtl service, which calls the KeSi library, to convert input
// syllables into fully formed output syllables.
//
// Using this file: import the inputToKIP, inputToPOJ, toInputKIP, or toInputPOJ maps.

import { load } from "js-yaml";
import { readFileSync } from "node:fs";
import { toKIP, toPOJ, toKIPBulk, toPOJBulk } from "./pojtl.ts";

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

// FIXME: -p, -k, -t, -h only have tone 4 and 8. Should we allow, for example,
// typing kǐp with kip6?
//
// Multiple input forms map to the same output form. That's unchangable
// and fine. But when going from the output form to input form, a reasonable
// choice should be made: for -p, -k, -t, -h no tone is 4, otherwise it's 1.
// (Even though tone 6 sounds the same as tone 1, in writing it is different, so
// the distinction is kept here.)

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
  const inputForm = pojInputForms[i];
  const outputKip = pojInputToKipOutput[i];
  const outputPoj = pojInputToPojOutput[i];
  inputToKIP.set(inputForm, outputKip);
  inputToPOJ.set(inputForm, outputPoj);
  if (inputForm.at(-2)?.match(/[pkth]/)) {
    // reject tone 1 for -p, -k, -t, -h
    if (inputForm.endsWith("1")) continue;
  } else {
    // reject tone 4 for everything else
    if (inputForm.endsWith("4")) continue;
  }
  toInputPOJ.set(outputKip, inputForm);
  toInputPOJ.set(outputPoj, inputForm);
}

const kipInputForms = syllables.kip.flatMap(allTones);
const kipInputToPojOutput = await toPOJBulk(kipInputForms);
const kipInputToKipOutput = await toKIPBulk(kipInputForms);
for (let i = 0; i < kipInputForms.length; i++) {
  const inputForm = kipInputForms[i];
  const outputKip = kipInputToKipOutput[i];
  const outputPoj = kipInputToPojOutput[i];
  inputToKIP.set(inputForm, outputKip);
  inputToPOJ.set(inputForm, outputPoj);
  if (inputForm.at(-2)?.match(/[pkth]/)) {
    // reject tone 1 for -p, -k, -t, -h
    if (inputForm.endsWith("1")) continue;
  } else {
    // reject tone 4 for everything else
    if (inputForm.endsWith("4")) continue;
  }
  toInputKIP.set(outputKip, inputForm);
  toInputKIP.set(outputPoj, inputForm);
}

if (
  inputToKIP.size < 9000 ||
  inputToPOJ.size < 9000 ||
  toInputKIP.size < 9000 ||
  toInputPOJ.size < 9000
) {
  console.log("Something failed, a map is abnormally small!");
  process.exit(1);
}
