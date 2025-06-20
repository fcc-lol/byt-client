import { useState, useCallback, useEffect, useRef } from "react";

export const getRandomInRange = ({ min, max }) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const useFetchRandomWithRetry = ({
  fetch,
  validate = (data) => !!data,
  maxAttempts = 10,
  failed = (attempt, error) =>
    console.error(`Attempt ${attempt + 1} failed:`, error),
  range,
  getRandom = () => (range ? getRandomInRange(range) : null),
  autoRetry = false,
  retryInterval = 5000
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasValidData = useRef(false);
  const currentAttemptsRef = useRef(0);
  const dataRef = useRef(null);

  const fetchData = useCallback(async () => {
    hasValidData.current = false;
    setIsLoading(true);
    setError(null);
    currentAttemptsRef.current = 0;

    while (currentAttemptsRef.current < maxAttempts) {
      try {
        const result = await fetch(getRandom());

        if (validate(result)) {
          hasValidData.current = true;
          dataRef.current = result;
          setIsLoading(false);
          return { success: true, data: result };
        }

        currentAttemptsRef.current++;
        failed(currentAttemptsRef.current, new Error("Validation failed"));
      } catch (error) {
        currentAttemptsRef.current++;
        failed(currentAttemptsRef.current, error);
      }
    }

    const errorMessage = `Failed after ${maxAttempts} attempts`;
    setError(errorMessage);
    setIsLoading(false);
    return { success: false, error: errorMessage };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch, validate, maxAttempts, failed, range, getRandom]);

  // Auto-retry logic
  useEffect(() => {
    if (!autoRetry || hasValidData.current) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        fetchData();
      }
    }, retryInterval);

    return () => clearInterval(interval);
  }, [autoRetry, retryInterval, isLoading, fetchData]);

  return {
    data: hasValidData.current ? dataRef.current : null,
    isLoading,
    error,
    attempts: currentAttemptsRef.current,
    fetchData
  };
};
