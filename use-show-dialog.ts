import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * Show or hide a dialog element.
 * This hook is an abstraction on top of the imperative `<dialog />` API.
 *
 * Use this hook (which uses `HTMLDialogElement.show()` and `
 * HTMLDialogElement.showModal()` internally) instead of setting the `open` prop
 * directly on a `<dialog />` to get focus management for free.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
 */
function useShowDialog({
  dialog,
  disabled,
  mode,
  open,
}: {
  dialog: MutableRefObject<HTMLDialogElement | null | undefined> | null;
  /** Disable hook. */
  disabled?: boolean;
  mode: 'modal' | 'nonmodal';
  open: boolean;
}) {
  const currentMode = useRef(mode);

  useEffect(() => {
    if (disabled) return;

    runWhen(
      () => {
        // By wrapping with an interval (`runWhen()`), we ensure that any
        // external show/hide logic of the dialog (e.g. adding/removing it from
        // the DOM) has the chance to run before we try to show/hide it.
        // This has proven especially useful in Safari (desktop and mobile).

        if (open) {
          if (!dialog?.current?.open) {
            mode === 'modal'
              ? dialog?.current?.showModal()
              : dialog?.current?.show();
            currentMode.current = mode;
          } else if (mode !== currentMode.current) {
            // Close and reopen on mode change. The reopening needs a timeout of a
            // bit longer than the dialog's animation/transition duration to ensure
            // the mode change works correctly.

            // Prevents flash of incorrect position.
            dialog.current.style.animationDuration = '0s';
            dialog.current.style.transitionDuration = '0s';

            dialog?.current?.close();

            setTimeout(() => {
              if (dialog?.current) {
                dialog.current.style.animationDuration = '';
                dialog.current.style.transitionDuration = '';
              }

              mode === 'modal'
                ? dialog?.current?.showModal()
                : dialog?.current?.show();
              currentMode.current = mode;
            }, 10);
          }
        } else {
          if (dialog?.current?.open) {
            dialog?.current?.close();
            currentMode.current = mode;
          }
        }
      },
      () => !!dialog?.current
    );
  }, [dialog, disabled, mode, open]);
}

/**
 * Run `fn` when `condition` returns true.
 */
function runWhen(
  fn: () => void,
  condition: () => boolean,
  options: {
    /**
     * Delay in milliseconds between each attempt.
     * Default is 5ms.
     */
    delay?: number;
    /**
     * Maximum number of attempts to check the condition.
     * Default is 50.
     */
    maxAttempts?: number;
  } = {
    delay: 5,
    maxAttempts: 50,
  }
) {
  const _options = {
    delay: options.delay ?? 5,
    maxAttempts: options.maxAttempts ?? 50,
  };
  let attempts = 0;

  const interval = setInterval(() => {
    if (condition()) {
      clearInterval(interval);
      fn();
    } else if (attempts >= _options.maxAttempts) {
      clearInterval(interval);
    }
    attempts++;
  }, _options.delay);
}

export { useShowDialog };
