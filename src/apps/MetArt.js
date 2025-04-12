import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import { useFetchRandomWithRetry } from "../hooks/useFetchRandomWithRetry";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Columns from "../components/Columns";
import Card from "../components/Card";
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
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${(props) => props.theme.borderRadius.large};
  transition: background-color 0.3s ease-in-out;

  &.done-loading {
    background-color: rgba(255, 255, 255, 1);
  }
`;

const ArtImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: ${(props) => props.theme.borderRadius.large};
  background-color: rgba(255, 255, 255, 1);
  padding: 2rem;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.done-loading {
    opacity: 1;
  }
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
  const [isLoadingObjects, setIsLoadingObjects] = useState(true);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const hasSetArtworkRef = useRef(false);

  const { isLoading: isFetching, fetchData: fetchRandomArtwork } =
    useFetchRandomWithRetry({
      range: { min: 0, max: objectIDs ? objectIDs.length - 1 : 0 },
      fetch: async (randomIndex) => {
        if (!objectIDs) throw new Error("Object IDs not loaded yet");
        const objectId = objectIDs[randomIndex];
        const response = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
        );
        return response.json();
      },
      validate: (data) => !!data?.primaryImageSmall,
      onError: () => setIsError(true),
      maxAttempts: 10
    });

  useEffect(() => {
    const fetchObjectsList = async () => {
      try {
        setIsLoadingObjects(true);
        const response = await fetch(
          "https://collectionapi.metmuseum.org/public/collection/v1/objects"
        );
        const data = await response.json();
        setObjectIDs(data.objectIDs);
      } catch (error) {
        console.error("Error fetching objects list:", error);
      } finally {
        setIsLoadingObjects(false);
      }
    };

    fetchObjectsList();
  }, []);

  useEffect(() => {
    if (objectIDs && !hasInitialFetch) {
      // Check for specific object ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const specificObjectId = urlParams.get("objectId");

      if (specificObjectId) {
        fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${specificObjectId}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data?.primaryImageSmall && !hasSetArtworkRef.current) {
              setArtwork(data);
              hasSetArtworkRef.current = true;
              setHasInitialFetch(true);
            }
          })
          .catch((error) => {
            console.error("Error fetching specific artwork:", error);
            setIsError(true);
          });
        return;
      }

      // Handle random artwork fetching
      fetchRandomArtwork().then((result) => {
        if (result.success && !hasSetArtworkRef.current) {
          setArtwork(result.data);
          hasSetArtworkRef.current = true;
          setHasInitialFetch(true);
        }
      });
    }
  }, [objectIDs, hasInitialFetch, fetchRandomArtwork]);

  const handleClick = () => {
    hasSetArtworkRef.current = false;
    setIsImageLoaded(false);
    fetchRandomArtwork().then((result) => {
      if (result.success) {
        setArtwork(result.data);
        hasSetArtworkRef.current = true;
      }
    });
  };

  if (isLoadingObjects || isFetching) {
    return <LoadingCard message="Random Met Art" />;
  }

  if (isError) {
    return <ErrorCard message="Random Met Art" />;
  }

  return (
    artwork && (
      <Columns onClick={handleClick}>
        <ImageContainer className={isImageLoaded ? "done-loading" : ""}>
          <ArtImage
            src={artwork.primaryImageSmall}
            alt={artwork.title}
            className={isImageLoaded ? "done-loading" : ""}
            onLoad={() => setIsImageLoaded(true)}
          />
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
