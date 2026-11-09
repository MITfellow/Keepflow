import { rm } from "node:fs/promises";

import { storePath } from "./constants";

export default async function globalSetup() {
  await rm(storePath, { force: true });
  await rm(`${storePath}.tmp`, { force: true });
}
