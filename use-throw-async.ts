import { useCallback, useState } from 'react';

/**
 * React error boundaries are by default unable to detect async errors, as they
 * happen outside of the React render phase. This hook returns a function that
 * taps into the render phase and then throws, making error boundaries able to
 * pick up the error. Remember to wrap your component in an error boundary
 * before using this hook.
 *
 * @see https://reactjs.org/docs/error-boundaries.html
 * @see https://medium.com/trabe/catching-asynchronous-errors-in-react-using-error-boundaries-5e8a5fd7b971
 * @see https://github.com/facebook/react/issues/14981#issuecomment-468460187
 *
 * @example
 * const throwAsync = useThrowAsync();
 *
 * getSomethingFromApi()
 *   .then(successHandler)
 *   .catch(throwAsync);
 */
export function useThrowAsync(ignoreAbortErrors: boolean = true) {
  const [error, setError] = useState();

  const throwAsync = useCallback(
    (err: Error) => {
      if (ignoreAbortErrors && err.name === 'AbortError') {
        return;
      }

      setError(() => {
        throw err;
      });
    },
    [ignoreAbortErrors]
  );

  return throwAsync;
}
