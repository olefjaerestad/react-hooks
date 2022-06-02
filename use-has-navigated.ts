/**
 * The first version is for react-router-dom v5, the second one is for react-router-dom v6.
 */

import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

let hasNavigated: boolean = false;
let isListening: boolean = false;

/**
 * Returns true or false depending on whether a navigation (i.e. route change)
 * has happened or not during the lifetime of the application.
 * Pass the `resetOnComponentUnmount` argument to reset navigation status
 * when component unmounts.
 * Requires react-router-dom < 6.
 */
export function useHasNavigated(resetOnComponentUnmount: boolean = false) {
  const history = useHistory();

  useEffect(() => {
    let unlisten: ReturnType<typeof history.listen> | undefined;

    if (!isListening) {
      // We only need to start listening once.
      unlisten = history.listen(() => {
        hasNavigated = true;
        unlisten?.();
      });
      
      isListening = true;
    }

    return () => {
      unlisten?.();

      if (unlisten) {
        isListening = false;
      }
      if (resetOnComponentUnmount) {
        hasNavigated = false;
      }
    };
  }, [isListening, resetOnComponentUnmount]);

  return hasNavigated;
}

/** ------------------------------------------------- */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

let hasNavigated = false;

/**
 * Returns true or false depending on whether a navigation (i.e. route change)
 * has happened or not during the lifetime of the application.
 * Pass the `resetOnComponentUnmount` argument to reset navigation status
 * when component unmounts.
 * Requires react-router-dom >= 6.
 */
export function useHasNavigated(resetOnComponentUnmount = false) {
  const { pathname } = useLocation();
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      hasNavigated = true;
    }
  }, [pathname, prevPathname]);

  useEffect(() => {
    return () => {
      if (resetOnComponentUnmount) {
        hasNavigated = false;
      }
    };
  }, [resetOnComponentUnmount]);

  return hasNavigated;
}
