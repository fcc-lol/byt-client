import styled from "styled-components";
import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const IconContainer = styled.div`
  font-size: 5rem;
  color: rgba(255, 255, 255, 1);
  height: 5rem;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherDescription = styled(Description)`
  color: rgba(255, 255, 255, 1);
  text-align: center;
  line-height: 1.25;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherTemperature = styled(Description)`
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const getWeatherIcon = (weatherIcon) => {
  // Add logging to debug null icons
  if (weatherIcon === undefined || weatherIcon === null) {
    console.warn("⚠️ Weather icon value is missing:", weatherIcon);
    return faCloud; // Fallback to cloud icon
  }

  // Convert to number if it's a string
  const iconNum = Number(weatherIcon);

  if (isNaN(iconNum)) {
    console.warn("⚠️ Invalid weather icon value:", weatherIcon);
    return faCloud;
  }

  let result;
  // AccuWeather icon mapping
  if (iconNum <= 5) result = faSun;
  else if (iconNum <= 11) result = faCloud;
  else if (iconNum <= 14) result = faCloudRain;
  else if (iconNum <= 18) result = faCloudBolt; // Thunder/Storm conditions
  else if (iconNum <= 29) result = faSnowflake;
  else if (iconNum <= 32) result = faSmog;
  else if (iconNum <= 34) result = faSun; // Clear night
  else if (iconNum <= 38) result = faCloud; // Cloudy night
  else if (iconNum <= 44) result = faCloudBolt; // Storms at night
  else result = faCloud;

  return result;
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
          if (!day || !day.Day || !day.Night) {
            console.warn("⚠️ Invalid day data:", day);
            return null;
          }

          const dayIcon = getWeatherIcon(day.Day.Icon);

          return (
            <ForecastCard key={index}>
              <Label>{formatDate(day.Date)}</Label>

              <DescriptionContainer>
                <IconContainer>
                  <FontAwesomeIcon icon={dayIcon} />
                </IconContainer>
                <WeatherDescription>{day.Day.IconPhrase}</WeatherDescription>
              </DescriptionContainer>

              <WeatherTemperature>
                {Math.round(day.Temperature?.Maximum?.Value || 0)}°
              </WeatherTemperature>
            </ForecastCard>
          );
        })}
      </ForecastColumns>
    )
  );
};
