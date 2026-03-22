import { readFile } from "node:fs/promises";

export async function loadUserName(userId: string) {
  const text = await readFile(`./users/${userId}.json`, "utf8");
  const user = JSON.parse(text);
  return `${user.firstName} ${user.lastName}`;
}
