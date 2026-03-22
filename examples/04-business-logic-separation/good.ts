export type User = {
  firstName: string;
  lastName: string;
};

export function formatUserName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

export type UserRepo = {
  getUser(userId: string): Promise<User>;
};

export async function loadUserName(userId: string, repo: UserRepo) {
  const user = await repo.getUser(userId);
  return formatUserName(user);
}
