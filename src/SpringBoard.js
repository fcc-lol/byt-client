import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faRotate
} from "@fortawesome/free-solid-svg-icons";

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

function SpringBoard() {
  const [currentApp, setCurrentApp] = useState(0);
  const [isDevice, setIsDevice] = useState(false);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDevice(params.get("onDevice") === "true");
  }, []);

  useEffect(() => {
    // Dynamically import all files from apps directory
    const importApps = async () => {
      const context = require.context("./apps", false, /\.js$/);
      const loadedApps = [];

      for (const key of context.keys()) {
        const module = context(key);
        const appName = key.replace("./", "").replace(".js", "");
        // Get the component from either default or named export
        const AppComponent = module.default || Object.values(module)[0];

        loadedApps.push({
          name: appName.replace(/([A-Z])/g, " $1").trim(), // Add spaces before capital letters
          component: <AppComponent />
        });
      }

      // Sort apps alphabetically by name
      loadedApps.sort((a, b) => a.name.localeCompare(b.name));
      setApps(loadedApps);
    };

    importApps();
  }, []);

  const handlePrevious = () => {
    setCurrentApp((current) => (current === 0 ? apps.length - 1 : current - 1));
  };

  const handleNext = () => {
    setCurrentApp((current) => (current === apps.length - 1 ? 0 : current + 1));
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (apps.length === 0) {
    return (
      <Page>
        <MainContainer>
          <AppContent>Loading apps...</AppContent>
        </MainContainer>
      </Page>
    );
  }

  return (
    <>
      <GlobalStyle $hidePointer={isDevice} />
      <Page>
        <MainContainer>
          <NavButton onClick={handlePrevious}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </NavButton>
          <AppContent>{apps[currentApp].component}</AppContent>
          <NavButton onClick={handleNext}>
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

export default SpringBoard;
