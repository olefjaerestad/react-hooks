import { useCallback, useEffect, useRef, type FocusEvent } from 'react';

/**
 * Restore focus to a specific element when the `restoreWhen` parameter resolves
 * to true. The specific element is determined by the (optional)
 * `selectRestoreElementOnFocus` and `selectRestoreElementOnBlur` parameters,
 * which are functions that are called when the returned `handleFocus` or
 * `handleBlur` functions are called, and receive the corresponding FocusEvent.
 *
 * This is useful e.g. when the currently focused element is
 * removed from the DOM, and you want to restore focus to a previously focused
 * element.
 *
 * @example
 *
 * ```jsx
 * const [showButton2, setShowButton2] = useState(true);
 *
 * const { handleFocus } = useRestoreFocus({
 *   restoreWhen: () => !showButton2,
 *   selectRestoreElementOnFocus: (focusEvent) => {
 *     const losingFocus = focusEvent.relatedTarget;
 *
 *     if (losingFocus instanceof HTMLElement) return losingFocus;
 *     return null;
 *   },
 * });
 *
 * // Tabbing from button 1 to button 2 then clicking button 2, will restore
 * // focus to button 1.
 * <button>Button 1</button>
 * {showButton2 && <button onClick={() => setShowButton2(false)} onFocus={handleFocus}>Button 2</button>}
 * ```
 */
function useRestoreFocus({
  restoreTimeout,
  restoreWhen,
  selectRestoreElementOnBlur,
  selectRestoreElementOnFocus,
}: {
  /** Focus is restored after the provided number of milliseconds. @default undefined */
  restoreTimeout?: number;
  /** Focus is restored when this returns true. */
  restoreWhen: () => boolean;
  /**
   * Select element to restore focus to. Triggered when the returned
   * `handleBlur` function is called. Return `undefined` to ignore return result.
   */
  selectRestoreElementOnBlur?: (
    event: FocusEvent<HTMLElement>
  ) => HTMLElement | null | undefined;
  /**
   * Select element to restore focus to. Triggered when the returned
   * `handleFocus` function is called. Return `undefined` to ignore return result.
   */
  selectRestoreElementOnFocus?: (
    event: FocusEvent<HTMLElement>
  ) => HTMLElement | null | undefined;
}) {
  const restoreElement = useRef<HTMLElement | null>(null);
  const restore = restoreWhen();

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const _restoreElement = selectRestoreElementOnBlur?.(event);

      if (typeof _restoreElement !== 'undefined') {
        restoreElement.current = _restoreElement;
      }
    },
    [selectRestoreElementOnBlur]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const _restoreElement = selectRestoreElementOnFocus?.(event);

      if (typeof _restoreElement !== 'undefined') {
        restoreElement.current = _restoreElement;
      }
    },
    [selectRestoreElementOnFocus]
  );

  useEffect(
    function restoreFocus() {
      if (restore && restoreElement.current) {
        if (typeof restoreTimeout === 'number') {
          setTimeout(() => {
            restoreElement.current?.focus();
            restoreElement.current = null;
          }, restoreTimeout);
        } else {
          restoreElement.current.focus();
          restoreElement.current = null;
        }
      }
    },
    [restore, restoreTimeout]
  );

  return {
    handleBlur,
    handleFocus,
  };
}

export { useRestoreFocus };
