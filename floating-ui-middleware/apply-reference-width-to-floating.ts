import { size } from '@floating-ui/react';
import { isOutsideViewport, popoverIsOpen } from './middleware-utils';

/**
 * @see https://floating-ui.com/docs/size
 */
function applyReferenceWidthToFloatingMiddleware(
  property: 'maxWidth' | 'minWidth' | 'width'
) {
  return size({
    apply: ({ rects, elements }) => {
      if (
        !popoverIsOpen(elements.floating) ||
        isOutsideViewport(elements.floating)
      ) {
        return;
      }

      elements.floating.style[property] = `${rects.reference.width}px`;
    },
  });
}

export { applyReferenceWidthToFloatingMiddleware };
