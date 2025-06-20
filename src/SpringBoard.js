import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

import Icon from "./components/Icon";
import NotificationCenter from "./components/NotificationCenter";
import LoadingCard from "./components/LoadingCard";
import ErrorCard from "./components/ErrorCard";

const Body = styled.div`
  width: 100%;
  height: 100%;
  background: #000000;
`;

const Screen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100% - 16px);
  background: #000000;
  top: 0;
  left: 0;
  padding-top: 18px;
  position: absolute;
  overflow: hidden;

  ${(props) =>
    props.$hidePointer &&
    `
    * {
      cursor: none !important;
    }
  `}
`;

const AppContent = styled.div`
  border-radius: ${(props) => props.theme.borderRadius.large};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-width: 0;
`;

const AppSwitcherButton = styled.button`
  background: #000000;
  color: white;
  border: none;
  width: 8rem;
  height: 100%;
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.25s;
  flex-shrink: 0;
  opacity: 0.5;

  &:active {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
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
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  transform-origin: center;
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  border-radius: 5rem;
`;

function SpringBoard() {
  const [currentApp, setCurrentApp] = useState(0);
  const [isDevice, setIsDevice] = useState(false);
  const [apps, setApps] = useState([]);
  const [scale, setScale] = useState(1);
  const [fccApiKey, setFccApiKey] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDevice(params.get("onDevice") === "true");
    setFccApiKey(params.get("fccApiKey"));
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

      // Sort apps alphabetically by name, but keep Clock first
      loadedApps.sort((a, b) => {
        if (a.name === "Clock") return -1;
        if (b.name === "Clock") return 1;
        return a.name.localeCompare(b.name);
      });
      setApps(loadedApps);

      // Check for app parameter in URL
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get("app");
      if (appParam) {
        // Find the index of the requested app (case insensitive)
        const appIndex = loadedApps.findIndex(
          (app) =>
            app.name.toLowerCase().replace(/\s+/g, "") ===
            appParam.toLowerCase().replace(/\s+/g, "")
        );
        if (appIndex !== -1) {
          setCurrentApp(appIndex);
        }
      }
    };

    importApps();
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      // Calculate the maximum possible scale that would fit the window
      const maxScale =
        Math.min(window.innerWidth / 1920, window.innerHeight / 480) * 0.9;

      // Calculate the actual dimensions at this scale
      const width = Math.floor(1920 * maxScale);
      const height = Math.floor(480 * maxScale);

      // Calculate the scale that would give us these integer dimensions
      const scale = Math.min(1.0, Math.min(width / 1920, height / 480));

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

  if (apps.length === 0) {
    return <LoadingCard message="Loading apps" />;
  }

  // Check if current app requires API key
  const currentAppName = apps[currentApp].name.toLowerCase();
  const requiresApiKey = ["flights", "lego minifigs", "birthdays"].includes(
    currentAppName
  );
  const showApiKeyError = requiresApiKey && !fccApiKey;

  const content = (
    <>
      <NotificationCenter />
      <AppSwitcherButton onClick={handlePrevious} $isDevice={isDevice}>
        <Icon icon={faChevronLeft} />
      </AppSwitcherButton>
      <AppContent>
        {showApiKeyError ? (
          <ErrorCard type="api-key" />
        ) : (
          apps[currentApp].component
        )}
      </AppContent>
      <AppSwitcherButton onClick={handleNext} $isDevice={isDevice}>
        <Icon icon={faChevronRight} />
      </AppSwitcherButton>
    </>
  );

  return (
    <Body>
      {isDevice ? (
        <Screen $hidePointer={true}>{content}</Screen>
      ) : (
        <SimulatorContainer>
          <Simulator
            style={{
              transform: `translate(-50%, -50%) scale(${scale})`
            }}
          >
            <Screen>{content}</Screen>
          </Simulator>
        </SimulatorContainer>
      )}
    </Body>
  );
}

export default SpringBoard;
