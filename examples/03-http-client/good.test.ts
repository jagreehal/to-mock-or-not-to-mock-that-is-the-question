import { describe, it, expect, vi } from "vitest";
import { getWeather, type WeatherApi } from "./good";

describe("getWeather (good — DI with domain contract)", () => {
  it("returns temperature", async () => {
    const api: WeatherApi = {
      getTemperature: vi.fn().mockResolvedValue(22),
    };

    const temp = await getWeather("London", api);

    expect(temp).toBe(22);
    expect(api.getTemperature).toHaveBeenCalledWith("London");
  });

  it("passes the city name through to the API", async () => {
    const api: WeatherApi = {
      getTemperature: vi.fn().mockResolvedValue(15),
    };

    await getWeather("São Paulo", api);

    expect(api.getTemperature).toHaveBeenCalledWith("São Paulo");
  });
});
