import { Dispatch, SetStateAction, useEffect } from "react";
import { useStateIfMounted } from "../../../common/hooks/use-state-if-mounted"; // https://github.com/olefjaerestad/react-hooks/blob/main/use-state-if-mounted.ts

/**
 * A version of `useState` that resets the state back to `undefined` after the provided `ms`.
 * Useful if you're setting a state that you want to be temporary, e.g. if you want to
 * display a 'success' message for a brief time.
 *
 * @example
 * // Display successMessage for 3 seconds. Can also provide initial value as second argument.
 * const [successMessage, setSuccesMessage] = useTempState(3000);
 *
 * <button onClick={() => setSuccesMessage('Action successfully performed')}>Perform action</button>
 * {successMessage}
 */
 export function useTempState<T = undefined>(
  ms: number
): [state: T | undefined, setState: Dispatch<SetStateAction<T | undefined>>];
export function useTempState<T>(ms: number, initialValue: T): [state: T, setState: Dispatch<SetStateAction<T>>];
export function useTempState<T>(
  ms: number,
  initialValue?: T
): [state: T | undefined, setState: Dispatch<SetStateAction<T | undefined>>] {
  const [state, setState] = useStateIfMounted<typeof initialValue>(initialValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => setState(undefined), ms);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ms, state]);

  return [state, setState];
}
