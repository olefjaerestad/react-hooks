import { DependencyList, useCallback, useEffect } from 'react';
import { isDefined } from '../utils/type-guards';
import { useStateIfMounted } from './use-state-if-mounted'; // https://github.com/olefjaerestad/react-hooks/blob/main/use-state-if-mounted.ts

/**
 * Takes a callback function and returns it, along with additional data.
 * Wrapper around async functionality in order to return additional status
 * information, such as loading state and error (e.g. for an http request).
 * Basically a super simple version of React Query.
 * The provided callback argument is not called immediately when the
 * hook runs. To call it, call the returned callback.
 * Note: Despite the name, the hook works with any functionality,
 * it doesn't have to be async or promise based.
 *
 * @example
 * const [getAssignment, assignmentData, isLoading, error] = usePromise(
 *   async (assignmentId: string) => {
 *     return await fetch(`https://my-api.com/assignment/${assignmentId}?revision=${revision}`);
 *   },
 *   [revision] // Some component state
 * );
 *
 * // Somewhere else in the component:
 * getAssignment('123');
 */
export function usePromise<
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
    let callbackThrew = false;

    setTimeout(() => {
      /**
       * Hack: We wrap in setTimeout to ensure this is called after the
       * `catch` block. Useful for consecutive function calls where call 1 is
       * cancelled when call 2 starts. There are multiple `setIsLoading` calls
       * in this function, and they're called in the following order:
       * 1. If there's a function call already running and it was cancelled by
       *    current call (e.g. with an `AbortController`).
       * 2. Before current call.
       * 3. After current call fails.
       * 4. After current call succeeds.
       */
      if (!callbackThrew) {
        /**
         * Only setIsLoading if `callback` hasn't already thrown.
         * Relevant if `callback` throws immediately.
         */
        setIsLoading(true);
      }
    }, 0);

    try {
      const data = (await callback(...args)) as ReturnType<CB>;
      setData(data);
      !data && setTimeout(() => setIsLoading(false), 0); // If non 200/300 status code.
      return data;
    } catch (err) {
      callbackThrew = true;
      setError(err);
      setIsLoading(false);
      throw err;
    }
  }, deps);

  useEffect(() => {
    // By using useEffect, we ensure isLoading is always set _after_ data.
    if (isDefined(data)) {
      setIsLoading(false);
    }
  }, [data]);

  return [callbackWrapper, data, isLoading, error];
}
