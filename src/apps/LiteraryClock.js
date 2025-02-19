import styled from "styled-components";
import { useState, useEffect, useRef } from "react";

import Grid from "../components/Grid";
import Card from "../components/Card";

const QuoteContainer = styled.div`
  margin-bottom: 1rem;
  padding: 0 6rem;
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
  const currentMinuteRef = useRef(time.getMinutes());
  const containerRef = useRef(null);
  const isTimeOverridden = useRef(
    !!new URLSearchParams(window.location.search).get("time")
  );

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
    if (!text) return { text: "", needsEllipsis: false };

    // Extract trailing space to preserve it
    const trailingSpace = truncateFromStart ? " " : text.match(/\s*$/)[0];
    const leadingSpace = !truncateFromStart ? " " : text.match(/^\s*/)[0];
    const textWithoutSpaces = text.slice(
      leadingSpace.length,
      text.length - trailingSpace.length
    );

    // If the text is already short enough, return it as is
    if (textWithoutSpaces.length <= maxLength) {
      return {
        text: text.trim(),
        needsEllipsis: false
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
        // -4 for ellipsis and space
        if (truncateFromStart) {
          result = "..." + word.slice(-maxLength + 4) + result;
        } else {
          result = result + word.slice(0, maxLength - 4) + "...";
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

    return {
      text: preserveSpaces(result).trim(),
      needsEllipsis: true
    };
  };

  const fetchQuote = async (hours, minutes) => {
    try {
      const paddedHours = hours.toString().padStart(2, "0");
      const paddedMinutes = minutes.toString().padStart(2, "0");
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://literature-clock.jenevoldsen.com/times/${paddedHours}_${paddedMinutes}.json`
        )}`
      );
      const { contents } = await response.json();
      const quotes = JSON.parse(contents);
      const sfwQuotes = quotes.filter((q) => q.sfw === "yes");

      // Sort quotes by total length and pick the longest one
      const randomQuote = sfwQuotes.sort((a, b) => {
        const lengthA =
          (a.quote_first || "").length + (a.quote_last || "").length;
        const lengthB =
          (b.quote_first || "").length + (b.quote_last || "").length;
        return lengthB - lengthA;
      })[0];

      // Clean br tags but preserve spaces
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

      // Fixed width for monospace font - slightly reduced from 32 to ensure 3-line fit
      const charsPerLine = 28;

      // Calculate maximum available space (all 3 lines)
      const maxTotalLength = charsPerLine * 3;

      // Calculate space needed for time part (just the actual length plus minimal spacing)
      const timePartLength = randomQuote.quote_time_case.length + 2; // Add 2 for minimal spacing

      // Calculate available space for text parts (use remaining space)
      const availableSpace = maxTotalLength - timePartLength;

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

      // Set the parts and ellipsis flags
      randomQuote.quote_first = firstPart.text;
      randomQuote.quote_last = lastPart.text;

      // Only set ellipsis flags if we actually had to truncate
      randomQuote.needsEllipsisFront = firstPart.needsEllipsis;
      randomQuote.needsEllipsisBack = lastPart.needsEllipsis;

      // Ensure time part fits
      if (randomQuote.quote_time_case.length > charsPerLine) {
        randomQuote.quote_time_case = randomQuote.quote_time_case.substring(
          0,
          charsPerLine
        );
      }

      setQuote(randomQuote);
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  };

  useEffect(() => {
    // Only set up the timer if time is not overridden
    if (!isTimeOverridden.current) {
      const timer = setInterval(() => {
        const newTime = new Date();
        const newMinute = newTime.getMinutes();

        if (newMinute !== currentMinuteRef.current) {
          currentMinuteRef.current = newMinute;
          setTime(newTime);
          fetchQuote(newTime.getHours(), newTime.getMinutes());
        }
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchQuote(time.getHours(), time.getMinutes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid>
      <Card>
        {quote && (
          <>
            <QuoteContainer ref={containerRef}>
              <QuoteText>
                <QuotePart>
                  {quote.needsEllipsisFront && <Ellipsis>...</Ellipsis>}
                  {quote.quote_first}
                  <TimeText>&nbsp;{quote.quote_time_case}&nbsp;</TimeText>
                  {quote.quote_last}
                  {quote.needsEllipsisBack && <Ellipsis>...</Ellipsis>}
                </QuotePart>
              </QuoteText>
            </QuoteContainer>
            <Source>
              "{quote.title}" by {quote.author}
            </Source>
          </>
        )}
      </Card>
    </Grid>
  );
};

export default LiteraryClock;
