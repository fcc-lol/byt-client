import styled from "styled-components";
import { useState } from "react";
import { useFetchRandomWithRetry } from "../hooks/useFetchRandomWithRetry";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Columns from "../components/Columns";
import Card from "../components/Card";
import Rows from "../components/Rows";
import Description from "../components/Description";

const MinifigCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  height: 100%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.05);
  transition: opacity 0.3s ease-in-out;

  &.done-loading {
    background-color: rgba(255, 255, 255, 1);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.done-loading {
    opacity: 1;
  }
`;

const MinifigName = styled(Description)`
  max-height: 4rem;
  padding: 0;
  font-size: 1.5rem;
  height: 2rem;
  line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const LegoMinifigs = () => {
  const [minifigs, setMinifigs] = useState([]);
  const [isError, setIsError] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  const fccApiKey = new URLSearchParams(window.location.search).get(
    "fccApiKey"
  );

  const { isLoading, fetchData: fetchRandomMinifig } = useFetchRandomWithRetry({
    range: { min: 1, max: 16230 },
    fetch: async (randomId) => {
      const paddedId = randomId.toString().padStart(6, "0");
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/api/rebrickable/minifigs/fig-${paddedId}?fccApiKey=${fccApiKey}`
      );
      const data = await response.json();
      if (data.set_img_url) {
        return data;
      }
    },
    onError: () => setIsError(true)
  });

  const fetchFiveRandomMinifigs = async () => {
    setLoadedImages({});
    const newMinifigs = [];
    const usedIds = new Set();

    while (newMinifigs.length < 5) {
      const result = await fetchRandomMinifig();
      if (result.success && !usedIds.has(result.data.set_num)) {
        usedIds.add(result.data.set_num);
        newMinifigs.push(result.data);
      }
    }
    setMinifigs(newMinifigs);
  };

  useAutoRefresh({
    onRefresh: fetchFiveRandomMinifigs
  });

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  if (isLoading) {
    return <LoadingCard message="LEGO Minifigures" />;
  }

  if (isError) {
    return <ErrorCard message="LEGO Minifigures" />;
  }

  return (
    <Columns onClick={fetchFiveRandomMinifigs}>
      {minifigs.map((minifig, index) => (
        <Rows key={index} style={{ gap: "0.75rem" }}>
          <MinifigCard
            key={index}
            className={loadedImages[index] ? "done-loading" : ""}
          >
            <Image
              src={minifig.set_img_url}
              alt={minifig.name}
              className={loadedImages[index] ? "done-loading" : ""}
              onLoad={() => handleImageLoad(index)}
            />
          </MinifigCard>
          <MinifigName>{minifig.name}</MinifigName>
        </Rows>
      ))}
    </Columns>
  );
};

export default LegoMinifigs;
