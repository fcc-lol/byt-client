import { useEffect, useRef } from "react";

export const useAutoRefresh = ({
  onRefresh,
  intervalSeconds = 60,
  onError = (error) => console.error("Auto refresh failed:", error),
  onSuccess = (result, isImmediate) =>
    console.log(
      `${
        isImmediate
          ? "💿 Initial data load successful"
          : "♻️ Auto data refresh successful (every " + intervalSeconds + "s)"
      }`
    ),
  immediate = true
}) => {
  const timeoutRef = useRef(null);
  const isRunningRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  const isImmediateRef = useRef(false);

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
        onSuccessRef.current(result, isImmediateRef.current);
      } catch (error) {
        onErrorRef.current(error);
      } finally {
        isRunningRef.current = false;
        isImmediateRef.current = false;
        timeoutRef.current = setTimeout(execute, intervalSeconds * 1000);
      }
    };

    if (immediate) {
      isImmediateRef.current = true;
      execute();
    } else {
      timeoutRef.current = setTimeout(execute, intervalSeconds * 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [intervalSeconds, immediate]);
};
