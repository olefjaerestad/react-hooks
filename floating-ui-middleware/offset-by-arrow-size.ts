import { offset } from '@floating-ui/react';
import { isOutsideViewport, popoverIsOpen } from './middleware-utils';

/**
 * @see https://floating-ui.com/docs/offset
 */
function offsetByArrowSizeMiddleware(arrowId: string) {
  return offset(({ elements }) => {
    if (
      !popoverIsOpen(elements.floating) ||
      isOutsideViewport(elements.floating)
    ) {
      return 0;
    }

    return document.getElementById(arrowId)?.offsetHeight || 0;
  });
}

export { offsetByArrowSizeMiddleware };
