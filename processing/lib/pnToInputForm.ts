import { si_lomaji } from "@kemdict/kesi";

const tones = {
  "\u0301": "2",
  "\u0300": "3",
  "\u0302": "5",
  "\u030c": "6",
  "\u0304": "7",
  "\u030d": "8",
  "\u0306": "9",
} as const;

/** Regexp to test if a string is entirely made up of poj/kip. */
export const allPojKipRegexp = new RegExp(
  `^[${Object.keys(tones).join("")}ⁿᴺ\\p{Ll}\\p{Lu}\\p{Mn}]+$`,
  "v",
);

/** Convert POJ or KIP `pn` into a form able to be typed on the keyboard. */
export function pnToInputForm(pn: string) {
  let chars: string[] = [];
  let previousChar: string | undefined = undefined;
  let currentTone: // prettier-ignore
  "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | undefined = undefined;
  for (const char of pn
    .replaceAll("ⁿ", "nn")
    .replaceAll("o͘", "oo")
    .replaceAll("-", " ")
    // This would turn "hó--ah" into "ho2 ah". Is this correct?
    // Ithuan did not have words with "--", and it used spaces.
    // ChhoeTaigi database's input form uses dashes.
    // In this case (for RIME) I think we need spaces.
    .replaceAll(/ +/g, " ")
    .trim()
    .normalize("NFKD")) {
    if (char in tones) {
      // We have seen a tone character. Log it and continue
      // (There is not supposed to be multiple in a syllable)
      currentTone = tones[char as keyof typeof tones];
    } else if (!si_lomaji(char)) {
      // char is not lomaji. We have just ended a syllable.
      // Push the tone out, reset it, then push through this character.
      // If there is no tone: the tone is neutral (4 or 1).
      // If there is no tone and also no previous character: there's an invalid
      // syllable. Just, uh, push the character out and move on.
      if (
        !currentTone &&
        previousChar &&
        // if the previous character is not lomaji, it's not valid, but it's
        // useful to not add a 1 to the end of it, so avoid doing so.
        si_lomaji(previousChar)
      ) {
        currentTone = /[ptkh]/.test(previousChar) ? "4" : "1";
      }
      if (currentTone) {
        chars.push(currentTone);
        currentTone = undefined;
      }
      chars.push(char);
    } else {
      // Default case: push it through
      chars.push(char);
    }

    previousChar = char;
  }
  // There might still be a pending tone after the last character. Check it, and
  // if so, push it through.
  if (currentTone) {
    chars.push(currentTone);
    currentTone = undefined;
  } else if (previousChar) {
    // or we might have ended with a neutral tone.
    chars.push(/[ptkh]/.test(previousChar) ? "4" : "1");
  }
  return chars.join("");
}
