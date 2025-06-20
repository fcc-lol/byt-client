import styled from "styled-components";

import Card from "./Card";
import Description from "./Description";

const LoadingCardContainer = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
`;

const LoadingCard = ({ message }) => (
  <LoadingCardContainer>
    <Description>Loading{message ? ` ${message}` : ""}...</Description>
  </LoadingCardContainer>
);

export default LoadingCard;
