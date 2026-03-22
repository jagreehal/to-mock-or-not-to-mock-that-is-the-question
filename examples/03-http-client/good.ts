export type WeatherApi = {
  getTemperature(city: string): Promise<number>;
};

export async function getWeather(city: string, api: WeatherApi) {
  return api.getTemperature(city);
}
