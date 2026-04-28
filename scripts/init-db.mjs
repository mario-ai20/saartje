import { pathToFileURL } from "node:url";
import { ensureDatabaseInitialized, getConfiguredDatabaseUrl } from "../src/lib/sqlite-schema.mjs";

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const result = ensureDatabaseInitialized(getConfiguredDatabaseUrl());
  console.log(`Database initialized at ${result}`);
}
