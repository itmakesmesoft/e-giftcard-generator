/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from "react";

const useDebounce = () => {
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  return useCallback(
    (callback: (...arg: any) => void, delay: number) =>
      (...arg: any) => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => callback(...arg), delay);
      },
    []
  );
};

export default useDebounce;
