// Simulates an internal DB module
export async function saveUser(user: { name: string; email: string }): Promise<{ id: string }> {
  // In real code this would hit a database
  throw new Error("Not implemented — this is just for demonstration");
}
