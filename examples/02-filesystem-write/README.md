# Act II: The Report Scribe

_Wherein a report is penned to disk, and the mock doth intercept the quill._

## The Tragedy

`saveReport` imports `writeFile` directly. The test mocks the entire `node:fs/promises` module to verify the call. This test checks **how** the code writes, not **that** it writes.

### What breaks when you refactor?

- Switch to `fs.createWriteStream` for large files? Mock breaks.
- Switch to a cloud storage SDK? Mock breaks entirely.
- Change import style? Mock shape changes.

## The Resolution

Inject a `ReportStore` interface. The test provides a spy. The test asserts that the function sends data to the store with the correct path — the store's implementation is irrelevant.
