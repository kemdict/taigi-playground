import { si_lomaji } from "../../kesi.ts/src/butkian/kongiong.ts";

/** Convert POJ or KIP `pn` into a form able to be typed on the keyboard. */
export function pnToInputForm(pn: string) {
  const tones = {
    "\u0301": "2",
    "\u0300": "3",
    "\u0302": "5",
    "\u030c": "6",
    "\u0304": "7",
    "\u030d": "8",
    "\u0306": "9",
  } as const;
  type Tones = typeof tones;
  type ToneMark = keyof Tones;
  let chars: string[] = [];
  let currentTone: Tones[ToneMark] | undefined = undefined;
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
      currentTone = tones[char as ToneMark];
      continue;
    }
    if (!si_lomaji(char) && currentTone) {
      // char is not lomaji and there is a pending tone. We have just ended a
      // syllable. Push through the tone, reset it, then push through this character.
      chars.push(currentTone);
      currentTone = undefined;
      chars.push(char);
      continue;
    }

    // Default case: push it through
    chars.push(char);
  }
  // There might still be a pending tone after the last character. Check it, and
  // if so, push it through.
  if (currentTone) {
    chars.push(currentTone);
    currentTone = undefined;
  }
  return chars.join("");
}
