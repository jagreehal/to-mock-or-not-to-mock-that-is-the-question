# To Mock, or Not to Mock: That Is the Question

![LEGO figure in Shakespearean pose holding a skull; speech bubble: “To Mock or Not to Mock: That Is the Question”](to-mock-or-not-to-mock-that-is-the-question.jpg)

There's an ongoing debate in the JavaScript testing world: **should you use `vi.mock` to fake modules, or should you restructure your code so module mocks are rarely needed?**

This post walks through concrete before/after examples using Vitest. Every example in this post is backed by runnable tests in the repo. Clone it and run `pnpm test` to see them pass.

The short version: **`vi.mock` tends to couple tests to module wiring. DI tends to couple tests to the contract your code actually depends on.**

---

## What is `vi.mock`?

When you write this:

```ts
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));
```

you're telling Vitest: "When any code imports `node:fs/promises`, give it my fake version instead."

This is a **module resolution mock**. It intercepts the runtime's import system and swaps in a replacement. The code under test never knows the difference.

The alternative is **dependency injection (DI)**: instead of secretly replacing imports, you pass the dependency in as a parameter. The function declares what it needs, and the caller provides it.

---

## Example 1: Reading a file

### Before: `vi.mock` the filesystem

**Production code** imports `readFile` directly:

```ts
// bad.ts
import { readFile } from "node:fs/promises";

export async function readConfig(path: string) {
  const text = await readFile(path, "utf8");
  return JSON.parse(text);
}
```

**Test** replaces the entire `node:fs/promises` module:

```ts
// bad.test.ts
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";
import { readConfig } from "./bad";

it("parses JSON from disk", async () => {
  vi.mocked(readFile).mockResolvedValue('{"port": 3000}');

  const config = await readConfig("/tmp/config.json");

  expect(config).toEqual({ port: 3000 });
});
```

**The problem:** This test is coupled to the module boundary. Refactor how the dependency is imported, where it lives, or how the call is routed, and you may need to rewrite the test even though the behavior stayed the same.

### After: inject the dependency

**Production code** declares what it needs:

```ts
// good.ts
export type FileReader = {
  readFile(path: string, encoding: string): Promise<string>;
};

export async function readConfig(path: string, deps: FileReader) {
  const text = await deps.readFile(path, "utf8");
  return JSON.parse(text);
}
```

**Test** provides a fake:

```ts
// good.test.ts
import { readConfig, type FileReader } from "./good";

it("parses JSON from disk", async () => {
  const fakeFs: FileReader = {
    readFile: vi.fn().mockResolvedValue('{"port": 3000}'),
  };

  const config = await readConfig("/tmp/config.json", fakeFs);

  expect(config).toEqual({ port: 3000 });
});
```

No `vi.mock`. No import hoisting. No dependence on module paths. The test verifies that `readConfig` asks for file contents and parses JSON. It doesn't care where the reader came from.

---

## Example 2: Writing a file

### Before: mock `writeFile`

```ts
// bad.ts
import { writeFile } from "node:fs/promises";

export async function saveReport(name: string, contents: string) {
  await writeFile(`./reports/${name}.txt`, contents, "utf8");
}
```

```ts
// bad.test.ts
vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}));

import { writeFile } from "node:fs/promises";
import { saveReport } from "./bad";

it("writes the report to disk", async () => {
  await saveReport("daily", "done");

  expect(writeFile).toHaveBeenCalledWith("./reports/daily.txt", "done", "utf8");
});
```

Same issue. Switch to `createWriteStream`, upload to S3, or move the persistence behind another module boundary. The test breaks.

### After: inject a store

```ts
// good.ts
export type ReportStore = {
  save(path: string, contents: string): Promise<void>;
};

export async function saveReport(name: string, contents: string, store: ReportStore) {
  await store.save(`./reports/${name}.txt`, contents);
}
```

```ts
// good.test.ts
import { saveReport, type ReportStore } from "./good";

it("sends the report to the store", async () => {
  const store: ReportStore = {
    save: vi.fn().mockResolvedValue(undefined),
  };

  await saveReport("daily", "done", store);

  expect(store.save).toHaveBeenCalledWith("./reports/daily.txt", "done");
});
```

