import styled from "styled-components";
import { useState } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Card from "../components/Card";
import AppDescription from "../components/AppDescription";
import Description from "../components/Description";
import Columns from "../components/Columns";
import Label from "../components/Label";

const PlantColumns = styled(Columns)`
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 1rem !important;
  flex-direction: unset !important;
`;

const PlantCard = styled(Card)`
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  word-wrap: break-word;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 300px;
`;

const PlantTextOverlay = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  color: white;
  text-align: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PlantCardWithImage = styled(PlantCard)`
  background-image: ${(props) =>
    props.$imageUrl ? `url(${props.$imageUrl})` : "none"};
`;

const PlantLabel = styled(Label)`
  margin: 0;
  font-size: 3rem;
  line-height: 1.25;
`;

const BloomingPlants = () => {
  const [plantsData, setPlantsData] = useState(null);
  const [plantImages, setPlantImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchWikipediaImage = async (plantName) => {
    try {
      // First, search for the plant on Wikipedia
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          plantName
        )}`
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.thumbnail && searchData.thumbnail.source) {
          return searchData.thumbnail.source;
        }
      }

      // If no thumbnail, try to get a page image
      const pageResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/media/${encodeURIComponent(
          plantName
        )}`
      );

      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        if (pageData.items && pageData.items.length > 0) {
          const firstImage = pageData.items.find(
            (item) =>
              item.type === "image" && item.original && item.original.source
          );
          if (firstImage) {
            return firstImage.original.source;
          }
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching image for ${plantName}:`, error);
      return null;
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await fetch("https://today-api.fcc.lol/blooming-plants");

      if (!response.ok) {
        throw new Error("Plants data not available");
      }

      const data = await response.json();
      setPlantsData(data);

      // Fetch images for each plant
      const imagePromises = data.plants.map(async (plant) => {
        const imageUrl = await fetchWikipediaImage(plant.name);
        return { plantName: plant.commonName, imageUrl };
      });

      const imageResults = await Promise.all(imagePromises);
      const imageMap = {};
      imageResults.forEach(({ plantName, imageUrl }) => {
        if (imageUrl) {
          imageMap[plantName] = imageUrl;
        }
      });

      setPlantImages(imageMap);
    } catch (err) {
      console.error("Plants error:", err);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: fetchPlants,
    intervalSeconds: 300 // Refresh every 5 minutes
  });

  if (loading) {
    return <LoadingCard message="Blooming Plants" />;
  }

  if (isError) {
    return <ErrorCard message="Blooming Plants" />;
  }

  return (
    plantsData && (
      <>
        <PlantColumns>
          {plantsData.plants.map((plant, index) => (
            <PlantCardWithImage
              key={index}
              $imageUrl={plantImages[plant.commonName]}
            >
              <PlantTextOverlay>
                <PlantLabel>{plant.commonName}</PlantLabel>
                <Description style={{ margin: "0" }}>
                  {plant.location}
                </Description>
              </PlantTextOverlay>
            </PlantCardWithImage>
          ))}
        </PlantColumns>
        <AppDescription>
          Flowers currently in bloom around the world
        </AppDescription>
      </>
    )
  );
};

export default BloomingPlants;
