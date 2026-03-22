export type WeatherResponse = {
  data: {
    temperature: number;
  };
};

export type AxiosLike = {
  get(url: string): Promise<WeatherResponse>;
};

/**
 * BAD approach: import axios directly and mock it in tests.
 *
 * We simulate this by having a module-level client that tests
 * would need to mock via vi.mock.
 *
 * In a real codebase this would be:
 *   import axios from "axios";
 *   export async function getWeather(city: string) {
 *     const res = await axios.get(`/weather?city=${city}`);
 *     return res.data.temperature;
 *   }
 *
 * The test would use:
 *   vi.mock("axios", () => ({ default: { get: vi.fn() } }));
 *
 * This couples the test to the fact that axios is used.
 * Switch to fetch and the test breaks even though behavior is identical.
 */

// For demonstration, we simulate the bad pattern with a module-level default:
let _client: AxiosLike | null = null;

export function _setClient(client: AxiosLike) {
  _client = client;
}

export async function getWeather(city: string) {
  if (!_client) throw new Error("Client not initialized");
  const res = await _client.get(`/weather?city=${encodeURIComponent(city)}`);
  return res.data.temperature;
}
