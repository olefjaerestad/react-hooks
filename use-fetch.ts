import { DependencyList, useCallback, useEffect } from 'react';
import { useStateIfMounted } from './use-state-if-mounted';

/**
 * Takes a callback function and returns it, along with additional data.
 * Wrapper around async functionality in order to return additional status
 * information, such as loading state and error (e.g. for an http request).
 * Basically a super simple version of React Query.
 * The provided callback argument is not called immediately when the
 * hook runs. To call it, call the returned callback.
 * Note: Despite the name, the hook works with any (async) functionality,
 * it doesn't have to be http requests.
 *
 * @example
 * const [getAssignment, assignmentData, isLoading, error] = useFetch(
 *   async (assignmentId: string) => {
 *     return await fetch(`https://my-api.com/assignment/${assignmentId}?revision=${revision}`);
 *   },
 *   [revision] // Some component state
 * );
 *
 * // Somewhere else in the component:
 * getAssignment('123');
 */
export function useFetch<
  CB extends (...args: never[]) => unknown | Promise<unknown>
>(
  callback: CB,
  deps: DependencyList
): [
  callback: (
    ...args: Parameters<CB>
  ) => Promise<Awaited<ReturnType<CB>> | undefined>,
  data: Awaited<ReturnType<CB>> | undefined,
  isLoading: boolean,
  error: any
] {
  const [data, setData] = useStateIfMounted<ReturnType<CB>>();
  const [error, setError] = useStateIfMounted<any>();
  const [isLoading, setIsLoading] = useStateIfMounted<boolean>(false);

  const callbackWrapper = useCallback(async (...args: Parameters<CB>) => {
    setIsLoading(true);

    try {
      const data = (await callback(...args)) as ReturnType<CB>;
      setData(data);
      !data && setIsLoading(false); // If non 200/300 status code.
      return data;
    } catch (err) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  }, deps);

  useEffect(() => {
    // By using useEffect, we ensure isLoading is always set _after_ data.
    if (data !== undefined && data !== null) {
      setIsLoading(false);
    }
  }, [data]);

  return [callbackWrapper, data, isLoading, error];
}
