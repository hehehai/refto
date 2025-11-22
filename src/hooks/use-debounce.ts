import { debounce } from "lodash";
import { useEffect, useRef } from "react";

type AsyncCallback = (...args: any[]) => Promise<any>;

function useDebounce<T extends AsyncCallback>(callback: T, delay: number): T {
  const debouncedFunction = useRef(debounce(callback, delay));

  useEffect(
    () => () => {
      debouncedFunction.current.cancel();
    },
    []
  );

  return debouncedFunction.current as unknown as T;
}

export default useDebounce;
