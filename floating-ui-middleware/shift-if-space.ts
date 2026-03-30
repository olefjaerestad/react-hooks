import { shift } from '@floating-ui/react';
import { isOutsideViewport, popoverIsOpen } from './middleware-utils';

type AutoPositioningStrategy = 'shift-mainaxis' | 'shift-crossaxis';

/**
 * @see https://floating-ui.com/docs/shift
 */
function shiftIfSpaceMiddleware(strategies: AutoPositioningStrategy[]) {
  return shift(({ elements, rects, placement }) => {
    if (
      !popoverIsOpen(elements.floating) ||
      isOutsideViewport(elements.reference)
    ) {
      return { crossAxis: false, mainAxis: false };
    }

    let mainAxis = false;
    let crossAxis = false;

    // If `floating` is smaller than viewport, we enable shifting.
    // prettier-ignore
    if (placement.startsWith('top') || placement.startsWith('bottom')) {
      mainAxis = strategies.includes('shift-mainaxis') && rects.floating.width < document.documentElement.clientWidth; // x-axis
      crossAxis = strategies.includes('shift-crossaxis') && rects.floating.height < document.documentElement.clientHeight; // y-axis
    }
    // prettier-ignore
    if (placement.startsWith('left') || placement.startsWith('right')) {
      mainAxis = strategies.includes('shift-mainaxis') && rects.floating.height < document.documentElement.clientHeight; // y-axis
      crossAxis = strategies.includes('shift-crossaxis') && rects.floating.width < document.documentElement.clientWidth; // x-axis
    }

    return {
      crossAxis,
      mainAxis,
    };
  });
}

export { shiftIfSpaceMiddleware };
