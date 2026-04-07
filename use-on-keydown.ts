import { useEffect, useRef } from 'react';

/**
 * Run callback when a keydown event occurs. Useful for example for closing
 * popovers when pressing 'Escape'.
 *
 * @example
 *
 * const [open, setOpen] = useState(true);
 *
 * const onKeyDown = useOnKeyDown(!open); // Note: the `disabled` argument is optional.
 * onKeyDown((event) => {
 *   console.info("You keydown'ed");
 *   console.info(event); // The original `KeyboardEvent`.
 *
 *   if (event.key === 'Escape') {
 *     setOpen(false);
 *   }
 * });
 *
 * ...
 *
 * <Dropdown open={open} />
 */
function useOnKeyDown(disabled = false) {
  const cb = useRef<(event: KeyboardEvent) => void>();
  function onKeyDown(callback: (event: KeyboardEvent) => void) {
    cb.current = callback;
  }

  useEffect(() => {
    if (disabled || !document) return;

    function handleKeyDownInside(event: KeyboardEvent) {
      cb.current?.(event);
    }

    document.addEventListener('keydown', handleKeyDownInside);
    return () => document.removeEventListener('keydown', handleKeyDownInside);
  }, [disabled]);

  return onKeyDown;
}

export { useOnKeyDown };
