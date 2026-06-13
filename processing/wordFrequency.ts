import { parseArgs } from "node:util";
import { existsSync } from "node:fs";
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
    },
  });
  if (parsedArgs.values.help) {
    console.log(`Calculate word frequencies.

Options:
  --dir <directories>: specify the corpus directories (separated with comma)
  --help: show help (this message)`);
    process.exit(0);
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
  await forEachWord(
    () => {},
    async ({ title, pn }) => {
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
  for (const [word, count] of words) {
    console.log(`${word}\t${count}`);
  }
}

main();
