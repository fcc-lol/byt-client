import styled from "styled-components";
import { useState, useEffect } from "react";

import Card from "../components/Card";
import Description from "../components/Description";
import LoadingCard from "../components/LoadingCard";
import Columns from "../components/Columns";
import Label from "../components/Label";
import Value from "../components/Value";

const BirthdayCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
`;

const Day = styled(Value)`
  line-height: 10rem;
`;

const formatDate = (dateString, format) => {
  if (!dateString) return "???";

  const date = new Date(dateString + "T00:00:00Z"); // Add time component and force UTC
  const options = {
    month: "long",
    day: "numeric",
    timeZone: "UTC" // Use UTC to prevent timezone shifting
  };

  switch (format) {
    case "day":
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        timeZone: "UTC"
      });
    case "month":
      return date.toLocaleDateString("en-US", {
        month: "long",
        timeZone: "UTC"
      });
    default:
      return date.toLocaleDateString("en-US", options);
  }
};

const Birthdays = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);

  const fetchBirthdays = async () => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    setError(null);

    const fccApiKey = new URLSearchParams(window.location.search).get(
      "fccApiKey"
    );

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/api/birthdays?fccApiKey=${fccApiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBirthdays(data || []);

      if (isInitialLoad) {
        setIsInitialLoad(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching birthday data:", error);
      setError("Error fetching birthday data");
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBirthdays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && isInitialLoad) {
    return <LoadingCard message="Upcoming Birthdays" />;
  }

  if (error) {
    return (
      <Card>
        <Description>{error}</Description>
      </Card>
    );
  }

  return (
    <Columns>
      {birthdays.map((person) => (
        <BirthdayCard key={person.name}>
          <Label>{formatDate(person.date, "month")}</Label>
          <Day>{formatDate(person.date, "day")}</Day>
          <Description>{person.name}</Description>
        </BirthdayCard>
      ))}
    </Columns>
  );
};

export default Birthdays;
