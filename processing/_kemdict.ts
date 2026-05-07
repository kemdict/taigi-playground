import { Database } from "bun:sqlite";

// import { Word } from "./word.ts";

const db = new Database("../../kemdict/dicts/entries.db", {
  create: false,
  readonly: true,
});

const hetStmt = db.prepare(
  `select title, props, "from" from heteronyms
where lang = 'nan_TW'
  -- and "from" != 'kisaragi_taigi'
  -- and "from" != 'moedict_twblg'
  -- and "from" != 'chhoetaigi_taijittoasutian'
  -- and "from" != 'chhoetaigi_itaigi'
  -- and "from" != 'chhoetaigi_taioanpehoekichhoogiku'`,
);
const heteronyms = (
  hetStmt.all() as Array<{ title: string; props: string }>
).map(({ title, props, ...etc }) => {
  const parsedProps = JSON.parse(props);
  return {
    title: title,
    lomaji: parsedProps.trs || parsedProps.pronunciation || parsedProps.poj,
    // ChhoeTaigiDatabase already provides these, we can use them to check
    // our version
    pojInput: parsedProps.pojInput,
    kipInput: parsedProps.kipInput,
    // props: parsedProps,
    ...etc,
  };
});

console.log(heteronyms.slice(0, 30));

// For the POJ output, we want:
// - input: kip input form or poj input form
//   - if chhoetaigi's input form is available, check if our conversion is correct
//   - if not , prefer chhoetaigi's version; also fix it
// - output: Hanlo and POJ

// For the KIP output, we want:
// - input: kip input form or poj input form
//   - if chhoetaigi's input form is available, check if our conversion is correct
//   - if not , prefer chhoetaigi's version; also fix it
// - output: Hanlo and KIP

// We should start with individual dictionaries. Available dictionaries are
// written in the SQL statement as a comment right now.

// Afterwards we can go look for word frequencies.
