import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faRotate
} from "@fortawesome/free-solid-svg-icons";
import { Counter } from "./components/Counter";
import { TodoList } from "./components/TodoList";
import { ColorPicker } from "./components/ColorPicker";

const GlobalStyle = createGlobalStyle`
  ${(props) =>
    props.$hidePointer &&
    `
    * {
      cursor: none !important;
    }
  `}
`;

const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: #000000;
  position: fixed;
  top: 0;
  left: 0;
`;

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 100%;
  width: 100%;
`;

const AppContent = styled.div`
  background: white;
  border-radius: 2rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > div {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: 8rem;
  height: 100vh;
  border-radius: 2rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
  flex-shrink: 0;

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
`;

const RefreshButton = styled.button`
  position: fixed;
  top: 1.25rem;
  left: 1.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: rgba(0, 123, 255, 0.1);
  color: red;
  border: none;
  border-radius: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    background: rgba(0, 123, 255, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const HorizontalLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
  justify-content: center;

  > * {
    margin: 0 1rem;
  }
`;

function App() {
  const [currentApp, setCurrentApp] = useState(0);
  const [isDevice, setIsDevice] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDevice(params.get("onDevice") === "true");
  }, []);

  const apps = [
    { name: "Counter", component: <Counter /> },
    { name: "Todo List", component: <TodoList /> },
    { name: "Color Picker", component: <ColorPicker /> }
  ];

  const handlePrevious = () => {
    if (currentApp > 0) {
      setCurrentApp(currentApp - 1);
    }
  };

  const handleNext = () => {
    if (currentApp < apps.length - 1) {
      setCurrentApp(currentApp + 1);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <GlobalStyle $hidePointer={isDevice} />
      <Page>
        <MainContainer>
          <NavButton onClick={handlePrevious} disabled={currentApp === 0}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </NavButton>
          <AppContent>{apps[currentApp].component}</AppContent>
          <NavButton
            onClick={handleNext}
            disabled={currentApp === apps.length - 1}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </NavButton>
        </MainContainer>
        <RefreshButton onClick={handleRefresh}>
          <FontAwesomeIcon icon={faRotate} />
          Refresh
        </RefreshButton>
      </Page>
    </>
  );
}

export default App;
