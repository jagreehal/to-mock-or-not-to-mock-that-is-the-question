export type SaveUserFn = (user: { name: string; email: string }) => Promise<{ id: string }>;

export async function createUser(name: string, email: string, deps: { saveUser: SaveUserFn }) {
  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const user = await deps.saveUser({ name, email });
  return user;
}
