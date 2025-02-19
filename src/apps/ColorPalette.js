import { useState, useEffect } from "react";

import Rows from "../components/Rows";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";

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

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
  };

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
              <Card
                key={index}
                style={{ backgroundColor: `#${color}` }}
                hex={`#${color}`}
                onClick={() => copyToClipboard(`#${color}`)}
              />
            ))}
          </Columns>
          <Card>
            <Label>
              {palette.title} by {palette.userName}
            </Label>
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
