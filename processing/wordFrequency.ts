import { parseArgs } from "node:util";
import { existsSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { $ } from "zx";
import { toKIP, toPOJ } from "./lib/pojtl-native";
import { forEachWord } from "./lib/words";

function uniq<T>(arr: Array<T>) {
  return [...new Set(arr)];
}

async function getCount(needle: string, ...directories: string[]) {
  const output = (
    await $({
      nothrow: true,
    })`rg -t txt --count-matches --fixed-strings --no-filename ${needle} ${directories.map((dir) => path.resolve(dir))}`
  )
    .text()
    .trim();
  return [needle, output ? parseInt(output) : 0] as [string, number];
}

async function main() {
  const parsedArgs = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: "boolean", short: "h" },
      dir: { type: "string", short: "d" },
      out: { type: "string", short: "o" },
    },
  });
  if (parsedArgs.values.help) {
    console.log(`Calculate word frequencies.

Options:
  --dir <directories>: specify the corpus directories (separated with comma)
  --out <file>: write result to this file
  --help: show help (this message)`);
    process.exit(0);
  }
  if (!parsedArgs.values.out) {
    console.log(`Output file needs to be specified via --out`);
    process.exit(1);
  }
  if (!parsedArgs.values.dir) {
    console.log(`Corpus directories need to be specified via --dir`);
    process.exit(1);
  }
  const directories = parsedArgs.values.dir.split(",");
  let someDirDoesNotExist;
  for (const dir of directories) {
    if (!existsSync(dir)) {
      console.log(`Specified corpus directory ${dir} does not exist`);
      // show all nonexistant directories, not just the first
      someDirDoesNotExist = true;
    }
  }
  if (someDirDoesNotExist) process.exit(1);

  const words = new Map<string, number>();
  let i = 0;
  // HACK until I get my act together for this
  let len = 0;
  await forEachWord(
    (length) => {
      len = length;
      console.log(`Converting word frequencies (total ${length})...`);
    },
    async ({ title, pn }) => {
      i++;
      if (i % 1000) {
        console.log(
          `Checking word frequencies for ${title}/${pn} (${i}/${len})`,
        );
      }
      const kip = await toKIP(pn);
      const poj = await toPOJ(pn);
      const kipTitle = await toKIP(title);
      const pojTitle = await toPOJ(title);
      let counts = await Promise.all(
        uniq([kip, poj, pn, kipTitle, pojTitle, title]).map((it) =>
          getCount(it, ...directories),
        ),
      );
      let total = 0;
      for (const [_word, count] of counts) total += count;
      for (const [word, _count] of counts) {
        // Use the sum of all variants to associate them together
        words.set(word, total + words.getOrInsert(word, 0));
      }
    },
  );
  writeFileSync(
    parsedArgs.values.out,
    [...words].map(([word, count]) => `${word}\t${count}`).join("\n"),
  );
}

main();
