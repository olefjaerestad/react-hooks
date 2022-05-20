import { MutableRefObject, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

/**
 * Scroll a given element into view on navigation (i.e. route change).
 * Requires react-router-dom.
 */
export function useScrollIntoViewOnNavigation(
  ref: MutableRefObject<HTMLElement | undefined>
) {
  const history = useHistory();

  useEffect(() => {
    const unlisten = history.listen(() => {
      ref.current?.scrollIntoView();
    });

    return () => {
      unlisten();
    };
  }, []);
}
