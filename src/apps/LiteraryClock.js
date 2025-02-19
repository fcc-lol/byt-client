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
`;

const QuotePart = styled.span`
  font-weight: 400;
  display: inline;
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

    // Extract trailing space to preserve it, but ensure it's exactly one space
    const trailingSpace = truncateFromStart ? " " : text.match(/\s*$/)[0];
    const leadingSpace = !truncateFromStart ? " " : text.match(/^\s*/)[0];
    const textWithoutSpaces = text.slice(
      leadingSpace.length,
      text.length - trailingSpace.length
    );

    // Account for ellipsis (3 dots) and one space in max length
    const ellipsisLength = 3;
    const spaceLength = 1;
    const effectiveMaxLength = maxLength - spaceLength; // Reserve space for the space
    const adjustedMaxLength = effectiveMaxLength - ellipsisLength; // Always reserve space for ellipsis

    // Check if text fits without truncation (not counting the ellipsis space)
    if (textWithoutSpaces.length <= effectiveMaxLength) {
      return {
        text: truncateFromStart
          ? preserveSpaces(textWithoutSpaces + " ")
          : preserveSpaces(" " + textWithoutSpaces),
        needsEllipsis: false
      };
    }

    // Split into words and truncate from appropriate end
    const words = textWithoutSpaces.trim().split(/\s+/);
    let result;
    let remainingWords;

    if (truncateFromStart) {
      // Start from the end and work backwards
      result = words[words.length - 1];
      let i = words.length - 2;

      while (
        i >= 0 &&
        result.length + words[i].length + 1 <= adjustedMaxLength
      ) {
        result = words[i] + " " + result;
        i--;
      }
      remainingWords = words.slice(0, i + 1);
      result = result + " "; // Always add one space at the end
    } else {
      // Start from the beginning and work forwards
      result = words[0];
      let i = 1;

      while (
        i < words.length &&
        result.length + words[i].length + 1 <= adjustedMaxLength
      ) {
        result = result + " " + words[i];
        i++;
      }
      remainingWords = words.slice(i);
      result = " " + result; // Always add one space at the start
    }

    return {
      text: preserveSpaces(result),
      needsEllipsis: remainingWords.length > 0
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
      randomQuote.quote_first = (randomQuote.quote_first || "").replace(
        /<br\/?>/g,
        " "
      );
      randomQuote.quote_last = (randomQuote.quote_last || "").replace(
        /<br\/?>/g,
        " "
      );

      // Normalize time format to use colon instead of period
      randomQuote.quote_time_case = randomQuote.quote_time_case.replace(
        /(\d+)\.(\d+)/,
        "$1:$2"
      );

      // Fixed width for monospace font - 35 chars per line, 3 lines total
      const charsPerLine = 35;
      const maxTotalLength = charsPerLine * 3; // Use all three lines worth of space
      const ellipsisLength = 3; // Length of "..."

      // Calculate available space for each part
      const timePartLength = randomQuote.quote_time_case.length;
      const totalTextLength =
        randomQuote.quote_first.length + randomQuote.quote_last.length;
      const firstPartRatio = randomQuote.quote_first.length / totalTextLength;

      // Account for potential ellipsis at both ends (6 chars total)
      const availableSpace =
        maxTotalLength - timePartLength - ellipsisLength * 2;

      // Distribute the available space proportionally between first and last parts
      const maxFirstLength = Math.floor(availableSpace * firstPartRatio);
      const maxLastLength = availableSpace - maxFirstLength;

      // Always truncate to ensure consistent handling
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

      randomQuote.quote_first = firstPart.text;
      randomQuote.quote_last = lastPart.text;
      randomQuote.needsEllipsisFront = firstPart.needsEllipsis;
      randomQuote.needsEllipsisBack = lastPart.needsEllipsis;

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
                </QuotePart>
                <TimeText>{quote.quote_time_case}</TimeText>
                <QuotePart>
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
