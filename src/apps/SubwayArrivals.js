// Configure at https://subway-sign.danzaharia.com/sign/fccs

import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
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
  border-radius: ${(props) => (props.isExpress ? "0" : "50%")};
  transform: ${(props) => (props.isExpress ? "rotate(45deg)" : "none")};
  background-color: ${(props) => props.color || "#888"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 5.25rem;
  flex-shrink: 0;
  font-family: "Helvetica", sans-serif;
  position: relative;
`;

const RouteText = styled.span`
  transform: ${(props) => (props.isExpress ? "rotate(-45deg)" : "none")};
  font-size: 5.75rem;
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
// Official MTA colors from https://data.ny.gov/Transportation/MTA-Colors/3uhz-sej2
const routeColors = {
  // Blue
  A: "#0039A6",
  C: "#0039A6",
  E: "#0039A6",

  // Orange
  B: "#FF6319",
  D: "#FF6319",
  F: "#FF6319",
  M: "#FF6319",

  // Green
  G: "#6CBE45",

  // Brown
  J: "#996633",
  Z: "#996633",

  // Gray
  L: "#A7A9AC",

  // Dark gray
  S: "#808183",

  // Yellow
  N: "#FCCC0A",
  Q: "#FCCC0A",
  R: "#FCCC0A",
  W: "#FCCC0A",

  // Teal
  T: "#00ADD0",

  // Red
  1: "#EE352E",
  2: "#EE352E",
  3: "#EE352E",

  // Green
  4: "#00933C",
  5: "#00933C",
  6: "#00933C",

  // Purple
  7: "#B933AD"
};

const SubwayArrivals = () => {
  const [arrivals, setArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [shouldRotate, setShouldRotate] = useState(false);
  const [rotationTime, setRotationTime] = useState(3000);

  const fetchArrivals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://subway-sign-backend.danzaharia.com/sign/fccs"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Get configuration from first item
      const config = data[0] || {};
      setShouldRotate(!!config.rotating);
      // Set rotation time if provided, otherwise keep default
      if (config.rotationTime) {
        setRotationTime(config.rotationTime * 1000); // Convert seconds to milliseconds
      }

      // Filter out the first item which contains configuration
      const arrivalData = data.filter((item, index) => index > 0);

      // Sort arrivals by minutes until arrival
      arrivalData.sort((a, b) => a.minutesUntil - b.minutesUntil);

      setArrivals(arrivalData);
    } catch (err) {
      console.error("Error fetching subway arrivals:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: fetchArrivals
  });

  // Rotate through the remaining arrivals using the configured rotation time
  useEffect(() => {
    if (!shouldRotate || arrivals.length <= 1) return;

    // Initialize with index 1 (which will show as position 2)
    setRotatingIndex(1);

    const rotationInterval = setInterval(() => {
      setRotatingIndex((prevIndex) => {
        // Start from index 1 (skip the first arrival) and cycle through the rest
        const nextIndex = prevIndex + 1;
        return nextIndex >= arrivals.length ? 1 : nextIndex;
      });
    }, rotationTime);

    return () => clearInterval(rotationInterval);
  }, [arrivals.length, shouldRotate, rotationTime]);

  // Render the first arrival and the currently rotating arrival
  const renderArrival = (arrival, isNext = false, index = null) => {
    if (!arrival) return null;

    // Calculate the actual position in the sequence
    const position = isNext ? 1 : index + 1;

    // Check if this is an express route (ends with X)
    const isExpress = arrival.routeId.endsWith("X");
    const baseRouteId = isExpress
      ? arrival.routeId.slice(0, -1)
      : arrival.routeId;
    const routeColor = routeColors[baseRouteId] || "#888";

    return (
      <Sign>
        <Index>{position}</Index>
        <Bullet color={routeColor} isExpress={isExpress}>
          <RouteText isExpress={isExpress}>{arrival.routeId}</RouteText>
        </Bullet>
        <Direction>{arrival.headsign}</Direction>
        <Time>
          {arrival.minutesUntil === 0 ? "now" : `${arrival.minutesUntil} min`}
        </Time>
      </Sign>
    );
  };

  if (isLoading) {
    return <LoadingCard message="Next Subway Arrivals" />;
  }

  if (isError) {
    return <ErrorCard message="Next Subway Arrivals" />;
  }

  return (
    arrivals.length > 0 && (
      <Rows>
        {arrivals.length > 0 && renderArrival(arrivals[0], true)}
        {arrivals.length > 1 &&
          !shouldRotate &&
          renderArrival(arrivals[1], false, 1)}
        {arrivals.length > 1 &&
          shouldRotate &&
          renderArrival(arrivals[rotatingIndex], false, rotatingIndex)}
      </Rows>
    )
  );
};

export default SubwayArrivals;
