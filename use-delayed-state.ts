import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Acts similar to regular useState, but with an additional delayed value that
 * updates after a specified delay.
 *
 * This is useful in scenarios where you want one thing to happen immediately
 * when the state changes, and another thing to happen after a delay.
 *
 * In the case of a `[popover]` component that unmounts when it's closed, when
 * open state is about to change, we might want to:
 * 1. Immediately: Mount the popover (or alternatively, it's children).
 * 2. Add the `[autofocus]` attribute to the first focusable child element of
 *    the popover. By adding this _before_ the popover opens, the
 *    browser will automatically handle auto focusing for us.
 * 3. After a delay (when we're done with step 2): Open the popover.
 *
 * For the above example, the call site for `useDelayedState` would look like
 * this:
 *
 * ```tsx
 * const {
 *   delayedState: open, // We open the popover when this is true.
 *   immediateState: mounted, // We mount the popover (or it's children) when this is true.
 *   setState: setOpen, // Updates `immediateState` immediately and `delayedState` after a delay (0ms in this example).
 * } = useDelayedState(openProp ?? false, 0);
 * ```
 */
function useDelayedState<VAL>(initialState: VAL, delay: number) {
  const [immediateState, setImmediateState] = useState(initialState);
  const immediateStateRef = useRef(initialState);
  
  const [delayedState, setDelayedState] = useState(initialState);
  const delayedStateRef = useRef(initialState);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setState = useCallback(
    (value: VAL | ((prev: VAL) => VAL)) => {
      setImmediateState((current) => {
        const result =
          typeof value === 'function'
            ? (value as (prev: VAL) => VAL)(current)
            : value;
        immediateStateRef.current = result;
        return result;
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDelayedState((current) => {
          const result =
            typeof value === 'function'
              ? (value as (prev: VAL) => VAL)(current)
              : value;
          delayedStateRef.current = result;
          return result;
        });
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    setState(initialState);
  }, [initialState, setState]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    immediateState,
    immediateStateRef,
    delayedState,
    delayedStateRef,
    setState,
  } as const;
}

export { useDelayedState };
