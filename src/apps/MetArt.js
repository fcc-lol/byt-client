import { useState, useEffect } from "react";
import styled from "styled-components";
import { fetchRandomWithRetry } from "../utils/fetchRandomWithRetry";

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
  const [loading, setLoading] = useState(true);
  const [objectIDs, setObjectIDs] = useState(null);

  const fetchArtwork = async (objectId) => {
    const response = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
    );
    const artworkData = await response.json();
    return artworkData;
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

  const fetchRandomArtwork = async () => {
    setLoading(true);
    setArtwork(null);

    try {
      // Check for specific object ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const specificObjectId = urlParams.get("objectId");

      if (specificObjectId) {
        const artworkData = await fetchArtwork(specificObjectId);
        if (artworkData?.primaryImageSmall) {
          setArtwork(artworkData);
        }
        setLoading(false);
        return;
      }

      // Handle random artwork fetching
      if (!objectIDs) {
        setLoading(false);
        return;
      }

      const result = await fetchRandomWithRetry({
        range: { min: 0, max: objectIDs.length - 1 },
        fetch: async (randomIndex) => {
          const objectId = objectIDs[randomIndex];
          return fetchArtwork(objectId);
        },
        validate: (data) => !!data?.primaryImageSmall,
        failed: (attempt, error) => {
          console.error(`Error fetching artwork (attempt ${attempt}):`, error);
        }
      });

      if (result.success) {
        setArtwork(result.data);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error in fetchRandomArtwork:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
