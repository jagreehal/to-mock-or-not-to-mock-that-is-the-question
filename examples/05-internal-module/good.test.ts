import { describe, it, expect, vi } from "vitest";
import { createUser, type SaveUserFn } from "./good";

describe("createUser (good — DI)", () => {
  it("saves and returns the user", async () => {
    const saveUser: SaveUserFn = vi.fn().mockResolvedValue({ id: "abc123" });

    const result = await createUser("Ada", "ada@example.com", { saveUser });

    expect(result).toEqual({ id: "abc123" });
    expect(saveUser).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
    });
  });

  it("throws when name is missing", async () => {
    const saveUser: SaveUserFn = vi.fn();

    await expect(createUser("", "ada@example.com", { saveUser })).rejects.toThrow(
      "Name and email are required",
    );

    expect(saveUser).not.toHaveBeenCalled();
  });
});
