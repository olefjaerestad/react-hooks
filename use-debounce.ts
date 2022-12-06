import { DependencyList, useCallback, useRef } from 'react';
import { useStateIfMounted } from './use-state-if-mounted'; // https://github.com/olefjaerestad/react-hooks/blob/main/use-state-if-mounted.ts

/**
 * Takes a (sync or async) callback function and returns a debounced version of
 * it, along with it's currently returned value and caught error if any.
 *
 * @example
 * const [handleMouseMove, mouseX, mouseMoveError] = useDebounce(
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
export function useDebounce<
  CB extends (...args: never[]) => unknown | Promise<unknown>
>(
  callback: CB,
  timeoutMs: number,
  deps: DependencyList
): [
  callback: (...args: Parameters<CB>) => void,
  value: Awaited<ReturnType<CB>> | undefined,
  error: unknown
] {
  const [value, setValue] = useStateIfMounted<ReturnType<CB>>();
  const [error, setError] = useStateIfMounted<unknown>();
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();

  const callbackWrapper = useCallback(
    (...args: Parameters<CB>) => {
      timeoutId.current && clearTimeout(timeoutId.current);

      timeoutId.current = setTimeout(async () => {
        try {
          const val = (await callback(...args)) as ReturnType<CB>;
          setValue(val);
        } catch (error) {
          setError(error);
        }
      }, timeoutMs);
    },
    [callback, timeoutMs, ...deps]
  );

  return [callbackWrapper, value, error];
}
