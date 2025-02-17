import React, { useState, useEffect } from "react";
import { HorizontalLayout } from "../SpringBoard";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faCloud,
  faCloudRain,
  faSnowflake,
  faSmog,
  faLocationDot,
  faSpinner,
  faCloudBolt
} from "@fortawesome/free-solid-svg-icons";

const WeatherContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const WeatherIcon = styled(FontAwesomeIcon)`
  font-size: 4rem;
  margin: 1rem 0;
  color: #4a90e2;
`;

const Temperature = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const Description = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
  text-transform: capitalize;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: #888;
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
        console.log("Weather data:", data);
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
    return (
      <WeatherContainer>
        <WeatherIcon icon={faSpinner} spin />
        <Description>Loading weather data...</Description>
      </WeatherContainer>
    );
  }

  if (error) {
    return (
      <WeatherContainer>
        <Description>Error fetching weather: {error}</Description>
      </WeatherContainer>
    );
  }

  if (!weather) return null;

  return (
    <WeatherContainer>
      <h2>Weather</h2>
      <HorizontalLayout>
        <div>
          <WeatherIcon icon={getWeatherIcon(weather.WeatherIcon)} />
          <Temperature>
            {Math.round(weather.Temperature.Imperial.Value)}°F
          </Temperature>
          <Description>{weather.WeatherText}</Description>
          <Location>
            <FontAwesomeIcon icon={faLocationDot} />
            New York, US
          </Location>
        </div>
      </HorizontalLayout>
    </WeatherContainer>
  );
};
