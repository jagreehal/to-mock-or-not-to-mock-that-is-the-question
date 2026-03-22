# Act I: The Config Reader

_Wherein our hero reads a JSON file, and the test doth spy upon its imports._

## The Tragedy

`readConfig` imports `readFile` directly from `node:fs/promises`. The test uses `vi.mock` to replace the module. This couples the test to the import mechanism.

### What breaks when you refactor?

The bad test breaks if you change:

- `import { readFile }` → `import * as fs` (different mock shape needed)
- `import { readFile }` → `import { promises as fs }` (different mock shape needed)
- Switch from `node:fs/promises` to a custom fs wrapper (mock target changes)

None of these refactors change behavior. They all still "read a config file." But the test breaks anyway.

## The Resolution

Inject a `FileReader` dependency. The test provides a simple fake — no `vi.mock` needed. The test is now coupled to the **contract** (read a file, return a string) not the **implementation** (which import path is used).
