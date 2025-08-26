import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * Run callback when a parent form of `ref` is reset.
 *
 * @example
 *
 * ```tsx
 * const ref = useRef<HTMLInputElement>(null);
 *
 * const onParentFormReset = useOnParentFormReset(ref);
 * onKeyUpOutside((event: Event) => {
 *   console.log("Parent form of `ref` was reset!");
 *   console.log(event); // The original `Event`.
 * });
 *
 * <input ref={ref} />
 * ```
 */
function useOnParentFormReset(
  /** If HTML ID, omit the '#'. */
  refOrId: MutableRefObject<HTMLElement | null | undefined> | string
) {
  const cb = useRef<(event: Event) => void>();
  function onParentFormReset(callback: (event: Event) => void) {
    cb.current = callback;
  }

  useEffect(() => {
    if (!document) return;

    function handleParentFormReset(event: Event) {
      const element =
        typeof refOrId === 'string'
          ? document.getElementById(refOrId)
          : refOrId.current;

      if (
        element &&
        (event.target as HTMLFormElement | null)?.isConnected &&
        (event.target as HTMLFormElement | null)?.contains(element)
      ) {
        cb.current?.(event);
      }
    }

    document.addEventListener('reset', handleParentFormReset);
    return () => document.removeEventListener('reset', handleParentFormReset);
  }, [refOrId]);

  return onParentFormReset;
}

export { useOnParentFormReset };
