import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

import LoadingCard from "../components/LoadingCard";
import ErrorCard from "../components/ErrorCard";
import Columns from "../components/Columns";
import Card from "../components/Card";

const QuoteContainer = styled.div`
  margin-bottom: 1rem;
  padding: 0 10rem;
  text-align: center;
  font-family: "Space Mono", monospace;
  text-transform: uppercase;
  font-size: 4.25rem;
  line-height: 1.3;
  height: calc(1.3em * 3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  position: relative;
`;

const QuoteText = styled.div`
  overflow: hidden;
  max-height: calc(1.3em * 3);
  text-align: center;
  white-space: normal;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuotePart = styled.span`
  font-weight: 400;
  display: inline;
  min-width: 1em;
  line-height: 1.3;
  white-space: pre-wrap;
  word-break: break-word;
`;

const TimeText = styled.strong`
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  display: inline;
`;

const Source = styled.div`
  font-family: "Space Mono", monospace;
  color: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  font-size: 2rem;
`;

const Ellipsis = styled.span`
  letter-spacing: 0;
  font-family: "Space Mono", monospace;
  display: inline;
  color: inherit;
  opacity: 1;
  font-weight: inherit;
`;

const LiteraryClock = () => {
  const [time, setTime] = useState(() => {
    // Check for time override in URL (format: HH:mm)
    const params = new URLSearchParams(window.location.search);
    const timeParam = params.get("time");
    if (timeParam && /^\d{2}:\d{2}$/.test(timeParam)) {
      const [hours, minutes] = timeParam.split(":").map(Number);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const date = new Date();
        date.setHours(hours, minutes);
        return date;
      }
    }
    return new Date();
  });
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const currentMinuteRef = useRef(time.getMinutes());
  const containerRef = useRef(null);

  const hasEndingEllipsis = (text) => text.trim().endsWith("...");
  const hasStartingEllipsis = (text) => text.trim().startsWith("...");
  const isJustPeriod = (text) => /^\s*\.\s*$/.test(text);
  const hasTrailingQuote = (text) => {
    const trimmed = text.trim();
    // First remove any existing ellipsis to check for quote
    const withoutEllipsis = trimmed.replace(/\.{3}$/, "");
    // Match any of the possible apostrophe characters
    return /\w[\u0027\u2019\u02BC\u02B9\u2032]$/.test(withoutEllipsis);
  };
  const removeTrailingQuote = (text) => {
    const trimmed = text.trim();
    // First remove ellipsis if it exists
    const withoutEllipsis = trimmed.replace(/\.{3}$/, "");
    // Remove any of the possible apostrophe characters
    const withoutQuote = withoutEllipsis.replace(
      /(\w)[\u0027\u2019\u02BC\u02B9\u2032]$/,
      "$1"
    );
    // Add back ellipsis if it was there
    return trimmed.endsWith("...") ? withoutQuote + "..." : withoutQuote;
  };

  const preserveSpaces = (text) => {
    // Preserve leading and trailing spaces by handling them separately
    const leadingSpaces = text.match(/^\s*/)[0];
    const trailingSpaces = text.match(/\s*$/)[0];
    const innerText = text.trim();

    // Handle inner spaces
    const processedInner = innerText.replace(/\s+/g, (match) => {
      return match.length > 1 ? " " + "\u00A0".repeat(match.length - 1) : match;
    });

    // Reconstruct with preserved spaces
    return (
      leadingSpaces.replace(/\s/g, "\u00A0") +
      processedInner +
      trailingSpaces.replace(/\s/g, "\u00A0")
    );
  };

  const truncateText = (text, maxLength, truncateFromStart = true) => {
    if (!text) return { text: "", needsEllipsis: true };

    // Extract trailing space to preserve it
    const trailingSpace = truncateFromStart ? " " : text.match(/\s*$/)[0];
    const leadingSpace = !truncateFromStart ? " " : text.match(/^\s*/)[0];
    const textWithoutSpaces = text.slice(
      leadingSpace.length,
      text.length - trailingSpace.length
    );

    // Check for existing ellipsis
    const hasExistingStartEllipsis = textWithoutSpaces.startsWith("...");
    const hasExistingEndEllipsis = textWithoutSpaces.endsWith("...");

    // If the text is already short enough, return it as is
    if (textWithoutSpaces.length <= maxLength) {
      let finalText = text.trim();
      // Remove trailing quote if it exists and we're truncating from the end
      if (!truncateFromStart && hasTrailingQuote(finalText)) {
        finalText = removeTrailingQuote(finalText);
      }
      return {
        text: finalText,
        needsEllipsis: true
      };
    }

    // Split into words but preserve punctuation
    const words = textWithoutSpaces.match(/\S+/g) || [];
    let result = "";
    let currentLength = 0;
    let wordIndex = truncateFromStart ? words.length - 1 : 0;

    while (wordIndex >= 0 && wordIndex < words.length) {
      const word = words[wordIndex];
      const wordWithSpace = truncateFromStart ? " " + word : word + " ";

      // For very long words, we'll need to break them
      if (word.length > maxLength - 4) {
        if (truncateFromStart) {
          // If starting with ellipsis, preserve it
          const sliceStart = hasExistingStartEllipsis ? 3 : 0;
          result =
            (hasExistingStartEllipsis ? "..." : "...") +
            word.slice(sliceStart, -maxLength + 4) +
            result;
        } else {
          // If ending with ellipsis, preserve it
          const sliceEnd = hasExistingEndEllipsis ? -3 : undefined;
          let truncatedWord = word.slice(
            0,
            sliceEnd ? maxLength - 4 + sliceEnd : maxLength - 4
          );
          // Remove trailing quote if present
          if (hasTrailingQuote(truncatedWord)) {
            truncatedWord = removeTrailingQuote(truncatedWord);
          }
          result =
            result + truncatedWord + (hasExistingEndEllipsis ? "..." : "...");
        }
        break;
      }

      // Check if adding this word would exceed the limit
      if (currentLength + wordWithSpace.length <= maxLength) {
        if (truncateFromStart) {
          result = wordWithSpace + result;
        } else {
          result = result + wordWithSpace;
        }
        currentLength += wordWithSpace.length;
        wordIndex += truncateFromStart ? -1 : 1;
      } else {
        break;
      }
    }

    // Remove trailing quote if present and we're truncating from the end
    if (!truncateFromStart && hasTrailingQuote(result)) {
      result = removeTrailingQuote(result);
    }

    // Check one final time for trailing quote before preserving spaces
    const finalResult = preserveSpaces(result).trim();
    if (!truncateFromStart && hasTrailingQuote(finalResult)) {
      return {
        text: removeTrailingQuote(finalResult),
        needsEllipsis: true
      };
    }

    return {
      text: finalResult,
      needsEllipsis: true
    };
  };

  const fetchQuote = async (hours, minutes) => {
    setIsLoading(true);
    try {
      const paddedHours = hours.toString().padStart(2, "0");
      const paddedMinutes = minutes.toString().padStart(2, "0");
      const fccApiKey = new URLSearchParams(window.location.search).get(
        "fccApiKey"
      );
      const response = await fetch(
        `${
          process.env.REACT_APP_SERVER_API_URL
        }/api/literary-clock/${paddedHours}/${paddedMinutes}?fccApiKey=${encodeURIComponent(
          fccApiKey || ""
        )}`
      );
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const randomQuote = await response.json();

      // Clean br tags and preserve spaces
      randomQuote.quote_first = (randomQuote.quote_first || "")
        .replace(/<br\/?>/g, " ")
        .replace(/^\s+/, ""); // Remove leading spaces
      randomQuote.quote_last = (randomQuote.quote_last || "")
        .replace(/<br\/?>/g, " ")
        .replace(/\s+$/, ""); // Remove trailing spaces

      // Normalize time format to use colon instead of period
      randomQuote.quote_time_case = randomQuote.quote_time_case.replace(
        /(\d+)\.(\d+)/,
        "$1:$2"
      );

      // Fixed width for monospace font
      const charsPerLine = 25;
      const ellipsisLength = 3; // Length of "..."

      // Calculate maximum available space (all 3 lines)
      const maxTotalLength = charsPerLine * 3;

      // Calculate space needed for time part and ellipsis (at both ends)
      const timePartLength = randomQuote.quote_time_case.length + 2; // Add 2 for minimal spacing
      const totalEllipsisLength = ellipsisLength * 2; // Both start and end ellipsis

      // Calculate available space for text parts (use remaining space)
      const availableSpace =
        maxTotalLength - timePartLength - totalEllipsisLength;

      // Allocate space proportionally based on original lengths
      const originalFirstLength = (randomQuote.quote_first || "").length;
      const originalLastLength = (randomQuote.quote_last || "").length;
      const totalOriginalLength = originalFirstLength + originalLastLength;

      // Give more space to account for word boundaries, but stay within limits
      const maxFirstLength = Math.min(
        originalFirstLength,
        Math.floor(
          (availableSpace * originalFirstLength) / totalOriginalLength
        ) + 6 // Reduced buffer from 8 to 6
      );
      const maxLastLength = Math.min(
        originalLastLength,
        Math.floor(
          (availableSpace * originalLastLength) / totalOriginalLength
        ) + 6 // Reduced buffer from 8 to 6
      );

      // Truncate text parts with more lenient limits
      const firstPart = truncateText(
        randomQuote.quote_first,
        maxFirstLength,
        true
      );
      const lastPart = truncateText(
        randomQuote.quote_last,
        maxLastLength,
        false
      );

      // Set the parts
      randomQuote.quote_first = firstPart.text;
      randomQuote.quote_last = lastPart.text;

      // Only set ellipsis flags if we actually had to truncate
      randomQuote.needsEllipsisFront = firstPart.needsEllipsis;
      randomQuote.needsEllipsisBack = lastPart.needsEllipsis;

      setQuote(randomQuote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useAutoRefresh({
    onRefresh: () => {
      const newTime = new Date();
      const newMinute = newTime.getMinutes();
      if (newMinute !== currentMinuteRef.current) {
        currentMinuteRef.current = newMinute;
        setTime(newTime);
        fetchQuote(newTime.getHours(), newTime.getMinutes());
      }
    },
    intervalSeconds: 60
  });

  // Initial fetch
  useEffect(() => {
    fetchQuote(time.getHours(), time.getMinutes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <LoadingCard message="Literary Clock" />;
  }

  if (isError) {
    return <ErrorCard message="Literary Clock" />;
  }

  return (
    <Columns>
      <Card>
        {quote && (
          <>
            <QuoteContainer ref={containerRef}>
              <QuoteText>
                <QuotePart>
                  {!hasStartingEllipsis(quote.quote_first) && (
                    <Ellipsis>...</Ellipsis>
                  )}
                  {quote.quote_first}
                  <TimeText>
                    &nbsp;{quote.quote_time_case}
                    {!isJustPeriod(quote.quote_last) && "\u00A0"}
                  </TimeText>
                  {!isJustPeriod(quote.quote_last) && quote.quote_last}
                  {(!hasEndingEllipsis(quote.quote_last) ||
                    isJustPeriod(quote.quote_last)) && <Ellipsis>...</Ellipsis>}
                </QuotePart>
              </QuoteText>
            </QuoteContainer>
            <Source>
              "{quote.title}" by {quote.author}
            </Source>
          </>
        )}
      </Card>
    </Columns>
  );
};

export default LiteraryClock;
