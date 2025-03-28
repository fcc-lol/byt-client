import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Card from "../components/Card";
import LoadingCard from "../components/LoadingCard";
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

const UselessFacts = () => {
  const [fact, setFact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomFact = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://uselessfacts.jsph.pl/api/v2/facts/random"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch fact");
      }
      const data = await response.json();
      setFact(data);
    } catch (error) {
      console.error("Failed to fetch a random fact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomFact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !fact) {
    return <LoadingCard message="random fact" />;
  }

  return (
    <Card onClick={fetchRandomFact}>
      <CenteredLabel $length={fact.text.length}>{fact.text}</CenteredLabel>
    </Card>
  );
};

export default UselessFacts;
