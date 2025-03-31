import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Card from "../components/Card";
import Columns from "../components/Columns";
import Description from "../components/Description";
import {
  DataTable,
  DataRow,
  DataValue,
  DataKey
} from "../components/DataTable";

const FlightsCard = styled(Card)`
  width: 50%;
  gap: 1rem;
  justify-content: space-between;
  padding-bottom: 2rem;
`;

const FlightDataTable = styled(DataTable)`
  padding: 0 2rem;
`;

const FlightDataRow = styled(DataRow)`
  display: grid;
  grid-template-columns: 1fr 2.25fr 1fr;
`;

const FlightNumber = styled(DataKey)``;

const City = styled(DataValue)`
  font-weight: bold;
`;

const Time = styled(DataValue)`
  text-align: right;
`;

const formatRelativeTime = (scheduledTime) => {
  if (!scheduledTime) return "???";

  const scheduled = new Date(scheduledTime);
  const options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York"
  };

  return scheduled.toLocaleTimeString("en-US", options);
};

const FlightArrivals = () => {
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isError, setIsError] = useState(false);
  const [, setTime] = useState(Date.now());

  useEffect(() => {
    // Update the time every minute to keep relative times current
    const interval = setInterval(() => setTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchFlights = async () => {
    if (isInitialLoad) {
      setIsLoading(true);
    }

    const fccApiKey = new URLSearchParams(window.location.search).get(
      "fccApiKey"
    );

    try {
      // Fetch both arrivals and departures in parallel
      const [arrivalsResponse, departuresResponse] = await Promise.all([
        fetch(
          `${process.env.REACT_APP_SERVER_API_URL}/api/flights/arrivals?fccApiKey=${fccApiKey}`
        ),
        fetch(
          `${process.env.REACT_APP_SERVER_API_URL}/api/flights/departures?fccApiKey=${fccApiKey}`
        )
      ]);

      if (!arrivalsResponse.ok || !departuresResponse.ok) {
        throw new Error(
          `HTTP error! status: ${
            arrivalsResponse.status || departuresResponse.status
          }`
        );
      }

      const [arrivalsData, departuresData] = await Promise.all([
        arrivalsResponse.json(),
        departuresResponse.json()
      ]);

      setArrivals(arrivalsData.arrivals || []);
      setDepartures(departuresData.departures || []);
      if (isInitialLoad) {
        setIsInitialLoad(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching flight data:", error);
      setIsError(true);
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useAutoRefresh({
    onRefresh: fetchFlights,
    intervalSeconds: 60
  });

  if (isLoading && isInitialLoad) {
    return <LoadingCard message="JFK Flights" />;
  }

  if (isError) {
    return <ErrorCard message="JFK Flights" />;
  }

  return (
    <Columns>
      <FlightsCard>
        <Description>ARRIVALS</Description>
        {arrivals.slice(0, 5).map((flight) => (
          <FlightDataTable key={flight.fa_flight_id}>
            <FlightDataRow>
              <FlightNumber>{flight.ident}</FlightNumber>
              <City>{flight.origin?.city || "?????????"}</City>
              <Time>{formatRelativeTime(flight.actual_on)}</Time>
            </FlightDataRow>
          </FlightDataTable>
        ))}
      </FlightsCard>
      <FlightsCard>
        <Description>DEPARTURES</Description>
        {departures.slice(0, 5).map((flight) => (
          <FlightDataTable key={flight.fa_flight_id}>
            <FlightDataRow>
              <FlightNumber>{flight.ident}</FlightNumber>
              <City>{flight.destination?.city || "?????????"}</City>
              <Time>{formatRelativeTime(flight.actual_off)}</Time>
            </FlightDataRow>
          </FlightDataTable>
        ))}
      </FlightsCard>
    </Columns>
  );
};

export default FlightArrivals;
