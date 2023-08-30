import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * A drop-in replacement for `useState` that prevents state updates on unmounted components.
 * Useful if you're setting state after waiting for a promise, and there's a chance
 * the component has unmounted by the time the promise is settled.
 * 
 * Note: This hook is no longer relevant in React >= 18. See https://github.com/facebook/react/pull/22114
 */
export function useStateIfMounted<T = undefined>(): [
  state: T | undefined,
  setState: Dispatch<SetStateAction<T | undefined>>
];
export function useStateIfMounted<T>(
  initialValue: T
): [state: T, setState: Dispatch<SetStateAction<T>>];
export function useStateIfMounted<T>(
  initialValue?: T
): [state: T | undefined, setState: Dispatch<SetStateAction<T | undefined>>] {
  const [state, setState] = useState<typeof initialValue>(initialValue);
  const isMounted = useRef<boolean>(true);

  const setStateIfMounted = useCallback(
    (value: SetStateAction<T | undefined>) => {
      isMounted.current && setState(value);
    },
    []
  );

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return [state, setStateIfMounted];
}
