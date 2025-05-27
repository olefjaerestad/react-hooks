import { MutableRefObject, useEffect, useRef } from 'react';

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
  const currentMode = useRef(mode);
  
  useEffect(() => {
    if (disabled) return;

    setTimeout(() => {
      // By wrapping with a timeout, we ensure that any external show/hide logic
      // of the dialog (e.g. adding/removing it from the DOM) has the chance to
      // run before we try to show/hide it.

      if (open) {
        if (!dialog.current?.open) {
          mode === 'modal' ? dialog.current?.showModal() : dialog.current?.show();
          currentMode.current = mode;
        } else if (mode !== currentMode.current) {
          // Close and reopen on mode change. The reopening needs a timeout of a
          // bit longer than the dialog's animation/transition duration to ensure
          // the mode change works correctly.

          // Prevents flash of incorrect position.
          dialog.current.style.animationDuration = '0s';
          dialog.current.style.transitionDuration = '0s';

          dialog.current?.close();

          setTimeout(() => {
            if (dialog.current) {
              dialog.current.style.animationDuration = '';
              dialog.current.style.transitionDuration = '';
            }

            mode === 'modal'
              ? dialog.current?.showModal()
              : dialog.current?.show();
            currentMode.current = mode;
          }, 10);
        }
      } else {
        if (dialog.current?.open) {
          dialog.current?.close();
          currentMode.current = mode;
        }
      }
    }, 5); // 0 works for all browsers except Safari (tested in 17.4.1).
  }, [dialog, disabled, mode, open]);
}

export { useShowDialog };
