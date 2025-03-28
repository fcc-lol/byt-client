import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  faSun,
  faCloud,
  faCloudRain,
  faSnowflake,
  faSmog,
  faCloudBolt,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

import Icon from "../components/Icon";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";
import Value from "../components/Value";
import LoadingCard from "../components/LoadingCard";
const BigIcon = styled(Icon)`
  font-size: 8rem;
  margin: 1rem 0;
  color: rgba(255, 255, 255, 1);

  ${(props) =>
    props.disabled &&
    `
    opacity: 0.25;
  `}
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

  if (weatherIcon <= 5) return faSun;
  if (weatherIcon <= 11) return faCloud;
  if (weatherIcon <= 14) return faCloudRain;
  if (weatherIcon <= 18) return faCloudBolt; // Thunder/Storm conditions
  if (weatherIcon <= 29) return faSnowflake;
  if (weatherIcon <= 32) return faSmog;
  if (weatherIcon <= 34) return faSun; // Clear night
  if (weatherIcon <= 38) return faCloud; // Cloudy night
  if (weatherIcon <= 44) return faCloudBolt; // Storms at night
  return faCloud;
};

export const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = "V1aeZf9wiFjFjuixOJLM8GoZbvUzqpep";
        const LOCATION_KEY = "349727"; // Long Island City

        const response = await fetch(
          `https://dataservice.accuweather.com/currentconditions/v1/${LOCATION_KEY}?apikey=${API_KEY}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.Message || "Weather data not available");
        }

        const [data] = await response.json();
        setWeather(data);
      } catch (err) {
        console.error("Weather error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <LoadingCard message="Current Weather" />;
  }

  if (error) {
    return (
      <Columns>
        <Card>
          <BigIcon icon={faExclamationTriangle} disabled />
        </Card>
      </Columns>
    );
  }

  return (
    weather && (
      <Columns>
        <Card>
          <Value>NYC</Value>
        </Card>
        <Card>
          <BigIcon icon={getWeatherIcon(weather.WeatherIcon)} />
          <Label>{weather.WeatherText}</Label>
        </Card>
        <Card>
          <Value>{Math.round(weather.Temperature.Imperial.Value)}°F</Value>
        </Card>
      </Columns>
    )
  );
};
