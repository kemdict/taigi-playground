import { Database } from "bun:sqlite";

const db = new Database("../../kemdict/dicts/entries.db", {
  create: false,
  readonly: true,
});

const hetStmt = db.prepare(
  "select title, props from heteronyms where lang = 'nan_TW' limit 5",
);
console.log(hetStmt.all());
