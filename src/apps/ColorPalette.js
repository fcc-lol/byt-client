import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Rows from "../components/Rows";
import Columns from "../components/Columns";
import Card from "../components/Card";

const ColorPalette = () => {
  const [, setRandomColor] = useState(null);
  const [colorScheme, setColorScheme] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const generateRandomColor = async () => {
    setIsLoading(true);
    try {
      const letters = "89ABCDEF";
      let color = "";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
      }

      setRandomColor(color);

      const response = await fetch(
        `https://www.thecolorapi.com/scheme?hex=${color}&format=json&count=5&mode=analogic`
      );
      const data = await response.json();
      setColorScheme(data.colors);
    } catch (error) {
      setIsError(true);
      console.error("Error fetching color scheme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: generateRandomColor
  });

  if (isLoading) {
    return <LoadingCard message="Random Color Palette" />;
  }

  if (isError) {
    return <ErrorCard message="Random Color Palette" />;
  }

  return (
    colorScheme && (
      <Rows onClick={generateRandomColor}>
        <Columns>
          {colorScheme.map((color, index) => (
            <Card key={index} style={{ backgroundColor: color.hex.value }} />
          ))}
        </Columns>
      </Rows>
    )
  );
};

export default ColorPalette;
