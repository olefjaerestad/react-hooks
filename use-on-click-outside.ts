/**
 * Run callback when a click event occurs outside of the provided `ref`.
 * Useful for closing dialogs, dropdowns, etc.
 *
 * Note: If you have an "open dialog" button, clicking this would by default 
 * register as a click outside the dialog, and potentially close the dialog 
 * before it's ever opened. To prevent this, use the optional `active` argument 
 * to control when the outside click handler should be active.
 *
 * @example
 *
 * const ref = useRef<HTMLDialogElement>(null);
 *
 * const onClickOutside = useOnClickOutside(ref, isOpen); // `isOpen` could be a prop, state, etc.
 * onClickOutside((event) => {
 *   console.log('You clicked outside the open dialog');
 *   console.log(event); // The original `MouseEvent`.
 * });
 *
 * ...
 *
 * <dialog ref={ref}>
 */
function useOnClickOutside(
  ref: React.MutableRefObject<HTMLElement>,
  active = true
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

    if (active) {
      setTimeout(() => {
        document.body.addEventListener('click', handleClickOutside);
      }, 0);
    }
    return () => document.body.removeEventListener('click', handleClickOutside);
  }, [active, ref]);

  return onClickOutside;
}
