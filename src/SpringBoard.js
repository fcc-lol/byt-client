import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  faChevronLeft,
  faChevronRight,
  faRefresh,
  faLock
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
  position: relative;

  ${(props) =>
    props.$interactionDisabled &&
    `
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
      pointer-events: auto;
    }
  `}
`;

const StatusIndicator = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 1.125rem;
  color: #000;
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  z-index: 20;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  transition: opacity 0.25s;
  pointer-events: none;
  font-size: 2.5rem;
  color: #fff;
`;

const AppLockIndicator = styled(StatusIndicator)``;

const ScreensaverIndicator = styled(StatusIndicator)`
  ${(props) =>
    props.$active &&
    `
      animation: fadeInOut 2s ease-in-out infinite, rotate 3s linear infinite;
    `}

  @keyframes fadeInOut {
    0% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.3;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
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
  const [isScreensaverActive, setIsScreensaverActive] = useState(true);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);
  const activityTimeoutRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const interactionDisableTimeoutRef = useRef(null);
  const screensaverCycleTimerRef = useRef(null);

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
          // Enable app lock mode and disable screensaver when app is specified in URL
          setIsAppLocked(true);
          setIsScreensaverActive(false);
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

  // Handle user activity tracking and screensaver timeout
  useEffect(() => {
    const SCREENSAVER_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

    const handleActivity = () => {
      // Ignore activity if interactions are temporarily disabled
      if (isInteractionDisabled) {
        return;
      }

      // Clear existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Deactivate screensaver if it's currently active
      if (isScreensaverActive) {
        setIsScreensaverActive(false);
      }

      // Set new timeout only if app is not locked
      if (!isAppLocked) {
        const newTimeout = setTimeout(() => {
          setIsScreensaverActive(true);
        }, SCREENSAVER_TIMEOUT);

        activityTimeoutRef.current = newTimeout;
      }
    };

    // Activity event types to listen for - only clicks and touches
    const activityEvents = ["mousedown", "click", "touchstart"];

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout setup (since app starts in screensaver mode)
    if (!isAppLocked) {
      const initialTimeout = setTimeout(() => {
        setIsScreensaverActive(true);
      }, SCREENSAVER_TIMEOUT);
      activityTimeoutRef.current = initialTimeout;
    }

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [isScreensaverActive, isAppLocked, isInteractionDisabled]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (interactionDisableTimeoutRef.current) {
        clearTimeout(interactionDisableTimeoutRef.current);
      }
      if (screensaverCycleTimerRef.current) {
        clearInterval(screensaverCycleTimerRef.current);
      }
    };
  }, []);

  // Screensaver app cycling logic
  useEffect(() => {
    const getNextValidApp = (currentIndex) => {
      if (apps.length === 0) return currentIndex;

      let nextIndex = (currentIndex + 1) % apps.length;
      let attempts = 0;

      // Find next app that doesn't require API key (or has one)
      while (attempts < apps.length) {
        const appName = apps[nextIndex].name.toLowerCase();
        const requiresApiKey = [
          "flights",
          "lego minifigs",
          "birthdays"
        ].includes(appName);

        if (!requiresApiKey || fccApiKey) {
          return nextIndex;
        }

        nextIndex = (nextIndex + 1) % apps.length;
        attempts++;
      }

      // If all apps require API key and we don't have one, just cycle through all
      return (currentIndex + 1) % apps.length;
    };

    if (isScreensaverActive && apps.length > 1) {
      // Start cycling through apps every 10 seconds
      const cycleApps = () => {
        setCurrentApp((current) => getNextValidApp(current));
      };

      screensaverCycleTimerRef.current = setInterval(cycleApps, 10000); // 10 seconds

      return () => {
        if (screensaverCycleTimerRef.current) {
          clearInterval(screensaverCycleTimerRef.current);
          screensaverCycleTimerRef.current = null;
        }
      };
    } else {
      // Clear cycling if screensaver is not active
      if (screensaverCycleTimerRef.current) {
        clearInterval(screensaverCycleTimerRef.current);
        screensaverCycleTimerRef.current = null;
      }
    }
  }, [isScreensaverActive, apps, fccApiKey]);

  // Long press handlers
  const handleLongPressStart = (e) => {
    // Only prevent default if the event is cancelable
    if (e.cancelable) {
      e.preventDefault();
    }

    // Don't start long press if interactions are disabled
    if (isInteractionDisabled) {
      return;
    }

    const timer = setTimeout(() => {
      // Toggle app lock on long press
      setIsAppLocked((prevLocked) => {
        const newLocked = !prevLocked;

        // If we're locking, disable interactions for 1 second and clear the screensaver timeout
        if (newLocked) {
          setIsInteractionDisabled(true);

          // Clear any existing interaction disable timeout
          if (interactionDisableTimeoutRef.current) {
            clearTimeout(interactionDisableTimeoutRef.current);
          }

          // Re-enable interactions after 1 second
          interactionDisableTimeoutRef.current = setTimeout(() => {
            setIsInteractionDisabled(false);
          }, 1000);

          // Clear the screensaver timeout
          if (activityTimeoutRef.current) {
            clearTimeout(activityTimeoutRef.current);
            activityTimeoutRef.current = null;
          }
        }

        // If we're unlocking, clear any existing timeout and set new one if not in screensaver mode
        if (!newLocked && !isScreensaverActive) {
          if (activityTimeoutRef.current) {
            clearTimeout(activityTimeoutRef.current);
          }
          const newTimeout = setTimeout(() => {
            setIsScreensaverActive(true);
          }, 5 * 60 * 1000);
          activityTimeoutRef.current = newTimeout;
        }

        return newLocked;
      });
    }, 800); // 800ms long press duration

    longPressTimerRef.current = timer;
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePrevious = () => {
    // Don't allow switching if interactions are disabled
    if (isInteractionDisabled) {
      return;
    }

    setCurrentApp((current) => (current === 0 ? apps.length - 1 : current - 1));
    // Unlock app when switching manually
    if (isAppLocked) {
      setIsAppLocked(false);
    }
  };

  const handleNext = () => {
    // Don't allow switching if interactions are disabled
    if (isInteractionDisabled) {
      return;
    }

    setCurrentApp((current) => (current === apps.length - 1 ? 0 : current + 1));
    // Unlock app when switching manually
    if (isAppLocked) {
      setIsAppLocked(false);
    }
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
      <ScreensaverIndicator $active={isScreensaverActive}>
        <Icon icon={faRefresh} />
      </ScreensaverIndicator>
      <AppLockIndicator $active={isAppLocked}>
        <Icon icon={faLock} />
      </AppLockIndicator>
      <AppSwitcherButton
        onClick={handlePrevious}
        $isDevice={isDevice}
        disabled={isInteractionDisabled}
      >
        <Icon icon={faChevronLeft} />
      </AppSwitcherButton>
      <AppContent
        $interactionDisabled={isInteractionDisabled}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
      >
        {showApiKeyError ? (
          <ErrorCard type="api-key" />
        ) : (
          apps[currentApp].component
        )}
      </AppContent>
      <AppSwitcherButton
        onClick={handleNext}
        $isDevice={isDevice}
        disabled={isInteractionDisabled}
      >
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
