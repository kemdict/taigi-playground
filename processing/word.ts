/**
 * Similar to KeSi's 詞 class, but this relies on existing mapping results for
 * syllables.
 */

import { interpose } from "./utils.ts";
import { toInputKIP, toInputPOJ } from "./syllables.ts";

function convertAndJoinSyllables(
  syllables: string[],
  map: Map<string, string>,
) {
  const ret: string[] = [];
  for (const syllable of syllables) {
    const retSyllable = map.get(syllable);
    ret.push(retSyllable !== undefined ? retSyllable : syllable);
  }
  return ret.join("");
}

export class Word {
  syllables: string[];
  /** Internally this splits `word` into syllables. */
  constructor(word: string) {
    this.syllables = [];
    for (const segment of interpose("--", word.split("--"))) {
      for (const syllable of interpose("-", segment.split("-"))) {
        this.syllables.push(syllable);
      }
    }
  }
  // WIP: these functions, if we want to implement them, would need more info
  // from KeSi.
  // get kip() {
  //   return convertAndJoinSyllables(this.syllables, inputToKIP);
  // }
  // get poj() {
  //   return convertAndJoinSyllables(this.syllables, inputToPOJ);
  // }
  /**
   * Convert word to KIP input form.
   */
  get inputKip() {
    return convertAndJoinSyllables(this.syllables, toInputKIP);
  }
  /**
   * Convert word to POJ input form.
   */
  get inputPoj() {
    return convertAndJoinSyllables(this.syllables, toInputPOJ);
  }
}

/**
 * Convert `word` to KIP input form.
 *
 * Instead of calling both this function and `wordToInputPoj`, make a `Word`
 * instance instead, since there is syllable splitting work that can be shared
 * across the two operations.
 *
 * Slower: wordToInputKip(word); wordToInputPoj(word)
 * Faster: let wordObj = new Word(word); wordObj.inputKip; wordObj.inputPoj
 */
export function wordToInputKip(word: string) {
  return new Word(word).inputKip;
}
/**
 * Convert `word` to POJ input form.
 *
 * Instead of calling both this function and `wordToInputKip`, make a `Word`
 * instance instead, since there is syllable splitting work that can be shared
 * across the two operations.
 */
export function wordToInputPoj(word: string) {
  return new Word(word).inputPoj;
}
