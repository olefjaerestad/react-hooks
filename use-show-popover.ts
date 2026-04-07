import { MutableRefObject, useEffect } from 'react';

/**
 * Show or hide a `[popover]` element.
 * This hook is an abstraction on top of the imperative popover API.
 * (`HTMLElement.showPopover()` and `HTMLElement.hidePopover()`) that prevents
 * errors when opening an already open popover or closing an already closed one.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
 */
function useShowPopover({
  disabled,
  open,
  popover,
  source,
}: {
  /** Disable hook. */
  disabled?: boolean;
  open: boolean;
  popover: MutableRefObject<HTMLElement | null | undefined> | null;
  source?:
    | MutableRefObject<HTMLElement | null | undefined>
    | (() => HTMLElement | null | undefined)
    | null;
}) {
  useEffect(() => {
    if (disabled) return;

    if (open) {
      if (!popover?.current?.matches(':popover-open')) {
        // @ts-expect-error: Expected 0 arguments, but got 1.
        popover?.current?.showPopover({
          source: typeof source === 'function' ? source() : source?.current,
        });
      }
    } else {
      if (popover?.current?.matches(':popover-open')) {
        popover?.current?.hidePopover();
      }
    }
  }, [disabled, open, popover, source]);
}

export { useShowPopover };
