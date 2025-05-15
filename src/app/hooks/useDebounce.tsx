/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef, useState } from "react";

const useDebounce = () => {
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const [isPending, setIsPending] = useState(false);

  const debounce = useCallback(
    (callback: (...arg: any) => void, delay: number) =>
      (...arg: any) => {
        setIsPending(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsPending(false);
          callback(...arg);
        }, delay);
      },
    []
  );
  return { debounce, isPending };
};

export default useDebounce;
