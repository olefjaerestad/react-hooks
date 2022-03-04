import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';

/**
 * Get the path and URL of the current route match, no trailing slash.
 * Path: unresolved route params, e.g. `assignment/:id`.
 * URL: resolved route params, e.g. `assignment/123`.
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
