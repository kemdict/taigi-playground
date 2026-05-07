// Call the pojtl service, which calls the KeSi library, to convert input
// syllables into fully formed output syllables.
//
// Calling this file:
//   cd processing/
//   bun syllables.ts
// Then the syllables.dict.yaml files will be created in the parent folder.

import { writeFileSync } from "node:fs";
import { inputToKIP, inputToPOJ } from "./lib/syllables.ts";

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
# yataigi-${type}.syllables
#
# All possible syllables. I'm not sure RIME can do Emacs IME-style direct
# replacements for the actual input itself.

---
name: yataigi-${type}.syllables
version: "2025-03-08"
sort: by_weight
...

${[...data]
  .sort(([inputA], [inputB]) => (inputA < inputB ? -1 : 1))
  .map(([inputForm, output]) => `${output}\t${inputForm}`)
  .join("\n")}
`.trimStart(),
  );
}

writeDict("../yataigi-kip.syllables.dict.yaml", "kip", inputToKIP);
writeDict("../yataigi-poj.syllables.dict.yaml", "poj", inputToPOJ);
