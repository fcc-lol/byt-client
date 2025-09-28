import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Card from "../components/Card";
import Label from "../components/Label";
import Description from "../components/Description";

const EventContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 2rem;
`;

const EventYear = styled(Description)`
  font-size: 4rem;
  margin-top: -1rem;
`;

const EventTitle = styled(Label)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EventDescription = styled(Description)`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HistoricalEvents = () => {
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://today-api.fcc.lol/historical-events"
      );
      const data = await response.json();
      setEvents(data.events || []);
      setIsLoading(false);
      setIsError(false);
    } catch (error) {
      console.error("Error fetching historical events:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  // Auto-cycle through events every 8 seconds
  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [events.length]);

  useAutoRefresh({
    onRefresh: fetchEvents,
    intervalSeconds: 300 // Refresh data every 5 minutes
  });

  if (isLoading) {
    return <LoadingCard message="Historical Events" />;
  }

  if (isError) {
    return <ErrorCard message="Historical Events" />;
  }

  if (!events.length) {
    return <ErrorCard message="No historical events available" />;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <Card
      onClick={() =>
        setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length)
      }
    >
      <EventContainer>
        <EventYear>Today in {currentEvent.year}</EventYear>
        <EventTitle>{currentEvent.title}</EventTitle>
        <EventDescription>{currentEvent.description}</EventDescription>
      </EventContainer>
    </Card>
  );
};

export default HistoricalEvents;
