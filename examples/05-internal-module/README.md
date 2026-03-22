# Act V: The Rogue Module

_Wherein a fellow module is betrayed by its own import path._

## The Tragedy

`createUser` imports `saveUser` from a local `./db` module. The test mocks the entire `./db` module. This means:

- The test is coupled to the existence and import path of `./db`
- Moving `saveUser` to a different file breaks the mock
- The test can't tell you if `saveUser`'s interface changed

## The Resolution

Pass the `saveUser` dependency as a parameter. The test provides a spy. Now the test is coupled to the **function signature**, not the file layout.
