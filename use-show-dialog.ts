import { MutableRefObject, useEffect } from 'react';

/**
 * Show or hide a dialog element.
 * This hook is an abstraction on top of the imperative `<dialog />` API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
 */
function useShowDialog(options: {
  dialog: MutableRefObject<HTMLDialogElement>;
  /** Disable hook. */
  disabled?: boolean;
  mode: 'modal' | 'nonmodal';
  open: boolean;
}) {
  useEffect(() => {
    if (options.disabled) {
      return;
    }

    if (options.open) {
      if (!options.dialog.current?.open) {
        options.mode === 'modal'
          ? options.dialog.current?.showModal()
          : options.dialog.current?.show();
      }
    } else {
      if (options.dialog.current?.open) {
        options.dialog.current?.close();
      }
    }
  }, [options.disabled, options.mode, options.open]);
}

export { useShowDialog };
