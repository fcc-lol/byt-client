import styled from "styled-components";

export const DataTable = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: "Space Mono", monospace;
  text-transform: uppercase;
  padding: 2rem;
`;

export const DataRow = styled.div`
  display: flex;
  width: 100%;
  gap: 1rem;
`;

export const DataKey = styled.div`
  font-size: 2rem;
  width: 10rem;
  flex-shrink: 0;
  text-align: left;
  color: rgba(255, 255, 255, 0.5);
`;

export const DataValue = styled.div`
  font-size: 2rem;
  flex: 1;
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
`;