Tomorrow you swap local disk for cloud storage. This test still passes because it tests the contract, not the wiring.

---

## Example 3: HTTP client

### Before: coupled to the library

```ts
// In a real codebase:
import axios from "axios";

export async function getWeather(city: string) {
  const res = await axios.get(`/weather?city=${encodeURIComponent(city)}`);
  return res.data.temperature;
}
```

```ts
// Test would use:
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
```

Refactor from axios to `fetch`? The behavior stays the same, but the test needs rewriting.

### After: inject a domain contract

The key insight: don't inject a library-shaped dependency. Inject a **domain-shaped** one.

```ts
// good.ts
export type WeatherApi = {
  getTemperature(city: string): Promise<number>;
};

export async function getWeather(city: string, api: WeatherApi) {
  return api.getTemperature(city);
}
```

```ts
// good.test.ts
import { getWeather, type WeatherApi } from "./good";

it("returns temperature", async () => {
  const api: WeatherApi = {
    getTemperature: vi.fn().mockResolvedValue(22),
  };

  const temp = await getWeather("London", api);

  expect(temp).toBe(22);
  expect(api.getTemperature).toHaveBeenCalledWith("London");
});
```

Notice the interface isn't shaped like axios (`get`, `data.temperature`). It's shaped like what the code actually needs: "give me a temperature for a city." The URL construction, HTTP method, and response parsing all live in the real implementation of `WeatherApi`, not in the function under test.

Switch between axios, fetch, or anything else. The test doesn't care, because it never knew in the first place.

---

## Example 4: Separating business logic from IO

This is the deeper issue. Module mocks don't just couple tests to imports. They let you avoid separating concerns. When domain logic is tangled with IO, you need a mock just to test a string format.

### Before: everything mixed together

```ts
// bad.ts
import { readFile } from "node:fs/promises";

export async function loadUserName(userId: string) {
  const text = await readFile(`./users/${userId}.json`, "utf8");
  const user = JSON.parse(text);
  return `${user.firstName} ${user.lastName}`;
}
```

```ts
// bad.test.ts
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";
import { loadUserName } from "./bad";

it("returns full name", async () => {
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({ firstName: "Ada", lastName: "Lovelace" }),
  );

  await expect(loadUserName("123")).resolves.toBe("Ada Lovelace");
});
```

Three responsibilities in one function: path construction, file IO, and name formatting. To test just the formatting, you have to mock the filesystem.

### After: separate the layers

```ts
// good.ts
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
```

Now you have two things to test, and each test is focused:

```ts
// Pure logic: no mocks at all
describe("formatUserName", () => {
  it("formats full name", () => {
    expect(formatUserName({ firstName: "Ada", lastName: "Lovelace" }))
      .toBe("Ada Lovelace");
  });
});

// Orchestration: fake the repo, not the module system
describe("loadUserName", () => {
  it("loads from repo and formats name", async () => {
    const repo: UserRepo = {
      getUser: vi.fn().mockResolvedValue({
        firstName: "Ada",
        lastName: "Lovelace",
      }),
    };

    await expect(loadUserName("123", repo)).resolves.toBe("Ada Lovelace");
  });
});
```

The domain logic is testable with zero mocks. The orchestration test fakes a simple interface, not a module.

---

## Example 5: Internal modules

It's not just `node:fs`. Mocking your own modules has the same problem.

### Before: mock by import path

```ts
// bad.ts
import { saveUser } from "./db";

export async function createUser(name: string, email: string) {
  if (!name || !email) {
    throw new Error("Name and email are required");
  }
  return await saveUser({ name, email });
}
```

```ts
// bad.test.ts
vi.mock("./db", () => ({
  saveUser: vi.fn(),
}));

import { saveUser } from "./db";
import { createUser } from "./bad";

it("saves and returns the user", async () => {
  vi.mocked(saveUser).mockResolvedValue({ id: "abc123" });

  const result = await createUser("Ada", "ada@example.com");

  expect(result).toEqual({ id: "abc123" });
});
```

