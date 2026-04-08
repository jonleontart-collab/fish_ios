type WeatherPlace = {
  name: string;
  latitude: number;
  longitude: number;
};

export type WeatherSnapshot = {
  temperatureC: number;
  pressureMm: number;
  windKmh: number;
  cloudCover: number;
  biteIndex: number;
  biteLabel: string;
  moonLabel: string;
  condition: string;
  sunrise: string;
  sunset: string;
  isDay: boolean;
  source: "live" | "estimated";
};

function weatherCodeLabel(code: number) {
  if (code === 0) return "Ясно";
  if (code === 1 || code === 2) return "Переменная облачность";
  if (code === 3) return "Плотная облачность";
  if ([45, 48].includes(code)) return "Туман";
  if ([51, 53, 55, 56, 57].includes(code)) return "Морось";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Дождь";
  if ([66, 67].includes(code)) return "Ледяной дождь";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Снег";
  if ([95, 96, 99].includes(code)) return "Гроза";
  return "Стабильная погода";
}

function getMoonLabel(date: Date) {
  const lunarCycleSeconds = 2551443;
  const knownNewMoon = Date.UTC(1970, 0, 7, 20, 35, 0);
  const phase =
    ((((date.getTime() - knownNewMoon) / 1000) % lunarCycleSeconds) + lunarCycleSeconds) %
      lunarCycleSeconds /
    lunarCycleSeconds;

  if (phase < 0.03 || phase > 0.97) return "Новолуние";
  if (phase < 0.22) return "Растущая";
  if (phase < 0.28) return "Первая четверть";
  if (phase < 0.47) return "Растущая";
  if (phase < 0.53) return "Полнолуние";
  if (phase < 0.72) return "Убывающая";
  if (phase < 0.78) return "Последняя четверть";
  return "Убывающая";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function calculateBiteIndex(input: {
  pressureMm: number;
  windKmh: number;
  cloudCover: number;
  weatherCode: number;
  date: Date;
}) {
  let score = 52;

  const pressureDelta = Math.abs(input.pressureMm - 755);
  score += clamp(18 - pressureDelta, -18, 18);

  if (input.windKmh >= 6 && input.windKmh <= 16) {
    score += 10;
  } else if (input.windKmh > 24) {
    score -= 10;
  }

  if (input.cloudCover >= 30 && input.cloudCover <= 78) {
    score += 8;
  } else if (input.cloudCover > 90) {
    score -= 5;
  }

  if ([61, 63, 80, 81].includes(input.weatherCode)) {
    score += 6;
  }

  if ([95, 96, 99].includes(input.weatherCode)) {
    score -= 16;
  }

  const month = input.date.getMonth();
  if ([4, 5, 8, 9].includes(month)) {
    score += 8;
  }

  const biteIndex = clamp(Math.round(score), 18, 95);
  const biteLabel =
    biteIndex >= 80
      ? "Сильный клёв"
      : biteIndex >= 65
        ? "Хорошее окно"
        : biteIndex >= 50
          ? "Рабочие условия"
          : "Осторожный клёв";

  return {
    biteIndex,
    biteLabel,
  };
}

function formatClock(value?: string) {
  if (!value) {
    return "--:--";
  }

  return value.slice(11, 16);
}

function fallbackWeather(place: WeatherPlace): WeatherSnapshot {
  const now = new Date();
  const seed =
    Math.abs(Math.round(place.latitude * 100) + Math.round(place.longitude * 100)) +
    now.getDate() * 37 +
    now.getMonth() * 19;
  const temperatureC = 11 + (seed % 13);
  const pressureMm = 748 + (seed % 12);
  const windKmh = 5 + (seed % 11);
  const cloudCover = 20 + (seed % 65);
  const weatherCode = cloudCover > 70 ? 3 : cloudCover > 45 ? 2 : 1;
  const bite = calculateBiteIndex({
    pressureMm,
    windKmh,
    cloudCover,
    weatherCode,
    date: now,
  });

  return {
    temperatureC,
    pressureMm,
    windKmh,
    cloudCover,
    biteIndex: bite.biteIndex,
    biteLabel: bite.biteLabel,
    moonLabel: getMoonLabel(now),
    condition: weatherCodeLabel(weatherCode),
    sunrise: "05:32",
    sunset: "20:01",
    isDay: true,
    source: "estimated",
  };
}

export async function getPlaceWeather(place: WeatherPlace): Promise<WeatherSnapshot> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(place.latitude));
    url.searchParams.set("longitude", String(place.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,pressure_msl,cloud_cover,wind_speed_10m,is_day,weather_code",
    );
    url.searchParams.set("daily", "sunrise,sunset");
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`Weather request failed for ${place.name}`);
    }

    const data = await response.json();
    const current = data.current;
    const sunrise = data.daily?.sunrise?.[0];
    const sunset = data.daily?.sunset?.[0];

    const temperatureC = Math.round(current.temperature_2m);
    const pressureMm = Math.round(Number(current.pressure_msl) * 0.750062);
    const windKmh = Math.round(Number(current.wind_speed_10m));
    const cloudCover = Math.round(Number(current.cloud_cover));
    const weatherCode = Number(current.weather_code);
    const bite = calculateBiteIndex({
      pressureMm,
      windKmh,
      cloudCover,
      weatherCode,
      date: new Date(),
    });

    return {
      temperatureC,
      pressureMm,
      windKmh,
      cloudCover,
      biteIndex: bite.biteIndex,
      biteLabel: bite.biteLabel,
      moonLabel: getMoonLabel(new Date()),
      condition: weatherCodeLabel(weatherCode),
      sunrise: formatClock(sunrise),
      sunset: formatClock(sunset),
      isDay: Boolean(current.is_day),
      source: "live",
    };
  } catch {
    return fallbackWeather(place);
  }
}
