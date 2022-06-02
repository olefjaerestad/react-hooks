/**
 * The first version is for react-router-dom v5, the second one is for react-router-dom v6.
 */

import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';

/**
 * Get the path and URL of the current route match, no trailing slash.
 *
 * Path: unresolved route params, e.g. `assignment/:id`.
 * URL: resolved route params, e.g. `assignment/123`.
 *
 * Must be used within a `<Route />` element (from react-router-dom).
 * Requires react-router-dom < 6.
 *
 * @example
 * const {routePath, routeUrl} = useRouteUrl();
 */
export function useRouteUrl(): { routePath: string; routeUrl: string } {
  const { path, url } = useRouteMatch();

  const routePath = useMemo(() => {
    return path.endsWith('/') ? path.substring(0, path.length - 1) : path;
  }, [path]);

  const routeUrl = useMemo(() => {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }, [url]);

  return { routePath, routeUrl };
}

/** ---------------------------------------------------------- */

import { useMemo } from 'react';
import { useMatch } from 'react-router-dom';

const STANDALONE_MODE: boolean = process.env.MODE === 'standalone';
/**
 * TODO: Can we avoid hardcoding this? E.g. by using useHref
 * when tollflaten/kontrollstøtte upgrades to react-router-dom v6?
 */
const PATH = STANDALONE_MODE
  ? '/'
  : '/kontrollstotte/assignments/:assignmentId/fixedpenalty';

/**
 * Get the path and URL of the current route match, no trailing slash.
 *
 * Path: unresolved route params, e.g. `assignment/:id`.
 * URL: resolved route params, e.g. `assignment/123`.
 *
 * Must be used within a `<Route />` element (from react-router-dom).
 * Requires react-router-dom >= 6.
 *
 * @example
 * const {routePath, routeUrl} = useRouteUrl();
 */
export function useRouteUrl(): { routePath: string; routeUrl: string } {
  const match = useMatch({
    path: PATH,
    end: false,
  });
  const url = match?.pathname || '/';

  const routePath = useMemo(() => {
    return PATH.endsWith('/') ? PATH.substring(0, PATH.length - 1) : PATH;
  }, [PATH]);

  const routeUrl = useMemo(() => {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }, [url]);

  return { routePath, routeUrl };
}
