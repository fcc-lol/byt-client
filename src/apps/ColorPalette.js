import { useState, useEffect } from "react";

import Rows from "../components/Rows";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";

const ColorPalette = () => {
  const [, setRandomColor] = useState(null);
  const [colorScheme, setColorScheme] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRandomColor = async () => {
    setLoading(true);
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
      console.error("Error fetching color scheme:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRandomColor();
  }, []);

  return (
    <Columns>
      {loading ? (
        <Card>
          <Label>Loading...</Label>
        </Card>
      ) : (
        colorScheme && (
          <Rows>
            <Columns>
              {colorScheme.map((color, index) => (
                <Card
                  key={index}
                  style={{ backgroundColor: color.hex.value }}
                />
              ))}
            </Columns>
          </Rows>
        )
      )}
    </Columns>
  );
};

export default ColorPalette;
