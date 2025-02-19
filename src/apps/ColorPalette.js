import { useState, useEffect } from "react";

import Rows from "../components/Rows";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";
import Description from "../components/Description";

const ColorPalette = () => {
  const [palette, setPalette] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPalette = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://www.colourlovers.com/api/palettes/random?format=json&_=${timestamp}`
        )}`
      );
      const data = await response.json();
      const [randomPalette] = JSON.parse(data.contents);
      setPalette(randomPalette);
    } catch (error) {
      console.error("Error fetching palette:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPalette();
  }, []);

  return (
    <Columns>
      {loading ? (
        <Card>
          <Label>Loading...</Label>
        </Card>
      ) : palette ? (
        <Rows onClick={fetchPalette}>
          <Columns>
            {palette.colors.map((color, index) => (
              <Card key={index} style={{ backgroundColor: `#${color}` }} />
            ))}
          </Columns>
          <Card>
            <Description>
              {palette.title} by {palette.userName}
            </Description>
          </Card>
        </Rows>
      ) : (
        <Card>
          <Label>Failed to load palette</Label>
        </Card>
      )}
    </Columns>
  );
};

export default ColorPalette;
