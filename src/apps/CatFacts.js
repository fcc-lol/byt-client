import styled from "styled-components";
import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Card from "../components/Card";
import Label from "../components/Label";

const CenteredLabel = styled(Label)`
  font-weight: 400;
  text-align: center;
  padding: 0 5rem;
  font-size: ${(props) => {
    const length = props.$length || 0;
    if (length < 50) return "5rem";
    if (length < 80) return "4.5rem";
    if (length < 100) return "4rem";
    return "3.5rem";
  }};
  line-height: 150%;
`;

const CatFacts = () => {
  const [fact, setFact] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchNewFact = async (retryCount = 0) => {
    const MAX_RETRIES = 10;
    const MAX_LENGTH = 130;

    if (retryCount >= MAX_RETRIES) {
      setFact("Sorry, couldn't find a shorter cat fact. Try again later!");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://meowfacts.herokuapp.com/");
      const data = await response.json();
      const newFact = data.data[0];

      if (newFact.length > MAX_LENGTH) {
        // If fact is too long, try fetching again
        await fetchNewFact(retryCount + 1);
      } else {
        setFact(newFact);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching cat fact:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: fetchNewFact
  });

  if (isLoading) {
    return <LoadingCard message="Random Cat Fact" />;
  }

  if (isError) {
    return <ErrorCard message="Random Cat Fact" />;
  }

  return (
    fact && (
      <Card onClick={fetchNewFact}>
        <CenteredLabel $length={fact.length}>{fact}</CenteredLabel>
      </Card>
    )
  );
};

export default CatFacts;
