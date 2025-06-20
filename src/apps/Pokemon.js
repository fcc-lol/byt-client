import styled from "styled-components";
import { useState } from "react";
import { useFetchRandomWithRetry } from "../hooks/useFetchRandomWithRetry";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
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
  max-width: 60vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: ${(props) => props.theme.borderRadius.large};
  min-width: 30rem;
  transition: background-color 0.3s ease-in-out;

  &.done-loading {
    background-color: rgba(255, 255, 255, 1);
  }
`;

const PokemonImage = styled.img`
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
  justify-content: space-between;
  align-items: flex-start;
  gap: 0;
  padding: 2rem 3rem;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Info = styled(DataTable)`
  padding: 0;
`;

const StyledDataKey = styled(DataKey)`
  width: 12rem;
`;

const Types = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const TypeBadge = styled.span`
  background-color: ${(props) => {
    const typeColors = {
      normal: "#A8A878",
      fire: "#F08030",
      water: "#6890F0",
      electric: "#F8D030",
      grass: "#78C850",
      ice: "#98D8D8",
      fighting: "#C03028",
      poison: "#A040A0",
      ground: "#E0C068",
      flying: "#A890F0",
      psychic: "#F85888",
      bug: "#A8B820",
      rock: "#B8A038",
      ghost: "#705898",
      dragon: "#7038F8",
      dark: "#705848",
      steel: "#B8B8D0",
      fairy: "#EE99AC"
    };
    return typeColors[props.type] || "#68A090";
  }};
  color: #1a1a1a;
  padding: 0.125rem 1rem;
  border-radius: 0.5rem;
  font-family: "Space Mono", monospace;
  text-transform: uppercase;
  font-size: 2rem;
  font-weight: 600;
`;

const Name = styled(Label)`
  line-height: 1;
`;

const Pokemon = () => {
  const [isError, setIsError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const {
    data: pokemon,
    isLoading,
    fetchData: fetchRandomPokemon
  } = useFetchRandomWithRetry({
    range: { min: 1, max: 1302 },
    fetch: async (randomId) => {
      setIsImageLoaded(false);
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${randomId}`
      );
      return response.json();
    },
    onError: () => setIsError(true)
  });

  useAutoRefresh({
    onRefresh: fetchRandomPokemon
  });

  if (isLoading) {
    return <LoadingCard message="Random Pokemon" />;
  }

  if (isError) {
    return <ErrorCard message="Random Pokemon" />;
  }

  return (
    pokemon && (
      <Columns onClick={fetchRandomPokemon}>
        <ImageContainer className={isImageLoaded ? "done-loading" : ""}>
          <PokemonImage
            src={
              pokemon.sprites.other?.["official-artwork"]?.front_default ||
              pokemon.sprites.front_default
            }
            alt={pokemon.name}
            className={isImageLoaded ? "done-loading" : ""}
            onLoad={() => setIsImageLoaded(true)}
          />
        </ImageContainer>
        <InfoContainer>
          <TopRow>
            <Name>{pokemon.name}</Name>
            <Types>
              {pokemon.types.map((type) => (
                <TypeBadge key={type.type.name} type={type.type.name}>
                  {type.type.name}
                </TypeBadge>
              ))}
            </Types>
          </TopRow>
          <Info>
            <DataRow>
              <StyledDataKey>Number</StyledDataKey>
              <DataValue>{pokemon.id}</DataValue>
            </DataRow>
            <DataRow>
              <StyledDataKey>Height</StyledDataKey>
              <DataValue>{pokemon.height / 10}m</DataValue>
            </DataRow>
            <DataRow>
              <StyledDataKey>Weight</StyledDataKey>
              <DataValue>{pokemon.weight / 10}kg</DataValue>
            </DataRow>
            <DataRow>
              <StyledDataKey>Abilities</StyledDataKey>
              <DataValue>
                {pokemon.abilities
                  .map((ability) => ability.ability.name)
                  .join(", ")}
              </DataValue>
            </DataRow>
          </Info>
        </InfoContainer>
      </Columns>
    )
  );
};

export default Pokemon;
