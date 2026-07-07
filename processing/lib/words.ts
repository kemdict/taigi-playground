import { z } from "zod";
import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";

function cleanTitle(title: string) {
  return title
    .replaceAll(/\*\*/gv, "")
    .replaceAll(/\(\*[浦泉漳同白文安]?\)/gv, "")
    .replaceAll(/\(漳[，,]XX\)/gv, "")
    .replaceAll(/^(:|##|【俗】)/gv, "");
}

function cleanPn(pn: string) {
  return cleanTitle(pn);
}

function getWords(): Array<{ title: string; pn: string }> {
  const kemdictDir = "../../kemdict/";
  const kemdictDb = kemdictDir + "dicts/entries.db";
  if (!existsSync(kemdictDb)) {
    console.log(`${kemdictDb} not found`);
    process.exit(1);
  }
  console.log("Connecting to local Kemdict database...");
  const db = new Database(kemdictDb, {
    readonly: true,
    create: false,
    strict: true,
  });
  const wordsSchema = z.array(
    z.object({
      title: z.string(),
      pn: z.string(),
    }),
  );
  console.log("Retrieving words...");
  const rawWords = wordsSchema.parse(
    db
      .prepare(
        `
SELECT DISTINCT title, aliases.alias as pn FROM heteronyms
LEFT JOIN aliases ON heteronyms.id = aliases.het_id
WHERE lang = 'nan_TW'
  AND pn != title
  AND aliases.exact = 1
  AND "from" != 'chhoetaigi_itaigi'
ORDER BY title
`,
      )
      .all(),
  );
  const words: typeof rawWords = [];

  for (const { title, pn } of rawWords) {
    if (title.trim() === "") continue;
    if (pn.trim() === "") continue;
    if (title.startsWith("*")) continue;
    if (
      title.startsWith("(") ||
      /。|\.|,/.test(title) ||
      title.startsWith("...") ||
      pn.startsWith("*") ||
      pn.startsWith("[") ||
      pn.startsWith('"') ||
      /\.|,|\?/.test(pn) ||
      /^[0-9]/v.test(pn) ||
      /^\p{Script=Han}/v.test(pn)
    ) {
      continue;
    }
    // Special case: if the title has full width parens and the pn has half
    // width parens, the contents of the parens correspond with each other.
    // For example, 富貴（南河） -> Hù-kuì(Lâm-hô)
    // This is different from the paren mess with Maryknoll
    if (/（.*）/.test(title) && /\(.*\)/.test(pn)) {
      words.push({
        title: cleanTitle(title.replaceAll(/（.*）/g, "")),
        pn: cleanPn(pn.replaceAll(/\(.*\)/g, "")),
      });
      words.push({
        title: cleanTitle(title.match(/（(.*)）/)![1]),
        pn: cleanPn(pn.match(/\((.*)\)/)![1]),
      });
      continue;
    }

    const cleanedTitle = cleanTitle(title);
    const cleanedPn = cleanPn(pn);

    // Just get rid of all the other parens. This is better than giving up Maryknoll...
    if (/\(|\)|（|）/.test(cleanedTitle) || /\(|\)|（|）/.test(cleanedPn)) {
      continue;
    }

    words.push({
      title: cleanedTitle,
      pn: cleanedPn,
    });
  }

  return words;
}

export async function forEachWord(
  before: (length: number) => void,
  body: (word: { title: string; pn: string }) => Promise<void>,
) {
  const rawWords = getWords();
  before(rawWords.length);
  const newlines: [string, string][] = [];
  for (const { title, pn } of rawWords) {
    if (title.includes("\n") || pn.includes("\n")) {
      newlines.push([title, pn]);
    }
  }
  if (newlines.length > 0) {
    console.log("Some entries have newlines! This should not be the case");
    console.log("Entries with newlines:", newlines);
    process.exit(1);
  }
  for (const rawWord of rawWords) {
    await body(rawWord);
  }
}
