import React, { useState } from "react";
import { HorizontalLayout } from "../SpringBoard";

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2>Counter App</h2>
      <HorizontalLayout>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </HorizontalLayout>
    </div>
  );
};
