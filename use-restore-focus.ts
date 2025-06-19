import { useCallback, useEffect, useRef, type FocusEvent } from 'react';

/**
 * Restore focus to a specific element when the `restoreWhen` parameter resolves
 * to true. The specific element is determined by the `selectRestoreElement`
 * parameter, which is a function that is called when the returned `handleFocus`
 * function is called, and receives the corresponding FocusEvent.
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
 *   selectRestoreElement: (focusEvent) => {
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
  restoreWhen,
  selectRestoreElement = (focusEvent: FocusEvent<HTMLElement>) => {
    const losingFocus = focusEvent.relatedTarget;
    if (losingFocus instanceof HTMLElement) return losingFocus;
    return null;
  },
}: {
  /** Focused is restored when this returns true. */
  restoreWhen: () => boolean;
  /** Select element to restore focus to. Defaults to previously focused element. */
  selectRestoreElement?: (event: FocusEvent<HTMLElement>) => HTMLElement | null;
}) {
  const restoreElement = useRef<HTMLElement | null>(null);
  const restore = restoreWhen();

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const _restoreElement = selectRestoreElement(event);

      if (_restoreElement) {
        restoreElement.current = _restoreElement;
      }
    },
    [selectRestoreElement]
  );

  useEffect(
    function restoreFocus() {
      if (restore && restoreElement.current) {
        restoreElement.current.focus();
        restoreElement.current = null;
      }
    },
    [restore]
  );

  return {
    handleFocus,
  };
}

export { useRestoreFocus };
