# Act IV: The Tangled Web

_Wherein business logic and file I/O are entwined like lovers in a tragedy._

## The Tragedy

`loadUserName` mixes three responsibilities:

1. **Path construction** — building `./users/${userId}.json`
2. **File IO** — reading the file
3. **Domain logic** — formatting `"${firstName} ${lastName}"`

The test mocks `node:fs/promises` and tests all three together. If any one changes, the test may break.

### What's truly tragic?

The domain logic (`formatUserName`) is pure and trivially testable — but it's **buried** inside IO code. To test name formatting, you need to mock the filesystem. That's backwards.

## The Resolution

Separate the layers:

- **`formatUserName`** — pure function, tested without any mocks
- **`UserRepo`** — interface for fetching users
- **`loadUserName`** — orchestrates the two, tested with a fake repo

Each layer is tested at its own level of abstraction.
