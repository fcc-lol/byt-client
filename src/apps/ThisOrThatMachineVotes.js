import styled from "styled-components";
import { useState } from "react";
import { useFetchRandomWithRetry } from "../hooks/useFetchRandomWithRetry";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Value from "../components/Value";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  position: relative;
  gap: 0;
`;

const ImageContainer = styled.div`
  width: 448px;
  min-width: 448px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  overflow: hidden;

  ${(props) =>
    props.side === "left" &&
    `
      border-top-left-radius: ${props.theme.borderRadius.large};
      border-bottom-left-radius: ${props.theme.borderRadius.large};
  `}

  ${(props) =>
    props.side === "right" &&
    `
      border-top-right-radius: ${props.theme.borderRadius.large};
      border-bottom-right-radius: ${props.theme.borderRadius.large};
  `}

  ${(props) =>
    props.percentage === 0 &&
    `
      border-radius: ${props.theme.borderRadius.large}!important;
  `}

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

const ProgressBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  gap: 2rem;
`;

const ProgressBar = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: width 0.3s ease;
  position: relative;
  width: ${(props) => props.percentage}%;
  background-color: rgba(255, 255, 255, 0.05);
  transition: background-color 0.3s ease-in-out;

  * {
    opacity: 0;
  }

  &.done-loading {
    background-color: rgba(255, 255, 255, 0.1);

    * {
      opacity: 1;
    }
  }

  ${(props) =>
    props.$majority &&
    `
      &.done-loading {
        background-color: rgba(255, 255, 255, 1);

        * {
          opacity: 1;
        }
      }
  `}

  ${(props) =>
    props.side === "left" &&
    `
      border-top-right-radius: ${props.theme.borderRadius.large};
      border-bottom-right-radius: ${props.theme.borderRadius.large};
  `}

  ${(props) =>
    props.side === "right" &&
    `
      border-top-left-radius: ${props.theme.borderRadius.large};
      border-bottom-left-radius: ${props.theme.borderRadius.large};
  `}

  ${(props) =>
    props.percentage === 0 &&
    `
      border-radius: ${props.theme.borderRadius.large}!important;
  `}
`;

const Percentage = styled(Value)`
  font-size: 4.5rem;
  color: rgba(255, 255, 255, 1);
  transition: opacity 0.3s ease-in-out;

  ${(props) =>
    props.$majority &&
    `
      color: rgba(0, 0, 0, 1);
  `}

  ${(props) =>
    props.percentage <= 20 &&
    `
      font-size: 2rem;
  `}
`;

const ThisOrThat = () => {
  const [pair, setPair] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  const fccApiKey = new URLSearchParams(window.location.search).get(
    "fccApiKey"
  );

  const validatePair = (data) => {
    return (
      data &&
      data.options &&
      Array.isArray(data.options) &&
      data.options.length >= 2 &&
      data.options[0] &&
      data.options[1] &&
      data.options[0].url &&
      data.options[1].url
    );
  };

  const { isLoading, fetchData: fetchRandomPair } = useFetchRandomWithRetry({
    range: { min: 1, max: 1000 },
    fetch: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/api/this-or-that/random-pair?fccApiKey=${fccApiKey}`
      );
      const data = await response.json();
      if (data) {
        return data;
      }
    },
    validate: validatePair,
    onError: () => setIsError(true),
    maxAttempts: fccApiKey ? 10 : 0
  });

  const fetchNewPair = async () => {
    setLoadedImages({});
    setPair(null);
    setIsError(false);

    const result = await fetchRandomPair();
    if (result.success) {
      setPair(result.data);
    }
  };

  useAutoRefresh({
    onRefresh: fetchNewPair
  });

  // Check if API key is provided
  if (!fccApiKey) {
    return <ErrorCard type="api-key" />;
  }

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  const calculatePercentages = () => {
    if (!pair || !pair.options || pair.options.length < 2)
      return { left: 50, right: 50 };
    const totalVotes = pair.options.reduce(
      (sum, option) => sum + option.votes,
      0
    );
    if (totalVotes === 0) return { left: 50, right: 50 };

    const leftPercentage = Math.round(
      (pair.options[0].votes / totalVotes) * 100
    );
    return {
      left: leftPercentage,
      right: 100 - leftPercentage
    };
  };

  if (isLoading) {
    return <LoadingCard message="This or That Machine Votes" />;
  }

  if (isError) {
    return <ErrorCard message="This or That Machine Votes" />;
  }

  if (!pair) {
    return null;
  }

  const percentages = calculatePercentages();

  return (
    <Container onClick={fetchNewPair}>
      <ImageContainer side="left" percentage={percentages.left}>
        {pair.options && pair.options[0] ? (
          <Image
            src={pair.options[0].url}
            alt={pair.options[0].value}
            className={loadedImages[0] ? "done-loading" : ""}
            onLoad={() => handleImageLoad(0)}
          />
        ) : (
          <div>No image available</div>
        )}
      </ImageContainer>
      <ProgressBarContainer>
        <ProgressBar
          side="left"
          percentage={percentages.left}
          $majority={
            percentages.left > percentages.right ||
            percentages.left === percentages.right
          }
          className={loadedImages[0] ? "done-loading" : ""}
        >
          <Percentage
            percentage={percentages.left}
            $majority={
              percentages.left > percentages.right ||
              percentages.left === percentages.right
            }
          >
            {percentages.left !== 0 && `${percentages.left}%`}
          </Percentage>
        </ProgressBar>
        <ProgressBar
          side="right"
          percentage={percentages.right}
          $majority={
            percentages.right > percentages.left ||
            percentages.right === percentages.left
          }
          className={loadedImages[1] ? "done-loading" : ""}
        >
          <Percentage
            percentage={percentages.right}
            $majority={
              percentages.right > percentages.left ||
              percentages.right === percentages.left
            }
          >
            {percentages.right !== 0 && `${percentages.right}%`}
          </Percentage>
        </ProgressBar>
      </ProgressBarContainer>
      <ImageContainer side="right" percentage={percentages.right}>
        {pair.options && pair.options[1] ? (
          <Image
            src={pair.options[1].url}
            alt={pair.options[1].value}
            className={loadedImages[1] ? "done-loading" : ""}
            onLoad={() => handleImageLoad(1)}
          />
        ) : (
          <div>No image available</div>
        )}
      </ImageContainer>
    </Container>
  );
};

export default ThisOrThat;
