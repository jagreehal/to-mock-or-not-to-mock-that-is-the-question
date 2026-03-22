import { writeFile } from "node:fs/promises";

export async function saveReport(name: string, contents: string) {
  await writeFile(`./reports/${name}.txt`, contents, "utf8");
}
