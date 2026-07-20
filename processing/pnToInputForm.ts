import { pnToInputForm } from "./lib/pnToInputForm.ts";
import { parseArgs } from "node:util";

function main() {
  const parsedArgs = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
    },
  });
  if (parsedArgs.values.help) {
    console.log(`pnToInputForm.ts <pn>

Convert the string PN to input form (with numbered tones).`);
    process.exit(0);
  }
  const pn = parsedArgs.positionals[0];
  if (!pn) {
    process.exit(1);
  }
  console.log(pnToInputForm(pn));
}

main();