Move `saveUser` to `./persistence.ts`? The mock breaks. Rename the export? The mock breaks. The test is coupled to your file structure.

### After: pass it in

```ts
// good.ts
export type SaveUserFn = (user: { name: string; email: string }) => Promise<{ id: string }>;

export async function createUser(name: string, email: string, deps: { saveUser: SaveUserFn }) {
  if (!name || !email) {
    throw new Error("Name and email are required");
  }
  return await deps.saveUser({ name, email });
}
```

```ts
// good.test.ts
import { createUser, type SaveUserFn } from "./good";

it("saves and returns the user", async () => {
  const saveUser: SaveUserFn = vi.fn().mockResolvedValue({ id: "abc123" });

  const result = await createUser("Ada", "ada@example.com", { saveUser });

  expect(result).toEqual({ id: "abc123" });
});

it("throws when name is missing", async () => {
  const saveUser: SaveUserFn = vi.fn();

  await expect(createUser("", "ada@example.com", { saveUser }))
    .rejects.toThrow("Name and email are required");

  expect(saveUser).not.toHaveBeenCalled();
});
```

Rename files, reorganize modules, move to a monorepo. The test keeps working because it's coupled to the function signature, not the file tree.

---

## Example 6: When `vi.mock` is actually fine

DI is the default, not the only option. There are cases where `vi.mock` is the pragmatic choice.

**Feature flags** are a good example. A feature flag SDK typically configures itself at import time with API keys and global state. Threading a parameter through every call site that checks a flag would be noisy for little benefit.

```ts
// checkout.ts
import { isEnabled } from "./featureFlags";

export function getCheckoutUrl() {
  if (isEnabled("new-checkout-flow")) {
    return "/checkout/v2";
  }
  return "/checkout/v1";
}
```

### Approach 1: `vi.mock` (acceptable)

```ts
describe("getCheckoutUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns v2 when flag is enabled", async () => {
    vi.doMock("./featureFlags", () => ({
      isEnabled: (flag: string) => flag === "new-checkout-flow",
    }));

    const { getCheckoutUrl } = await import("./checkout");
    expect(getCheckoutUrl()).toBe("/checkout/v2");
  });
});
```

### Approach 2: Test hook (preferred when you own the code)

```ts
// featureFlags.ts exports a test helper:
export function _setFlags(flags: Record<string, boolean>) {
  _flags = flags;
}
```

```ts
import { getCheckoutUrl } from "./checkout";
import { _setFlags } from "./featureFlags";

describe("getCheckoutUrl", () => {
  beforeEach(() => {
    _setFlags({});
  });

  it("returns v2 when flag is enabled", () => {
    _setFlags({ "new-checkout-flow": true });

    expect(getCheckoutUrl()).toBe("/checkout/v2");
  });
});
```

Both work. The test hook is simpler when you own the code. `vi.mock` is reasonable when you don't.

A test hook is still a tradeoff: you're exposing mutable state for tests. But for simple in-process globals you own, it's less brittle than intercepting module resolution.

### Use `vi.mock` sparingly for

- Legacy code you can't refactor yet
- Third-party SDKs with global config and side effects
- Singletons where threading a parameter would be painful

---

## The pattern

Every "before" example has the same shape:

1. Function imports a module directly
2. Test uses `vi.mock` to replace that module
3. Test is coupled to the import path, export shape, and module wiring

Every "after" example follows the same fix:

1. Function declares what it needs as a parameter (a type or interface)
2. Test passes a fake implementation of that interface
3. Test is coupled to behavior, not wiring

The production code wires the real dependency at the app boundary: the entry point, the route handler, the composition root. The function itself doesn't know or care where its dependencies come from.

---

## Run it yourself

```bash
git clone <repo-url>
cd to-mock-or-not
pnpm install
pnpm test
```

All 21 tests pass. Read the code in `examples/`. Each folder has the before, after, and tests side by side.

---

## The rule of thumb

> Don't fake what your code imports. Pass in what your code needs.

If your test uses `vi.mock("node:fs/promises")`, it's probably asserting on wiring. If your test passes in a `FileReader`, it's asserting on a contract. Contracts usually survive refactors better than wiring.
