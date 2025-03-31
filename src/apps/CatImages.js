import styled from "styled-components";
import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Card from "../components/Card";

const CatImage = styled.img`
  width: 100%;
  object-fit: contain;
  padding: 0;
`;

const CatImages = () => {
  const [catImage, setCatImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchCatImage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://api.thecatapi.com/v1/images/search"
      );
      const data = await response.json();
      setCatImage(data[0]);
    } catch (error) {
      setIsError(true);
      console.error("Error fetching cat image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: fetchCatImage
  });

  if (isLoading) {
    return <LoadingCard message="Random Cat Image" />;
  }

  if (isError) {
    return <ErrorCard message="Random Cat Image" />;
  }

  return (
    catImage && (
      <Card style={{ padding: "0" }} onClick={fetchCatImage}>
        <CatImage src={catImage.url} />
      </Card>
    )
  );
};

export default CatImages;
