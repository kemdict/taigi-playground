// Call the pojtl service, which calls the KeSi library, to convert input
// syllables into fully formed output syllables.
//
// Calling this file:
//   cd processing/
//   bun syllables.ts
// Then the syllables.dict.yaml files will be created in the parent folder.

import { writeFileSync } from "node:fs";
import { inputToKIP, inputToPOJ } from "./syllables.ts";

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

writeDict("../taigi-kip.syllables.dict.yaml", "kip", inputToKIP);
writeDict("../taigi-poj.syllables.dict.yaml", "poj", inputToPOJ);
