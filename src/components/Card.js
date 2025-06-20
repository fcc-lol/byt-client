import styled from "styled-components";

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: ${(props) => props.theme.borderRadius.large};
  padding: 1rem;
  flex: 1;
  width: 100%;
`;

export default Card;
