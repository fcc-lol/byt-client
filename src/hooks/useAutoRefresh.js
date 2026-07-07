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
  const isMountedRef = useRef(true);
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
    isMountedRef.current = true;

    const execute = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      let hadError = false;

      try {
        const result = await onRefreshRef.current();
        if (!isMountedRef.current) return;
        onSuccessRef.current(result, isImmediateRef.current);
      } catch (error) {
        if (!isMountedRef.current) return;
        hadError = true;
        onErrorRef.current(error);
      } finally {
        isRunningRef.current = false;
        isImmediateRef.current = false;
        // Component may have unmounted while the fetch above was in flight
        // (SpringBoard remounts apps every screensaver cycle). Without this
        // check, this recursive setTimeout chain outlives its component and
        // keeps polling forever, leaking a zombie fetch loop each cycle.
        if (hadError || !isMountedRef.current) {
          return;
        }
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
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [intervalSeconds, immediate]);
};
