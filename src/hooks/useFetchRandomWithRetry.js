import { useState, useCallback, useEffect } from "react";

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
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAttempts(0);

    let currentAttempts = 0;

    while (currentAttempts < maxAttempts) {
      try {
        const result = await fetch(getRandom());

        if (validate(result)) {
          setData(result);
          setIsLoading(false);
          return { success: true, data: result };
        }

        currentAttempts++;
        setAttempts(currentAttempts);
        failed(currentAttempts, new Error("Validation failed"));
      } catch (error) {
        currentAttempts++;
        setAttempts(currentAttempts);
        failed(currentAttempts, error);
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
    if (!autoRetry) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        fetchData();
      }
    }, retryInterval);

    return () => clearInterval(interval);
  }, [autoRetry, retryInterval, isLoading, fetchData]);

  return {
    data,
    isLoading,
    error,
    attempts,
    fetchData
  };
};
