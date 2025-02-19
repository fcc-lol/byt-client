import styled from "styled-components";
import { useState, useEffect } from "react";

import Columns from "../components/Columns";
import Card from "../components/Card";

const Time = styled.div`
  font-size: 13rem;
  color: rgba(255, 255, 255, 1);
  margin-bottom: 1rem;
  font-family: "Space Mono", monospace;
  font-weight: 600;
`;

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Columns>
      <Card>
        <Time>{time.toLocaleTimeString()}</Time>
      </Card>
    </Columns>
  );
};

export default Clock;
