import styled from "styled-components";
import { useState, useEffect } from "react";

import Card from "../components/Card";
import Label from "../components/Label";

const CatImage = styled.img`
  width: 100%;
  object-fit: contain;
  padding: 0;
`;

const CatImages = () => {
  const [catImage, setCatImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCatImage = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.thecatapi.com/v1/images/search"
      );
      const data = await response.json();
      setCatImage(data[0]);
    } catch (error) {
      console.error("Error fetching cat image:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatImage();
  }, []);

  if (loading) {
    return (
      <Card>
        <Label>Loading...</Label>
      </Card>
    );
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
