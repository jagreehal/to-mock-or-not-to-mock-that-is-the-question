import { saveUser } from "./db";

export async function createUser(name: string, email: string) {
  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const user = await saveUser({ name, email });
  return user;
}
