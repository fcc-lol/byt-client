import styled from "styled-components";

import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import Card from "./Card";
import Description from "./Description";
import BigIcon from "./BigIcon";

const ErrorCardContainer = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
`;

const ErrorCard = ({ message, type }) => (
  <ErrorCardContainer>
    <BigIcon icon={faExclamationTriangle} disabled />
    {type === "api-key" ? (
      <Description>No API key provided</Description>
    ) : (
      <Description>Error loading{message ? ` ${message}` : ""}</Description>
    )}
  </ErrorCardContainer>
);

export default ErrorCard;
