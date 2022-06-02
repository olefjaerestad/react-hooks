/**
 * The first version is for react-router-dom v5, the second one is for react-router-dom v6.
 */

import { MutableRefObject, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

/**
 * Scroll a given element into view on navigation (i.e. route change).
 * Requires react-router-dom < 6.
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

/** ----------------------------------------------------- */

import { MutableRefObject, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll a given element into view on navigation (i.e. route change).
 * Requires react-router-dom >= 6.
 */
export function useScrollIntoViewOnNavigation(
  ref: MutableRefObject<HTMLElement | undefined>
) {
  const { pathname } = useLocation();
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      ref.current?.scrollIntoView();
    }
  }, [pathname, prevPathname]);
}
