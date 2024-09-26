import { MutableRefObject, RefObject, useEffect, useRef } from 'react';
import { throttle } from '../time/utils/throttle'; // https://github.com/olefjaerestad/frontend-snippets/blob/main/throttle.ts

interface Options {
  /** The element used for checking available space above and below. */
  anchor: RefObject<HTMLElement> | MutableRefObject<HTMLElement>;
  /** Disable the hook. Useful for not running unnecessary calculations. */
  disabled?: boolean;
  /** The element to position above or below `options.anchor`. */
  floater: RefObject<HTMLElement> | MutableRefObject<HTMLElement>;
}

interface Intersection {
  top: number;
  bottom: number;
}

/**
 * Calculates the intersection between (`options.anchor` + height of
 * `options.floater`) and viewport edge. Use to determine whether
 * `options.floater` can be positioned directly above or below `options.anchor`
 * without being positioned outside of the viewport. Useful when creating
 * "floating" UI elements, e.g. tooltips, dropdowns, etc.
 * The hook doesn't return anything, but sets CSS custom properties on
 * `options.floater` that can be used for positioning.
 *
 * Inspired by {@link https://floating-ui.com/docs/useFloating Floating UI's useFloating hook}
 *
 * Note: this is a work in progress. The hook name and API is unstable and subject to change.
 * Known issues:
 * - If `options.floater` is an invisible element (e.g. a dialog) that becomes
 *   visible the same moment as `options.disabled` becomes `false`, the
 *   caluclation will be off on first attempt, meaning you risk a "flash of
 *   incorrectly positioned element". A potential fix for this could be to add
 *   CSS custom properties to an element that's guaranteed to always be on the
 *   page and visible, instead of to `options.floater`.
 *
 * TODO: Add to github?
 *
 * @example
 * ```tsx
 * const anchorRef = useRef<HTMLDivElement>(null);
 * const floaterRef = useRef<HTMLDivElement>(null);
 * useIntersection({ anchor: anchorRef, floater: floaterRef });
 *
 * <div ref={anchorRef} style={{position: 'relative'}}>
 *   <div ref={floaterRef} style={{
 *     position: 'absolute',
 *     // Custom properties are set by the hook. Will be `auto` or not set.
 *     // Use `var()` fallback value to position floater.
 *     top: 'var(--intersection-top, 100%)',
 *     bottom: 'var(--intersection-bottom, 100%)'
 *   }}>Floater</div>
 * </div>
 * ```
 */
function useIntersection(options: Options) {
  const anchorRect = useRef<DOMRect | null>(null);
  const floaterRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    // if (options.disabled) return;

    const handleScroll = throttle(() => {
      anchorRect.current =
        options.anchor.current?.getBoundingClientRect() || anchorRect.current;
      floaterRect.current =
        options.floater.current?.getBoundingClientRect() || floaterRect.current;
      // anchorRect.current = await tryRectangleFor(options.anchor.current, 100) || anchorRect.current;
      // floaterRect.current = await tryRectangleFor(options.floater.current, 100) || floaterRect.current;

      // prettier-ignore
      // intersection.current = anchorRect.current && floaterRect.current
      //   ? {
      //       top: anchorRect.current.top - floaterRect.current.height,
      //       bottom: window.innerHeight - anchorRect.current.bottom - floaterRect.current.height,
      //     }
      //   : { top: 0, bottom: 0 };
      // Does some naive intersection calculations even when floater is not
      // present/visible. This must be improved to prevent a "flash of
      // incorrectly positioned element".
      const intersection: Intersection = {
        top: (anchorRect.current?.top || 0) - (floaterRect.current?.height || 0),
        bottom: window.innerHeight - (anchorRect.current?.bottom || 0) - (floaterRect.current?.height || 0),
      };

      options.floater.current?.style.removeProperty('--intersection-bottom');
      options.floater.current?.style.removeProperty('--intersection-top');

      // prettier-ignore
      if (intersection.bottom >= 0) {
        options.floater.current?.style.setProperty('--intersection-bottom', 'auto');
      } else if (intersection.top >= 0) {
        options.floater.current?.style.setProperty('--intersection-top', 'auto');
      }
    }, 100);

    requestIdleCallback(handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [options.anchor, options.disabled, options.floater]);
}

/**
 * Tries to get the bounding client rect of an element for `timeout`
 * milliseconds. If the rect cannot be retrieved, the returned promise rejects.
 */
// function tryRectangleFor(el: HTMLElement | null, timeout: number): Promise<DOMRect> {
//   const startTime = Date.now();

//   return new Promise<DOMRect>((resolve, reject) => {
//     const interval = setInterval(() => {
//       const rect = el?.getBoundingClientRect();
//       if (rect) {
//         clearInterval(interval);
//         resolve(rect);
//       } else if (Date.now() - startTime > timeout) {
//         clearInterval(interval);
//         reject('tryRectangleFor: unable to find rectangle before timeout');
//       }
//     }, 0);
//   });
// }

export { useIntersection };
export type { Intersection };
