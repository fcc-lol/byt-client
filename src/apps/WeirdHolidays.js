import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Card from "../components/Card";
import Label from "../components/Label";
import Description from "../components/Description";

const HolidayContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 2rem;
`;

const HolidayEmoji = styled.div`
  font-size: 6rem;
  margin-bottom: 0.5rem;
`;

const HolidayName = styled(Label)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HolidayDescription = styled(Description)`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WeirdHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://today-api.fcc.lol/weird-holidays");
      const data = await response.json();
      setHolidays(data.holidays || []);
      setIsLoading(false);
      setIsError(false);
    } catch (error) {
      console.error("Error fetching weird holidays:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  // Auto-cycle through holidays every 8 seconds
  useEffect(() => {
    if (holidays.length > 1) {
      const interval = setInterval(() => {
        setCurrentHolidayIndex(
          (prevIndex) => (prevIndex + 1) % holidays.length
        );
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [holidays.length]);

  useAutoRefresh({
    onRefresh: fetchHolidays,
    intervalSeconds: 300 // Refresh data every 5 minutes
  });

  if (isLoading) {
    return <LoadingCard message="Weird Holidays" />;
  }

  if (isError) {
    return <ErrorCard message="Weird Holidays" />;
  }

  if (!holidays.length) {
    return <ErrorCard message="No weird holidays available" />;
  }

  const currentHoliday = holidays[currentHolidayIndex];

  return (
    <Card
      onClick={() =>
        setCurrentHolidayIndex((prevIndex) => (prevIndex + 1) % holidays.length)
      }
    >
      <HolidayContainer>
        <HolidayEmoji>{currentHoliday.emoji}</HolidayEmoji>
        <HolidayName>Today is {currentHoliday.name}</HolidayName>
        <HolidayDescription>{currentHoliday.description}</HolidayDescription>
      </HolidayContainer>
    </Card>
  );
};

export default WeirdHolidays;
