import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Rows from "../components/Rows";
import Card from "../components/Card";
import Label from "../components/Label";
import Description from "../components/Description";

const Sign = styled(Card)`
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  padding: 0 4rem;
  gap: 3rem;
`;

const Index = styled(Description)`
  font-size: 4rem;
  margin-right: 2rem;
`;

const Bullet = styled.div`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background-color: ${(props) => props.color || "#888"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 6rem;
  flex-shrink: 0;
  font-family: "Helvetica", sans-serif;
`;

const Direction = styled(Label)`
  flex-grow: 1;
  text-align: left;
  line-height: 1.25;
`;

const Time = styled(Description)`
  color: rgba(255, 255, 255, 1);
  font-size: 4rem;
  min-width: 18rem;
  text-align: right;
`;

// Map route IDs to colors
const routeColors = {
  G: "#6CBE45", // Green
  E: "#2185D0", // Blue
  F: "#F2711C", // Orange
  A: "#2185D0", // Blue
  C: "#2185D0", // Blue
  B: "#F2711C", // Orange
  D: "#F2711C", // Orange
  N: "#FBBD08", // Yellow
  Q: "#FBBD08", // Yellow
  R: "#FBBD08", // Yellow
  1: "#DB2828", // Red
  2: "#DB2828", // Red
  3: "#DB2828", // Red
  4: "#21BA45", // Green
  5: "#21BA45", // Green
  6: "#21BA45", // Green
  7: "#A333C8", // Purple
  L: "#767676", // Gray
  J: "#A5673F", // Brown
  Z: "#A5673F", // Brown
  M: "#A5673F", // Brown
  W: "#FBBD08", // Yellow
  S: "#767676" // Gray
};

const SubwayArrivals = () => {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    const fetchArrivals = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://subway-arrivals.herokuapp.com/sign/leom"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Filter out the first item which contains configuration
        const arrivalData = data.filter((item, index) => index > 0);

        // Sort arrivals by minutes until arrival
        arrivalData.sort((a, b) => a.minutesUntil - b.minutesUntil);

        setArrivals(arrivalData);
        setError(null);
      } catch (err) {
        console.error("Error fetching subway arrivals:", err);
        setError("Failed to load subway arrivals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArrivals();

    // Set up polling every minute
    const intervalId = setInterval(fetchArrivals, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Rotate through the remaining arrivals every 3 seconds
  useEffect(() => {
    if (arrivals.length <= 1) return;

    // Initialize with index 1 (which will show as position 2)
    setRotatingIndex(1);

    const rotationInterval = setInterval(() => {
      setRotatingIndex((prevIndex) => {
        // Start from index 1 (skip the first arrival) and cycle through the rest
        const nextIndex = prevIndex + 1;
        return nextIndex >= arrivals.length ? 1 : nextIndex;
      });
    }, 3000);

    return () => clearInterval(rotationInterval);
  }, [arrivals.length]);

  // Render the first arrival and the currently rotating arrival
  const renderArrival = (arrival, isNext = false, index = null) => {
    if (!arrival) return null;

    // Calculate the actual position in the sequence
    const position = isNext ? 1 : index + 1;

    return (
      <Sign>
        <Index>{position}</Index>
        <Bullet color={routeColors[arrival.routeId] || "#888"}>
          {arrival.routeId}
        </Bullet>
        <Direction>{arrival.headsign}</Direction>
        <Time>
          {arrival.minutesUntil === 0 ? "now" : `${arrival.minutesUntil} min`}
        </Time>
      </Sign>
    );
  };

  return (
    <Rows>
      {loading && arrivals.length === 0 && (
        <Card>
          <Label>Loading...</Label>
        </Card>
      )}
      {error && (
        <Card>
          <Label>{error}</Label>
        </Card>
      )}
      {arrivals.length > 0 && renderArrival(arrivals[0], true)}
      {arrivals.length > 1 &&
        renderArrival(arrivals[rotatingIndex], false, rotatingIndex)}
    </Rows>
  );
};

export default SubwayArrivals;
