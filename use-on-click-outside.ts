import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * Run callback when a click event occurs outside of the provided `ref`.
 * Useful for closing dialogs, dropdowns, etc.
 *
 * Note: If you have an "open dialog" button, clicking this would by default
 * register as a click outside the dialog, and potentially close the dialog
 * before it's ever opened. To prevent this, use the optional `disabled`
 * parameter to control when the outside click handler should be enabled.
 *
 * @example
 *
 * const [open, setOpen] = useState(true);
 * const ref = useRef<HTMLDialogElement>(null);
 *
 * const onClickOutside = useOnClickOutside(ref, !open); // Note: second argument is optional.
 * onClickOutside((event) => {
 *   console.log('You clicked outside the open dialog');
 *   console.log(event); // The original `MouseEvent`.
 *   setOpen(false);
 * });
 *
 * ...
 *
 * <dialog ref={ref} open={open}>
 */
function useOnClickOutside(
  ref: MutableRefObject<HTMLElement | null | undefined>,
  disabled = false
) {
  const cb = useRef<(event: MouseEvent) => void>();
  function onClickOutside(callback: (event: MouseEvent) => void) {
    cb.current = callback;
  }

  useEffect(() => {
    if (!document) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event?.target as Node)) {
        cb.current?.(event);
      }
    }

    if (!disabled) {
      setTimeout(() => {
        /**
         * By wrapping with a timeout, we ensure that any external click logic
         * (e.g. 'click this button to show/hide a dialog') has the chance to
         * run before we try to act on the click. Failing to do so could cause
         * the outside click to interfere with the external click logic.
         * For a more detailed explanation, see
         * {@link https://codepen.io/olefjaerestad/pen/XWwoXOz?editors=1011 this CodePen}
         */
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [disabled, ref]);

  return onClickOutside;
}

export { useOnClickOutside };
