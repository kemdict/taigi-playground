import { parseArgs } from "node:util";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { $ } from "zx";
import { toKIP, toPOJ } from "./lib/pojtl-native";
import { forEachWord } from "./lib/words";

async function getCount(needle: string, dir: string) {
  const output = (
    await $({
      nothrow: true,
    })`rg -t txt --count-matches --no-filename ${needle} ${path.resolve(dir)}`
  )
    .text()
    .trim();
  return output ? parseInt(output) : 0;
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
  --dir <directory>: specify the corpus directory
  --help: show help (this message)`);
    process.exit(0);
  }
  if (!parsedArgs.values.dir) {
    console.log(`Corpus directory needs to be specified via --dir`);
    process.exit(1);
  }
  if (!existsSync(parsedArgs.values.dir)) {
    console.log(`Specified corpus directory does not exist`);
    process.exit(1);
  }
  const dir = parsedArgs.values.dir;
  await forEachWord(
    () => {},
    async ({ title, pn }) => {
      let count = (await getCount(title, dir)) + (await getCount(pn, dir));
      console.log(`${title}\t${count}`);
      console.log(`${pn}\t${count}`);
    },
  );
}

main();
