import React, { useState, useEffect } from "react";
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
  min-width: 30rem;
`;

const PokemonImage = styled.img`
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
  justify-content: space-between;
  align-items: flex-start;
  gap: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 2rem;
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

const Pokemon = () => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomPokemon = async () => {
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const randomId = Math.floor(Math.random() * 1302) + 1;
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${randomId}`
        );

        if (!response.ok) {
          attempts++;
          continue;
        }

        const data = await response.json();
        setPokemon(data);
        break;
      } catch (error) {
        console.error(
          `Error fetching Pokemon (attempt ${attempts + 1}):`,
          error
        );
        attempts++;
      }
    }

    if (attempts === maxAttempts) {
      console.error("Failed to fetch Pokemon after", maxAttempts, "attempts");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRandomPokemon();
  }, []);

  if (loading) {
    return (
      <Card>
        <Label>Loading...</Label>
      </Card>
    );
  }

  return (
    pokemon && (
      <Columns onClick={fetchRandomPokemon}>
        <ImageContainer style={{ backgroundColor: "white" }}>
          <PokemonImage
            src={
              pokemon.sprites.other?.["official-artwork"]?.front_default ||
              pokemon.sprites.front_default
            }
            alt={pokemon.name}
          />
        </ImageContainer>
        <InfoContainer>
          <TopRow>
            <Label>{pokemon.name}</Label>
            <Types>
              {pokemon.types.map((type) => (
                <TypeBadge key={type.type.name} type={type.type.name}>
                  {type.type.name}
                </TypeBadge>
              ))}
            </Types>
          </TopRow>
          <DataTable>
            <DataRow>
              <DataKey>Number</DataKey>
              <DataValue>{pokemon.id}</DataValue>
            </DataRow>
            <DataRow>
              <DataKey>Height</DataKey>
              <DataValue>{pokemon.height / 10}m</DataValue>
            </DataRow>
            <DataRow>
              <DataKey>Weight</DataKey>
              <DataValue>{pokemon.weight / 10}kg</DataValue>
            </DataRow>
            <DataRow>
              <DataKey>Moves</DataKey>
              <DataValue>
                {pokemon.abilities
                  .map((ability) => ability.ability.name)
                  .join(", ")}
              </DataValue>
            </DataRow>
          </DataTable>
        </InfoContainer>
      </Columns>
    )
  );
};

export default Pokemon;
