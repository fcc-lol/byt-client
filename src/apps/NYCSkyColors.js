import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";
import Description from "../components/Description";

const NycSkyColors = () => {
  const [colors, setColors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchSkyColors = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("https://nyc-sky-colors.fcc.lol/api");
      const data = await response.json();

      if (data.colors) {
        setColors(data.colors);
      } else {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      console.error("Error fetching NYC sky colors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: () => {
      fetchSkyColors();
      setCurrentDate(new Date());
    }
  });

  if (isLoading) {
    return <LoadingCard message="NYC Sky Colors" />;
  }

  if (isError) {
    return <ErrorCard message="NYC Sky Colors" />;
  }

  if (!colors) {
    return <LoadingCard message="NYC Sky Colors" />;
  }

  const colorEntries = Object.entries(colors);

  return (
    <>
      <Columns>
        {colorEntries.map(([direction, color]) => (
          <Card key={direction} style={{ backgroundColor: color }}>
            <Label>
              {direction.charAt(0).toUpperCase() + direction.slice(1)}
            </Label>
          </Card>
        ))}
      </Columns>
      <Description style={{ margin: "2.5rem 0 1.5rem 0 " }}>
        NYC Sky colors on{" "}
        {currentDate.toLocaleTimeString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "America/New_York"
        })}
      </Description>
    </>
  );
};

export default NycSkyColors;
