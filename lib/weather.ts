export type WeatherSnapshot = {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  conditionLabel: string;
  icon: string;
};

type WeatherCodeMapItem = {
  label: string;
  icon: string;
};

const weatherCodeMap: Record<number, WeatherCodeMapItem> = {
  0: { label: "Clear", icon: "☀️" },
  1: { label: "Mostly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy Drizzle", icon: "🌧️" },
  61: { label: "Light Rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy Rain", icon: "⛈️" },
  80: { label: "Rain Showers", icon: "🌦️" },
  81: { label: "Rain Showers", icon: "🌧️" },
  82: { label: "Strong Showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

const siemReapCoordinates = {
  lat: 13.3671,
  lng: 103.8448,
};

export async function fetchSiemReapWeather(): Promise<WeatherSnapshot> {
  const query = new URLSearchParams({
    latitude: String(siemReapCoordinates.lat),
    longitude: String(siemReapCoordinates.lng),
    current: "temperature_2m,weather_code,wind_speed_10m",
    timezone: "Asia/Bangkok",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`);
  if (!response.ok) {
    throw new Error("Weather request failed.");
  }

  const payload = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
      wind_speed_10m?: number;
    };
  };

  const code = payload.current?.weather_code ?? 0;
  const mapped = weatherCodeMap[code] ?? { label: "Weather", icon: "🌤️" };

  return {
    temperature: payload.current?.temperature_2m ?? 0,
    windSpeed: payload.current?.wind_speed_10m ?? 0,
    weatherCode: code,
    conditionLabel: mapped.label,
    icon: mapped.icon,
  };
}
