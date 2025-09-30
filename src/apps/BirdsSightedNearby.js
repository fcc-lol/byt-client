import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import styled from "styled-components";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";
import Description from "../components/Description";
import AppDescription from "../components/AppDescription";

const BirdColumns = styled(Columns)`
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 1rem !important;
  flex-direction: unset !important;
`;

const BirdCard = styled(Card)`
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

const BirdTextOverlay = styled.div`
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

const BirdCardWithImage = styled(BirdCard)`
  background-image: ${(props) =>
    props.$imageUrl ? `url(${props.$imageUrl})` : "none"};
`;

const BirdCount = styled(Description)`
  margin: 0;
  font-size: 3rem;
  line-height: 1.25;
`;

const BirdName = styled(Label)`
  margin: 0;
  font-size: 3rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BirdsSightedNearby = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [fccApiKey, setFccApiKey] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFccApiKey(params.get("fccApiKey"));
  }, []);

  const fetchBirdsData = useCallback(async () => {
    if (!fccApiKey) {
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(
        `https://byt-server.fcc.lol/api/birds-sighted-nearby?fccApiKey=${fccApiKey}`
      );
      const birdData = await response.json();

      if (birdData.sightings && birdData.metadata) {
        setData(birdData);
      } else {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      console.error("Error fetching birds data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fccApiKey]);

  useAutoRefresh({
    onRefresh: () => {
      fetchBirdsData();
    }
  });

  // Initial data fetch
  useEffect(() => {
    if (fccApiKey) {
      fetchBirdsData();
    }
  }, [fccApiKey, fetchBirdsData]);

  if (isLoading) {
    return <LoadingCard message="Birds Sighted Nearby" />;
  }

  if (isError) {
    return <ErrorCard message="Birds Sighted Nearby" />;
  }

  if (!data) {
    return <LoadingCard message="Birds Sighted Nearby" />;
  }

  const { sightings, metadata } = data;

  return (
    <>
      <BirdColumns>
        {sightings.map((bird) => (
          <BirdCardWithImage key={bird.code} $imageUrl={bird.imageUrl}>
            <BirdTextOverlay>
              <BirdCount>{bird.count}</BirdCount>
              <BirdName>{bird.commonName}s</BirdName>
            </BirdTextOverlay>
          </BirdCardWithImage>
        ))}
      </BirdColumns>
      <AppDescription>
        {`Birds sighted near ${metadata.locationName} in the last ${metadata.hoursSinceSinceDate} hours`}
      </AppDescription>
    </>
  );
};

export default BirdsSightedNearby;
