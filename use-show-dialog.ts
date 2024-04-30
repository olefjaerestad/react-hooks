import { MutableRefObject, useEffect } from 'react';

/**
 * Show or hide a dialog element.
 * This hook is an abstraction on top of the imperative `<dialog />` API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
 */
function useShowDialog({
  dialog,
  disabled,
  mode,
  open,
}: {
  dialog: MutableRefObject<HTMLDialogElement | null | undefined>;
  /** Disable hook. */
  disabled?: boolean;
  mode: 'modal' | 'nonmodal';
  open: boolean;
}) {
  useEffect(() => {
    if (disabled) return;

    setTimeout(() => {
      // By wrapping with a timeout, we ensure that any external show/hide logic
      // of the dialog (e.g. adding/removing it from the DOM) has the chance to
      // run before we try to show/hide it.

      if (open) {
        if (!dialog.current?.open) {
          mode === 'modal' ? dialog.current?.showModal() : dialog.current?.show();
        }
      } else {
        if (dialog.current?.open) {
          dialog.current?.close();
        }
      }
    }, 0);
  }, [dialog, disabled, mode, open]);
}

export { useShowDialog };
