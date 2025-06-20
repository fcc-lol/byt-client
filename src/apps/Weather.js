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

const getWeatherIcon = (weatherIcon) => {
  // AccuWeather icon mapping
  // 1-5 Sunny/Mostly Sunny
  // 6-11 Cloudy/Mostly Cloudy
  // 12-14 Rain
  // 15 Thunderstorms
  // 16-17 Strong Thunderstorms
  // 18 Rain and Thunder
  // 19-29 Snow/Flurries
  // 30-31 Hot
  // 32 Windy
  // 33-34 Moon/Clear (night)
  // 35-38 Cloudy (night)
  // 39-44 Rain/Storms (night)

  // Ensure weatherIcon is a valid number
  if (!weatherIcon || isNaN(weatherIcon)) {
    return faCloud; // Default fallback
  }

  const iconNum = parseInt(weatherIcon, 10);

  if (iconNum >= 1 && iconNum <= 5) return faSun;
  if (iconNum >= 6 && iconNum <= 11) return faCloud;
  if (iconNum >= 12 && iconNum <= 14) return faCloudRain;
  if (iconNum >= 15 && iconNum <= 18) return faCloudBolt; // Thunder/Storm conditions
  if (iconNum >= 19 && iconNum <= 29) return faSnowflake;
  if (iconNum >= 30 && iconNum <= 32) return faSmog;
  if (iconNum >= 33 && iconNum <= 34) return faSun; // Clear night
  if (iconNum >= 35 && iconNum <= 38) return faCloud; // Cloudy night
  if (iconNum >= 39 && iconNum <= 44) return faCloudBolt; // Storms at night

  // Default fallback for any unhandled cases
  return faCloud;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export const Weather = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchWeather = async () => {
    try {
      const API_KEY = "V1aeZf9wiFjFjuixOJLM8GoZbvUzqpep"; // AccuWeather API key (free tier)
      const LOCATION_KEY = "349727"; // Long Island City

      const response = await fetch(
        `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${LOCATION_KEY}?apikey=${API_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || "Weather data not available");
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
        {forecast.DailyForecasts.map((day, index) => {
          const weatherIcon = getWeatherIcon(day.Day.Icon) || faCloud;

          return (
            <ForecastCard key={index}>
              <DayLabel>{formatDate(day.Date)}</DayLabel>
              <WeatherIcon icon={weatherIcon} />
              <WeatherDescription>{day.Day.IconPhrase}</WeatherDescription>
              <WeatherTemperature>
                {Math.round(day.Temperature.Maximum.Value)}°
              </WeatherTemperature>
            </ForecastCard>
          );
        })}
      </ForecastColumns>
    )
  );
};
