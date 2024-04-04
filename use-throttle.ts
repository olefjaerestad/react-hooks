import { DependencyList, useCallback, useRef, useState } from 'react';

/**
 * Takes a (sync or async) callback function and returns a throttled version of
 * it, along with it's currently returned value and caught error if any.
 *
 * @example
 * const [handleMouseMove, mouseX, mouseMoveError] = useThrottle(
 *   (event: MouseEvent) => {
 *     return event.pageX + offsetX
 *   },
 *   500,
 *   [offsetX] // Some component state
 * );
 *
 * useEffect(() => {
 *   document.addEventListener('mousemove', handleMouseMove);
 *   return () => document.removeEventListener('mousemove', handleMouseMove);
 * }, [handleMouseMove]);
 */
function useThrottle<
  CALLBACK extends (...args: never[]) => unknown | Promise<unknown>
>(
  callback: CALLBACK,
  throttleMs: number,
  deps: DependencyList
): [
  callback: (...args: Parameters<CALLBACK>) => void,
  value: Awaited<ReturnType<CALLBACK>> | undefined,
  error: unknown
] {
  const [value, setValue] = useState<ReturnType<CALLBACK>>();
  const [error, setError] = useState<unknown>();
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  const prevCallTimestamp = useRef<number>(0);

  const throttled = useCallback(
    (...args: Parameters<CALLBACK>) => {
      const sincePrevCall = Date.now() - prevCallTimestamp.current;
      timeoutId.current && clearTimeout(timeoutId.current);

      async function callbackWrapper() {
        try {
          const val = (await callback(...args)) as ReturnType<CALLBACK>;
          setValue(val);
        } catch (error) {
          setError(error);
        } finally {
          prevCallTimestamp.current = Date.now();
        }
      }

      // Either we're free to fire, or we need to ensure last (most likely in-between 'frames') call gets fired.
      if (sincePrevCall >= throttleMs) {
        callbackWrapper();
      } else {
        timeoutId.current = setTimeout(
          callbackWrapper,
          throttleMs - sincePrevCall
        );
      }
    },
    [callback, throttleMs, ...deps]
  );

  // @ts-expect-error: Type 'unknown' is not assignable to type 'Awaited<ReturnType<CALLBACK>>'
  return [throttled, value, error];
}

export { useThrottle };
