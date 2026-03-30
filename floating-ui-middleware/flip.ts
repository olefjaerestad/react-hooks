import { flip } from '@floating-ui/react';
import { isOutsideViewport, popoverIsOpen } from './middleware-utils';

type AutoPositioningStrategy = 'flip-mainaxis' | 'flip-crossaxis';

/**
 * @see https://floating-ui.com/docs/flip
 */
function flipMiddleware(strategies: AutoPositioningStrategy[]) {
  return flip(({ elements }) => {
    if (
      !popoverIsOpen(elements.floating) ||
      isOutsideViewport(elements.reference)
    ) {
      return { crossAxis: false, mainAxis: false };
    }

    return {
      crossAxis: strategies.includes('flip-crossaxis'),
      mainAxis: strategies.includes('flip-mainaxis'),
    };
  });
}

export { flipMiddleware };
