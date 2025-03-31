import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetchRandomWithRetry } from "../hooks/useFetchRandomWithRetry";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import Columns from "../components/Columns";
import Card from "../components/Card";
import LoadingCard from "../components/LoadingCard";
import {
  DataTable,
  DataRow,
  DataKey,
  DataValue
} from "../components/DataTable";

const ImageContainer = styled.div`
  width: 40%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: ${(props) => props.theme.borderRadius.large};
`;

const ArtImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: ${(props) => props.theme.borderRadius.large};
  background-color: rgba(255, 255, 255, 1);
  padding: 2rem;
`;

const InfoContainer = styled(Card)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  height: 100%;
  overflow-y: auto;
`;

const MetArt = () => {
  const [artwork, setArtwork] = useState(null);
  const [objectIDs, setObjectIDs] = useState(null);
  const { isLoading: isFetching, fetchData: fetchRandomArtwork } =
    useFetchRandomWithRetry({
      range: { min: 0, max: objectIDs ? objectIDs.length - 1 : 0 },
      fetch: async (randomIndex) => {
        const objectId = objectIDs[randomIndex];
        const response = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
        );
        return response.json();
      },
      validate: (data) => !!data?.primaryImageSmall
    });

  useEffect(() => {
    const fetchObjectsList = async () => {
      try {
        const response = await fetch(
          "https://collectionapi.metmuseum.org/public/collection/v1/objects"
        );
        const data = await response.json();
        setObjectIDs(data.objectIDs);
      } catch (error) {
        console.error("Error fetching objects list:", error);
      }
    };

    fetchObjectsList();
  }, []);

  useEffect(() => {
    if (objectIDs) {
      // Check for specific object ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const specificObjectId = urlParams.get("objectId");

      if (specificObjectId) {
        fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${specificObjectId}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data?.primaryImageSmall) {
              setArtwork(data);
            }
          })
          .catch((error) =>
            console.error("Error fetching specific artwork:", error)
          );
        return;
      }

      // Handle random artwork fetching
      fetchRandomArtwork().then((result) => {
        if (result.success) {
          setArtwork(result.data);
        }
      });
    }
  }, [objectIDs, fetchRandomArtwork]);

  useAutoRefresh({
    onRefresh: fetchRandomArtwork
  });

  if (isFetching) {
    return <LoadingCard message="Random Met Art" />;
  }

  return (
    artwork && (
      <Columns onClick={fetchRandomArtwork}>
        <ImageContainer>
          <ArtImage src={artwork.primaryImageSmall} alt={artwork.title} />
        </ImageContainer>
        <InfoContainer>
          <DataTable>
            {artwork.title && (
              <DataRow>
                <DataKey>Title</DataKey>
                <DataValue>{artwork.title}</DataValue>
              </DataRow>
            )}
            {artwork.artistDisplayName && (
              <DataRow>
                <DataKey>Artist</DataKey>
                <DataValue>{artwork.artistDisplayName}</DataValue>
              </DataRow>
            )}
            {artwork.objectDate && (
              <DataRow>
                <DataKey>Date</DataKey>
                <DataValue>{artwork.objectDate}</DataValue>
              </DataRow>
            )}
            {artwork.medium && (
              <DataRow>
                <DataKey>Medium</DataKey>
                <DataValue>{artwork.medium}</DataValue>
              </DataRow>
            )}
            {artwork.region && (
              <DataRow>
                <DataKey>Region</DataKey>
                <DataValue>{artwork.region}</DataValue>
              </DataRow>
            )}
            {artwork.culture && (
              <DataRow>
                <DataKey>Culture</DataKey>
                <DataValue>{artwork.culture}</DataValue>
              </DataRow>
            )}
          </DataTable>
        </InfoContainer>
      </Columns>
    )
  );
};

export default MetArt;
