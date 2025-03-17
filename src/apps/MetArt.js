import { useState, useEffect } from "react";
import styled from "styled-components";

import Columns from "../components/Columns";
import Card from "../components/Card";
import Label from "../components/Label";
import {
  DataTable,
  DataRow,
  DataKey,
  DataValue
} from "../components/DataTable";

const ImageContainer = styled.div`
  max-width: 60%;
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
  const MAX_RETRIES = 10;
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [objectIDs, setObjectIDs] = useState(null);

  const fetchArtwork = async (objectId) => {
    try {
      const artworkResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
      );
      const artworkData = await artworkResponse.json();
      return artworkData;
    } catch (error) {
      console.error(`Error fetching artwork ${objectId}:`, error);
      return null;
    }
  };

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
        setLoading(false);
      }
    };

    fetchObjectsList();
  }, []);

  useEffect(() => {
    if (objectIDs) {
      fetchRandomArtwork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectIDs]);

  const fetchRandomArtwork = async (retryCount = 0) => {
    // Reset failed attempts if this is a manual refresh (retryCount === 0)
    if (retryCount === 0) {
      setFailedAttempts(0);
      setArtwork(null);
    }
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const specificObjectId = urlParams.get("objectId");

      if (specificObjectId) {
        const artworkData = await fetchArtwork(specificObjectId);
        if (!artworkData || !artworkData.primaryImageSmall) {
          setArtwork(null);
          setFailedAttempts(MAX_RETRIES);
        } else {
          setArtwork(artworkData);
          setFailedAttempts(0);
        }
        setLoading(false);
        return;
      }

      if (!objectIDs) {
        // We're still waiting for the objects list
        setLoading(false);
        return;
      }

      let currentAttempt = retryCount;
      let foundArtwork = false;

      while (currentAttempt < MAX_RETRIES && !foundArtwork) {
        // Get a random object ID from our stored list and try to fetch artwork
        const randomIndex = Math.floor(Math.random() * objectIDs.length);
        const objectId = objectIDs[randomIndex];

        const artworkData = await fetchArtwork(objectId);

        if (artworkData?.primaryImageSmall) {
          setArtwork(artworkData);
          setFailedAttempts(0);
          foundArtwork = true;
        } else {
          currentAttempt++;
          setFailedAttempts(currentAttempt);
        }
      }

      if (!foundArtwork) {
        setArtwork(null);
        setFailedAttempts(MAX_RETRIES);
      }
    } catch (error) {
      console.error("Error fetching artwork:", error);
      setArtwork(null);
      setFailedAttempts(MAX_RETRIES);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Columns onClick={() => fetchRandomArtwork(0)}>
      {loading ? (
        <Card>
          <Label>Loading...</Label>
        </Card>
      ) : artwork ? (
        <Columns>
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
      ) : failedAttempts >= MAX_RETRIES ? (
        <Card>
          <Label>Failed to load artwork after {failedAttempts} attempts</Label>
        </Card>
      ) : (
        <Card>
          <Label>
            Loading... Attempt {failedAttempts + 1}/{MAX_RETRIES}
          </Label>
        </Card>
      )}
    </Columns>
  );
};

export default MetArt;
