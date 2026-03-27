import { useEffect, useState } from 'react';
import { runWhen } from '../../../time/utils/run-when'; // https://github.com/olefjaerestad/frontend-snippets/blob/main/run-when.ts

type Position =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'right-start'
  | 'right-center'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'left-start'
  | 'left-center'
  | 'left-end';

/**
 * Invert the position of a popover element when it's not fully visible in the
 * viewport. This is useful for popovers that need to be repositioned when they
 * are opened, such as tooltips or dropdowns.
 *
 * The implementation is intentionally relatively naive (for performance
 * reasons); if the popover is not fully visible within the viewport, the 
 * position will be inverted, even if there's not enough available space in the
 * inverse direction. Also, the positioning only happens when `disabled` changes,
 * so make sure to disable the hook when the popup is closed and enable it when
 * the popup is open.
 *
 * Returns an object containing a `Position` that can be passed to the `position`
 * prop of `<Popover.Popup />` or `<Popover.FixedPopup />`. The returned object
 * also contains an opacity value that can be used as inline style; this is
 * simply a fix for certain browsers to prevent a flash of incorrect position.
 *
 * @example
 *
 * ```tsx
 * const { opacity, position } = useInversePosition({
 *   disabled: !open,
 *   elementId: 'my-popover',
 *   originalPosition: 'top-center',
 * });
 *
 * <Popover.Popup
 *   id="my-popover"
 *   open={open}
 *   position={position}
 *   style={{ opacity }}
 * >
 *   <p>Popover content</p>
 * </Popover.Popup>
 * ```
 */
function useInversePosition({
  disabled,
  elementId,
  originalPosition,
}: {
  /** Disable the hook. Usually used when the popover is closed. */
  disabled?: boolean;
  /** The ID of the Popover (we use this instead of using a `ref`). */
  elementId: string;
  /**
   * The position we originally want the Popover to have. Unless there's a need
   * to inverse position, the hook will return this value.
   */
  originalPosition: Position;
}) {
  const [position, setPosition] = useState<Position>(originalPosition);
  // Safari/mobile fix: in the case we need to flip popup Y position, setting
  // opacity to 0 before the flip, then removing it afterwards, prevents the
  // popup flashing for a brief moment in the wrong Y position.
  const [opacity, setOpacity] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (disabled) return;

    const popup = document.getElementById(elementId);
    if (!popup) return;

    setOpacity(0);

    const observerX = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio < 1) {
            setPosition((current) => INVERSE_POSITION_X_MAP[current]);
          }

          setOpacity(undefined);

          // We only care about repositioning upon opening.
          observerX.disconnect();
        });
      },
      {
        root: document,
        // We only care about the X axis (requires `root`).
        // @see https://stackoverflow.com/a/68714239
        rootMargin: '100% 0% 100% 0%',
        threshold: 0,
      }
    );

    const observerY = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio < 1) {
            setPosition((current) => INVERSE_POSITION_Y_MAP[current]);
          }

          setOpacity(undefined);

          // We only care about repositioning upon opening.
          observerY.disconnect();
        });
      },
      {
        root: document,
        // We only care about the Y axis (requires `root`).
        // @see https://stackoverflow.com/a/68714239
        rootMargin: '0% 100% 0% 100%',
        threshold: 0,
      }
    );

    const intervalId = runWhen(
      () => {
        observerX.observe(popup);
        observerY.observe(popup);
      },
      () => {
        // Observing position in a closed dialog will return misleading results.
        if ('open' in popup) {
          return (popup as HTMLDialogElement).open;
        }

        return document.body.contains(popup);
      }
    );

    return () => {
      clearInterval(intervalId);
      observerX.disconnect();
      observerY.disconnect();
    };
  }, [disabled, elementId]);

  useEffect(() => {
    setPosition(originalPosition);
  }, [originalPosition]);

  useEffect(() => {
    if (disabled) {
      setPosition(originalPosition);
      setOpacity(undefined);
    }
  }, [disabled, originalPosition]);

  return {
    opacity,
    position,
  };
}

const INVERSE_POSITION_X_MAP: Record<Position, Position> = {
  'top-start': 'top-end',
  'top-center': 'top-center',
  'top-end': 'top-start',
  'right-start': 'left-start',
  'right-center': 'left-center',
  'right-end': 'left-end',
  'bottom-start': 'bottom-end',
  'bottom-center': 'bottom-center',
  'bottom-end': 'bottom-start',
  'left-start': 'right-start',
  'left-center': 'right-center',
  'left-end': 'right-end',
};
const INVERSE_POSITION_Y_MAP: Record<Position, Position> = {
  'top-start': 'bottom-start',
  'top-center': 'bottom-center',
  'top-end': 'bottom-end',
  'right-start': 'right-end',
  'right-center': 'right-center',
  'right-end': 'right-start',
  'bottom-start': 'top-start',
  'bottom-center': 'top-center',
  'bottom-end': 'top-end',
  'left-start': 'left-end',
  'left-center': 'left-center',
  'left-end': 'left-start',
};

export { useInversePosition };
