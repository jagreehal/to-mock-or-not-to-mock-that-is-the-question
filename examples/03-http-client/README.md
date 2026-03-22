# Act III: The Weather Oracle

_Wherein the weather is fetched from afar, and the mock doth pretend to be the sky._

## The Tragedy

`getWeather` imports `axios` directly. The test mocks the entire `axios` module. This couples the test to the HTTP library choice.

### The devastating refactor

Someone switches from `axios` to `fetch`. The behavior is identical — same URL, same response shape. But the test **explodes** because it was mocking `axios`, not `fetch`.

This is the textbook example of "testing implementation details."

## The Resolution

Inject a `WeatherApi` interface. The test provides a fake that returns a temperature. Now you can switch between axios, fetch, or a cache layer without touching the test.
