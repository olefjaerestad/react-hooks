import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * Run callback when a keydown event occurs inside of the provided `ref`.
 * Useful for example for creating custom focus handling functionality
 * (e.g. 'Use arrow keys to navigate calendar').
 *
 * @example
 *
 * const [open, setOpen] = useState(true);
 * const ref = useRef<HTMLDialogElement>(null);
 *
 * const onKeyDownInside = useOnKeyDownInside(ref, !open); // Note: second argument is optional.
 * onKeyDownInside((event) => {
 *   console.log("You keydown'ed inside the open calendar");
 *   console.log(event); // The original `KeyboardEvent`.
 *
 *   switch (event.key) {
 *     case 'ArrowRight':
 *       event.preventDefault();
 *       document.activeElement?.nextElementSibling?.focus();
 *       break;
 *     case 'ArrowLeft':
 *       event.preventDefault();
 *       document.activeElement?.previousElementSibling?.focus();
 *       break;
 *   }
 * });
 *
 * ...
 *
 * <Calendar ref={ref} open={open}>
 */
function useOnKeyDownInside(
  ref: MutableRefObject<HTMLElement | null | undefined>,
  disabled = false
) {
  const cb = useRef<(event: KeyboardEvent) => void>();
  function onKeyDownInside(callback: (event: KeyboardEvent) => void) {
    cb.current = callback;
  }

  useEffect(() => {
    if (!document) return;

    function handleKeyDownInside(event: KeyboardEvent) {
      if (ref.current && ref.current.contains(event?.target as Node)) {
        cb.current?.(event);
      }
    }

    if (!disabled) {
      setTimeout(() => {
        /**
         * By wrapping with a timeout, we ensure that any external keydown logic
         * (e.g. 'keydown this button to show/hide a dialog') has the chance to
         * run before we try to act on the keydown. Failing to do so could cause
         * the inside keydown to interfere with the external keydown logic.
         * For a more detailed explanation, see
         * {@link https://codepen.io/olefjaerestad/pen/XWwoXOz?editors=1011 this CodePen}
         */
        document.addEventListener('keydown', handleKeyDownInside);
      }, 0);
    }

    return () => {
      setTimeout(() => {
        document.removeEventListener('keydown', handleKeyDownInside);
      }, 0);
    };
  }, [disabled, ref]);

  return onKeyDownInside;
}

export { useOnKeyDownInside };
