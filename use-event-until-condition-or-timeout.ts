import { useAbortRequest } from './use-abort-request'; // https://github.com/olefjaerestad/react-hooks/blob/main/use-abort-request.ts

/**
 * Listen for an event for a given number of milliseconds or until the listener
 * returns true.
 *
 * This hook is specifically meant to be used in `FixedPenaltiesList`.
 *
 * @returns
 *
 * A function you can use to register a listener for a given event, much like
 * `myElement.addEventListener`.
 *
 * @example
 *
 * // Run `handleKeyUp` on document.onkeyup for 5000ms or until `handleKeyUp`
 * // returns true:
 *
 * const eventUntilConditionOrTimeout = useEventUntilConditionOrTimeout(5000);
 *
 * function handleKeyUp(e: KeyboardEvent) {
 *   const stopListeningIfThisIsTrue = Math.random() > 0.5;
 *
 *   if (stopListeningIfThisIsTrue) {
 *     return true;
 *   }
 * }
 *
 * eventUntilConditionOrTimeout(document, 'keyup', handleKeyUp, {
 *   stopActiveListeners: true,
 * });
 */
 export function useEventUntilConditionOrTimeout(timeout: number) {
    const [abortControllerRef, abortActiveListener] = useAbortRequest();
  
    return function eventUntilConditionOrTimeout<
      T extends keyof DocumentEventMap
    >(
      element: Window | Document | HTMLElement | SVGElement,
      type: T,
      /** Return true to stop listening to event. */
      listener: (
        ev: DocumentEventMap[T]
      ) => boolean | void | Promise<boolean | void>,
      options?: {
        /** Stop already active listeners. Relevant if calling this multiple times. */
        stopActiveListeners?: boolean;
      }
    ) {
      if (options?.stopActiveListeners) {
        abortActiveListener();
      }
  
      const { signal } = abortControllerRef.current;
  
      async function listenerWrapper(e: DocumentEventMap[T]) {
        const stopListening = await listener(e);
        if (stopListening) {
          abortActiveListener();
        }
      }
  
      function cleanup() {
        if (!signal.aborted) {
          // Since `signal` is a reference to the original value, we know if it's been aborted by `listenerWrapper`.
          abortActiveListener();
        }
      }
  
      // @ts-ignore: Property 'clipboardData' is missing in type 'Event' but required in type 'ClipboardEvent'.
      element.addEventListener(type, listenerWrapper, {
        signal,
      });
  
      setTimeout(cleanup, timeout);
    };
  }
  