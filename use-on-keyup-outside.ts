import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * Run callback when a keyup event occurs outside of the provided `ref`.
 * Useful for example for closing dialogs or tooltips when tabbing past them.
 *
 * Note: If you have an "open dialog" button that opens a dialog on keyup,
 * keyup'ing this would by default register as a keyup outside the dialog, and
 * potentially close the dialog before it's ever opened. To prevent this, use
 * the optional `disabled` parameter to control when the outside keyup handler
 * should be enabled.
 *
 * @example
 *
 * const [open, setOpen] = useState(true);
 * const ref = useRef<HTMLDialogElement>(null);
 *
 * const onKeyUpOutside = useOnKeyUpOutside(ref, !open); // Note: second argument is optional.
 * onKeyUpOutside((event) => {
 *   console.log("You keyup'ed outside the open dialog");
 *   console.log(event); // The original `KeyboardEvent`.
 *   setOpen(false);
 * });
 *
 * ...
 *
 * <dialog ref={ref} open={open}>
 */
function useOnKeyUpOutside(
  ref: MutableRefObject<HTMLElement | null | undefined>,
  disabled = false
) {
  const cb = useRef<(event: KeyboardEvent) => void>();
  function onKeyUpOutside(callback: (event: KeyboardEvent) => void) {
    cb.current = callback;
  }

  useEffect(() => {
    if (!document) return;

    function handleKeyUpOutside(event: KeyboardEvent) {
      if (ref.current && !ref.current.contains(event?.target as Node)) {
        cb.current?.(event);
      }
    }

    if (!disabled) {
      setTimeout(() => {
        /**
         * By wrapping with a timeout, we ensure that any external keyup logic
         * (e.g. 'keyup this button to show/hide a dialog') has the chance to
         * run before we try to act on the keyup. Failing to do so could cause
         * the outside keyup to interfere with the external keyup logic.
         * For a more detailed explanation, see
         * {@link https://codepen.io/olefjaerestad/pen/XWwoXOz?editors=1011 this CodePen}
         */
        document.addEventListener('keyup', handleKeyUpOutside);
      }, 0);
    }
    return () => document.removeEventListener('keyup', handleKeyUpOutside);
  }, [disabled, ref]);

  return onKeyUpOutside;
}

export { useOnKeyUpOutside };
