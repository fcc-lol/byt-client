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

const Screen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #000000;
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
  border-radius: 2rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: ${(props) => (props.$isDevice ? "8rem" : "4rem")};
  height: ${(props) => (props.$isDevice ? "100vh" : "100%")};
  border-radius: 2rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
  flex-shrink: 0;
  width: 5rem;

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

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const SimulatorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: #333;
`;

const Simulator = styled.div`
  width: 1920px;
  height: 480px;
  background: #000000;
  border-radius: 0.25rem;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  transform-origin: center;
  position: absolute;
  left: 50%;
  top: 50%;
`;

function SpringBoard() {
  const [currentApp, setCurrentApp] = useState(0);
  const [isDevice, setIsDevice] = useState(false);
  const [apps, setApps] = useState([]);
  const [scale, setScale] = useState(1);

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

  useEffect(() => {
    const calculateScale = () => {
      // Calculate scale but cap it at 1.0 to prevent scaling above original size
      const scale = Math.min(
        1.0, // Maximum scale
        Math.min(window.innerWidth / 1920, window.innerHeight / 480) * 0.9
      );
      setScale(scale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
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
      <MainContainer>
        <AppContent>Loading apps...</AppContent>
      </MainContainer>
    );
  }

  const content = (
    <MainContainer>
      <NavButton onClick={handlePrevious} $isDevice={isDevice}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </NavButton>
      <AppContent>{apps[currentApp].component}</AppContent>
      <NavButton onClick={handleNext} $isDevice={isDevice}>
        <FontAwesomeIcon icon={faChevronRight} />
      </NavButton>
    </MainContainer>
  );

  return (
    <>
      <GlobalStyle $hidePointer={isDevice} />
      {isDevice ? (
        <Screen>
          <RefreshButton onClick={handleRefresh}>
            <FontAwesomeIcon icon={faRotate} />
            Refresh
          </RefreshButton>
          {content}
        </Screen>
      ) : (
        <SimulatorContainer>
          <Simulator
            style={{
              transform: `translate(-50%, -50%) scale(${scale})`
            }}
          >
            <Screen>
              <RefreshButton onClick={handleRefresh}>
                <FontAwesomeIcon icon={faRotate} />
                Refresh
              </RefreshButton>
              {content}
            </Screen>
          </Simulator>
        </SimulatorContainer>
      )}
    </>
  );
}

export default SpringBoard;
