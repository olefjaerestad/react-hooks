import { MutableRefObject, useCallback, useRef } from 'react';

/**
 * Returns a ref with an abortController, and an abort function
 * you can use to abort e.g. fetch requests.
 * https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
 *
 * @example
 * const [abortControllerRef, abort] = useAbortRequest();
 *
 * function makeRequest() {
 *   // Abort a running request before making a new one
 *   abort();
 *   fetch('http://some-url.com', {
 *     signal: abortControllerRef.current.signal
 *   });
 * }
 */
export function useAbortRequest(): [
  abortControllerRef: MutableRefObject<AbortController>,
  abort: () => void
] {
  const ref = useRef<AbortController>(new AbortController());

  const abort = useCallback(() => {
    ref.current.abort();
    ref.current = new AbortController();
  }, []);

  return [ref, abort];
}
