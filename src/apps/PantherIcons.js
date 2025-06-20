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

const ICON_NAMES = {
  0: "Font Book",
  1: "Users",
  2: "Network",
  3: "Sherlock",
  4: "PowerPoint",
  5: "No Startup Disk",
  6: "Pictures",
  7: "Favorites",
  8: "Dot Mac",
  9: "iCal",
  10: "Drop",
  11: "Burn",
  12: "Mail",
  13: "Address Book",
  14: "External Link",
  15: "Software Update",
  16: "TextEdit",
  17: "Safari",
  18: "Finder",
  19: "iTunes 3",
  20: "Word",
  21: "Macintosh HD",
  22: "Library",
  23: "iChat",
  24: "System Preferences",
  25: "iMovie",
  26: "Folder",
  27: "Desktop",
  28: "Internet Explorer",
  29: "Preview",
  30: "Fonts",
  31: "Documents",
  32: "Music",
  33: "Terminal",
  34: "Install CD",
  35: "Applications",
  36: "QuickTime Player",
  37: "Home",
  38: "DVD Player",
  39: "Restore CD",
  40: "Disk Utility",
  41: "Dock",
  42: "Image Capture",
  43: "iSync",
  44: "Sites",
  45: "Eject",
  46: "Mac OS 9 CD",
  47: "Movies",
  48: "Entourage",
  49: "Application",
  50: "Documents",
  51: "iTunes 2",
  52: "Smart",
  53: "Public",
  54: "Help",
  55: "Installer",
  56: "Calculator",
  57: "Mac OS X",
  58: "Disk Image",
  59: "Applications",
  60: "Excel",
  61: "Console",
  62: "Internet Connection",
  63: "Mac OS X Box",
  64: "iPhoto",
  65: "Folder Opened",
  66: "Stickies",
  67: "Trash",
  68: "System"
};

const IconContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  height: 100%;
`;

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const IconName = styled(Description)`
  max-height: 4rem;
  padding: 0;
  font-size: 1.5rem;
`;

const RandomIcons = () => {
  const [icons, setIcons] = useState([]);
  const [isError, setIsError] = useState(false);

  const { isLoading, fetchData: fetchRandomIcon } = useFetchRandomWithRetry({
    range: { min: 0, max: 68 },
    fetch: async (randomId) => {
      return {
        url: `https://raw.githubusercontent.com/leomancini/imac-g4/master/resources/images/icons/${randomId}.png`,
        name: ICON_NAMES[randomId]
      };
    },
    onError: () => setIsError(true)
  });

  const fetchFiveRandomIcons = async () => {
    const newIcons = [];
    const usedIds = new Set();

    while (newIcons.length < 5) {
      const result = await fetchRandomIcon();
      if (result.success && !usedIds.has(result.data.url)) {
        usedIds.add(result.data.url);
        newIcons.push(result.data);
      }
    }
    setIcons(newIcons);
  };

  useAutoRefresh({
    onRefresh: fetchFiveRandomIcons
  });

  if (isLoading) {
    return <LoadingCard message="Random Icons" />;
  }

  if (isError) {
    return <ErrorCard message="Random Icons" />;
  }

  return (
    <Columns onClick={fetchFiveRandomIcons}>
      {icons.map((icon, index) => (
        <Rows key={index} style={{ gap: "0.75rem" }}>
          <IconContainer key={index}>
            <IconImage src={icon.url} alt={icon.name} />
          </IconContainer>
          <IconName>{icon.name}</IconName>
        </Rows>
      ))}
    </Columns>
  );
};

export default RandomIcons;
