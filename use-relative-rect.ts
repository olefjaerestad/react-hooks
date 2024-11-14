import { useCallback, useState } from 'react';

type RelativeRect = Pick<
  DOMRect,
  'top' | 'bottom' | 'right' | 'left' | 'x' | 'y' | 'width' | 'height'
>;

interface UseRelativeRectReturnValue {
  /**
   * Calculate the `RelativeRect` object of an element, relative to another
   * element.
   *
   * @returns {void} The function doesn't return anything. The calculated value will be available in the `rect` property.
   */
  calculate: (el: HTMLElement, relativeTo: HTMLElement) => void;
  /** The `RelativeRect` value. Calculated by `calculate`. */
  rect: RelativeRect;
  /** Reset the `RelativeRect` value. */
  reset: () => void;
}

/**
 * Get the `RelativeRect` of an element, relative to another element. The
 * difference between a `RelativeRect` and a `DOMRect` is that a `RelativeRect`
 * is relative to another DOM element, while a `DOMRect` is relative to the 
 * viewport.
 *
 * Use the returned functions to calculate the `RelativeRect` when needed.
 *
 * @example
 *
 * ```tsx
 * const relativeToRef = useRef<HTMLDivElement>(null);
 * const elRef = useRef<HTMLDivElement>(null);
 * const { calculate, rect, reset } = useRelativeRect();
 *
 * return (
 *   <div ref={relativeToRef}>
 *     <button onClick={() => calculate(elRef.current, relativeToRef.current)}>Calculate `RelativeRect`</button>
 *     <button onClick={reset}>Reset `RelativeRect`</button>
 *     <div ref={elRef}>
 *       <p>`elRef`'s left side is {rect.left} pixels to the right of `relativeToRef`'s left side.</p>
 *       <p>`elRef`'s right side is {rect.right} pixels to the left of `relativeToRef`'s right side.</p>
 *     <pre>{JSON.stringify(rect, null, 2)}</pre>
 *   </div>
 * );
 * ```
 */
function useRelativeRect(): UseRelativeRectReturnValue {
  const [rect, setRect] = useState<RelativeRect>({
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const calculate = useCallback((el: HTMLElement, relativeTo: HTMLElement) => {
    const rect = relativeRect(el, relativeTo);
    setRect(rect);
  }, []);

  const reset = useCallback(() => {
    setRect({
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  }, []);

  return { calculate, rect, reset };
}

/**
 * Returns the `RelativeRect` object of the provided element `el`.
 * The difference between a `RelativeRect` and a `DOMRect` is that the
 * `RelativeRect` is relative to the provided element `relativeTo`, while the
 * `DOMRect` is relative to the viewport.
 */
function relativeRect(el: HTMLElement, relativeTo: HTMLElement): RelativeRect {
  const elRect = el.getBoundingClientRect();
  const relativeRect = relativeTo.getBoundingClientRect();

  const top = elRect.top - relativeRect.top;
  const bottom = relativeRect.bottom - elRect.bottom;
  const left = elRect.left - relativeRect.left;
  const right = relativeRect.right - elRect.right;
  const width = elRect.width;
  const height = elRect.height;

  return {
    top,
    bottom,
    right,
    left,
    width,
    height,
    x: left,
    y: top,
  };
}

export { relativeRect, useRelativeRect };
export type { RelativeRect };
