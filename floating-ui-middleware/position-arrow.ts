import { arrow } from '@floating-ui/react';
import { isOutsideViewport, popoverIsOpen } from './middleware-utils';

/**
 * @see https://floating-ui.com/docs/arrow
 * 
 * Note: This middleware does mostly the same as the regular `arrow` middleware.
 *       The difference is that this automatically applies the styles directly
 *       to the arrow element, which is useful if you don't have DOM access to
 *       the arrow element yourself.
 */
function positionArrowMiddleware(arrowId: string) {
  return arrow(({ elements, placement, rects }) => {
    const arrowEl = document.getElementById(arrowId);

    if (
      !popoverIsOpen(elements.floating) ||
      isOutsideViewport(elements.floating)
    ) {
      return { element: arrowEl };
    }

    if (arrowEl) {
      const edgeThreshold = '7px';
      let top = '';
      let left = '';

      // Logic for positioning the arrow so that it points towards the center of the reference element.
      switch (placement) {
        case 'top-start':
          top = '100%';
          left = `clamp(${edgeThreshold}, ${rects.reference.width / 2 - arrowEl.offsetWidth / 2}px, calc(100% - ${arrowEl.offsetWidth}px - ${edgeThreshold}))`;
          break;
        case 'top':
          top = '100%';
          left = `calc(50% - ${arrowEl.offsetWidth / 2}px)`;
          break;
        case 'top-end':
          top = '100%';
          left = `clamp(${edgeThreshold}, calc(100% - ${rects.reference.width / 2 + arrowEl.offsetWidth / 2}px), calc(100% - ${arrowEl.offsetWidth}px - ${edgeThreshold}))`;
          break;
        case 'right-start':
          top = `clamp(${edgeThreshold}, ${rects.reference.height / 2 - arrowEl.offsetWidth / 2}px, calc(100% - ${arrowEl.offsetWidth}px - ${edgeThreshold}))`;
          left = `-${arrowEl.offsetHeight}px`;
          break;
        case 'right':
          top = `calc(50% - ${arrowEl.offsetHeight / 2}px)`;
          left = `-${arrowEl.offsetHeight}px`;
          break;
        case 'right-end':
          top = `clamp(${edgeThreshold}, calc(100% - ${rects.reference.height / 2 + arrowEl.offsetHeight / 2}px), calc(100% - ${arrowEl.offsetHeight}px - ${edgeThreshold}))`;
          left = `-${arrowEl.offsetHeight}px`;
          break;
        case 'bottom-start':
          top = `-${arrowEl.offsetHeight}px`;
          left = `clamp(${edgeThreshold}, ${rects.reference.width / 2 - arrowEl.offsetWidth / 2}px, calc(100% - ${arrowEl.offsetWidth}px - ${edgeThreshold}))`;
          break;
        case 'bottom':
          top = `-${arrowEl.offsetHeight}px`;
          left = `calc(50% - ${arrowEl.offsetWidth / 2}px)`;
          break;
        case 'bottom-end':
          top = `-${arrowEl.offsetHeight}px`;
          left = `clamp(${edgeThreshold}, calc(100% - ${rects.reference.width / 2 + arrowEl.offsetWidth / 2}px), calc(100% - ${arrowEl.offsetWidth}px - ${edgeThreshold}))`;
          break;
        case 'left-start':
          top = `clamp(${edgeThreshold}, ${rects.reference.height / 2 - arrowEl.offsetHeight / 2}px, calc(100% - ${arrowEl.offsetHeight}px - ${edgeThreshold}))`;
          left = '100%';
          break;
        case 'left':
          top = `calc(50% - ${arrowEl.offsetHeight / 2}px)`;
          left = '100%';
          break;
        case 'left-end':
          top = `clamp(${edgeThreshold}, calc(100% - ${rects.reference.height / 2 + arrowEl.offsetHeight / 2}px), calc(100% - ${arrowEl.offsetHeight}px - ${edgeThreshold}))`;
          left = '100%';
          break;
      }

      Object.assign(arrowEl.style, {
        left,
        top,
      });
    }

    return {
      element: arrowEl,
    };
  });
}

export { positionArrowMiddleware };
