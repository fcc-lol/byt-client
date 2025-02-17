import React, { useState } from "react";
import { HorizontalLayout } from "../SpringBoard";

export const ColorPicker = () => {
  const [color, setColor] = useState("#ff0000");
  return (
    <div>
      <h2>Color Picker</h2>
      <HorizontalLayout>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <p>Selected: {color}</p>
        <div
          style={{
            width: "6.25rem",
            height: "6.25rem",
            background: color,
            borderRadius: "0.5rem",
            border: "0.125rem solid #ccc"
          }}
        />
      </HorizontalLayout>
    </div>
  );
};
