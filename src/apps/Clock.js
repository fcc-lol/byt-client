import styled from "styled-components";
import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

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

  useAutoRefresh({
    onRefresh: () => setTime(new Date()),
    intervalSeconds: 1
  });

  return (
    <Columns>
      <Card>
        <Time>
          {time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
          })}
        </Time>
      </Card>
    </Columns>
  );
};

export default Clock;
