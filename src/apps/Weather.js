import styled from "styled-components";
import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import BigIcon from "../components/BigIcon";

import {
  faSun,
  faCloud,
  faCloudRain,
  faSnowflake,
  faSmog,
  faCloudBolt
} from "@fortawesome/free-solid-svg-icons";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";
import Description from "../components/Description";

const ForecastColumns = styled(Columns)`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  width: 100%;
`;

const ForecastCard = styled(Card)`
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  gap: 0;
  align-items: center;
  justify-content: space-between;
`;

const DayLabel = styled(Label)`
  margin: 0;
`;

const WeatherIcon = styled(BigIcon)`
  font-size: 7rem;
`;

const WeatherDescription = styled(Description)`
  color: rgba(255, 255, 255, 1);
  text-align: center;
  line-height: 1.25;
  min-height: 2.5rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherTemperature = styled(Description)`
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const getWeatherIcon = (weatherCode) => {
  // WMO Weather interpretation codes (WW) - Complete list
  // 0: Clear sky
  // 1: Mainly clear
  // 2: Partly cloudy
  // 3: Overcast
  // 45: Fog
  // 48: Depositing rime fog
  // 51, 53, 55: Drizzle (Light, Moderate, Dense)
  // 56, 57: Freezing Drizzle (Light, Dense)
  // 61, 63, 65: Rain (Slight, Moderate, Heavy)
  // 66, 67: Freezing Rain (Light, Heavy)
  // 71, 73, 75: Snow fall (Slight, Moderate, Heavy)
  // 77: Snow grains
  // 80, 81, 82: Rain showers (Slight, Moderate, Violent)
  // 85, 86: Snow showers (Slight, Heavy)
  // 95: Thunderstorm (Slight or moderate)
  // 96, 99: Thunderstorm with hail (Slight, Heavy)

  // Ensure weatherCode is a valid number
  if (!weatherCode || isNaN(weatherCode)) {
    return faCloud; // Default fallback
  }

  const code = parseInt(weatherCode, 10);

  // Clear sky
  if (code === 0) return faSun;

  // Mainly clear, partly cloudy, overcast
  if (code >= 1 && code <= 3) return faCloud;

  // Fog and depositing rime fog
  if (code === 45 || code === 48) return faSmog;

  // Drizzle (light, moderate, dense)
  if (code === 51 || code === 53 || code === 55) return faCloudRain;

  // Freezing drizzle (light, dense)
  if (code === 56 || code === 57) return faCloudRain;

  // Rain (slight, moderate, heavy)
  if (code === 61 || code === 63 || code === 65) return faCloudRain;

  // Freezing rain (light, heavy)
  if (code === 66 || code === 67) return faCloudRain;

  // Snow fall (slight, moderate, heavy)
  if (code === 71 || code === 73 || code === 75) return faSnowflake;

  // Snow grains
  if (code === 77) return faSnowflake;

  // Rain showers (slight, moderate, violent)
  if (code === 80 || code === 81 || code === 82) return faCloudRain;

  // Snow showers (slight, heavy)
  if (code === 85 || code === 86) return faSnowflake;

  // Thunderstorm (slight or moderate)
  if (code === 95) return faCloudBolt;

  // Thunderstorm with hail (slight, heavy)
  if (code === 96 || code === 99) return faCloudBolt;

  // Default fallback for any unhandled cases
  return faCloud;
};

const formatDate = (dateString) => {
  // Parse the date string and ensure it's treated as local time
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const getWeatherDescription = (weatherCode) => {
  // WMO Weather interpretation codes (WW) descriptions - Complete list
  const code = parseInt(weatherCode, 10);

  // Clear sky
  if (code === 0) return "Clear sky";

  // Mainly clear
  if (code === 1) return "Mainly clear";

  // Partly cloudy
  if (code === 2) return "Partly cloudy";

  // Overcast
  if (code === 3) return "Overcast";

  // Fog
  if (code === 45) return "Fog";

  // Depositing rime fog
  if (code === 48) return "Rime fog";

  // Drizzle (light, moderate, dense)
  if (code === 51) return "Light drizzle";
  if (code === 53) return "Moderate drizzle";
  if (code === 55) return "Dense drizzle";

  // Freezing drizzle (light, dense)
  if (code === 56) return "Light freezing drizzle";
  if (code === 57) return "Dense freezing drizzle";

  // Rain (slight, moderate, heavy)
  if (code === 61) return "Light rain";
  if (code === 63) return "Moderate rain";
  if (code === 65) return "Heavy rain";

  // Freezing rain (light, heavy)
  if (code === 66) return "Light freezing rain";
  if (code === 67) return "Heavy freezing rain";

  // Snow fall (slight, moderate, heavy)
  if (code === 71) return "Light snow";
  if (code === 73) return "Moderate snow";
  if (code === 75) return "Heavy snow";

  // Snow grains
  if (code === 77) return "Snow grains";

  // Rain showers (slight, moderate, violent)
  if (code === 80) return "Light rain showers";
  if (code === 81) return "Moderate rain showers";
  if (code === 82) return "Violent rain showers";

  // Snow showers (slight, heavy)
  if (code === 85) return "Light snow showers";
  if (code === 86) return "Heavy snow showers";

  // Thunderstorm (slight or moderate)
  if (code === 95) return "Thunderstorm";

  // Thunderstorm with hail (slight, heavy)
  if (code === 96) return "Thunderstorm with hail";
  if (code === 99) return "Heavy thunderstorm with hail";

  // Default fallback
  return "Unknown";
};

export const Weather = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=40.748088&longitude=-73.953546&daily=weather_code,temperature_2m_min,temperature_2m_max&timezone=America%2FNew_York&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch"
      );

      if (!response.ok) {
        throw new Error("Weather data not available");
      }

      const data = await response.json();
      setForecast(data);
    } catch (err) {
      console.error("Weather error:", err);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: fetchWeather,
    intervalSeconds: 300
  });

  if (loading) {
    return <LoadingCard message="Weather Forecast" />;
  }

  if (isError) {
    return <ErrorCard message="Weather Forecast" />;
  }

  return (
    forecast && (
      <ForecastColumns>
        {forecast.daily.time.slice(0, 5).map((date, index) => {
          const weatherCode = forecast.daily.weather_code[index];
          const weatherIcon = getWeatherIcon(weatherCode) || faCloud;
          const weatherDescription = getWeatherDescription(weatherCode);
          const maxTemp = forecast.daily.temperature_2m_max[index];

          return (
            <ForecastCard key={index}>
              <DayLabel>{formatDate(date)}</DayLabel>
              <WeatherIcon icon={weatherIcon} />
              <WeatherDescription>{weatherDescription}</WeatherDescription>
              <WeatherTemperature>{Math.round(maxTemp)}°</WeatherTemperature>
            </ForecastCard>
          );
        })}
      </ForecastColumns>
    )
  );
};
