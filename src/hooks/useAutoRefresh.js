import { useEffect, useRef } from "react";

export const useAutoRefresh = ({
  onRefresh,
  intervalSeconds = 5,
  onError = (error) => console.error("Refresh failed:", error),
  onSuccess = (result) => console.log("Refresh successful:", result),
  immediate = true
}) => {
  const timeoutRef = useRef(null);
  const isRunningRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  // Update refs when callbacks change
  useEffect(() => {
    onRefreshRef.current = onRefresh;
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  }, [onRefresh, onError, onSuccess]);

  useEffect(() => {
    const execute = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const result = await onRefreshRef.current();
        onSuccessRef.current(result);
      } catch (error) {
        onErrorRef.current(error);
      } finally {
        isRunningRef.current = false;
        timeoutRef.current = setTimeout(execute, intervalSeconds * 1000);
      }
    };

    // Start the periodic refresh
    if (immediate) {
      execute();
    } else {
      timeoutRef.current = setTimeout(execute, intervalSeconds * 1000);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [intervalSeconds, immediate]); // Only re-run if interval or immediate flag changes
};
