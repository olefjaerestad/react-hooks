import { useCallback, useEffect, useRef } from "react";
import { Location, useLocation } from "react-router-dom";

type Listen = (callback: ListenCallback) => Unlisten;
type ListenCallback = (props: ListenCallbackParams) => void;
type Unlisten = () => void;
interface ListenCallbackParams {
  location: Location;
}

/**
 * Listen for URL changes. Requires react-router-dom >= 5.
 * 
 * `history.listen` was removed between react-router-dom version 5 and 6.
 * This hook aims to serve as a drop-in replacement.
 * 
 * Returns a listen function that can be used to listen to URL changes. The 
 * listen function returns an unlisten function used to stop listening.
 * 
 * @example
 * const historyListen = useHistoryListen();
 * 
 * useEffect(() => {
 *   const unlisten = historyListen(({location}) => {
 *     console.log(location);
 *   });
 * 
 *   return function cleanup() {
 *     unlisten();
 *   };
 * }, []);
 * 
 * @see https://v5.reactrouter.com/web/api/history
 * 
 * @see https://github.com/remix-run/history/blob/main/docs/getting-started.md#listening
 */
export function useHistoryListen(): Listen {
  const location = useLocation();
  const { hash, pathname, search } = location;
  const callbacks = useRef<Set<ListenCallback>>(new Set());

  useEffect(() => {
    callbacks.current.forEach((callback) => {
      callback({location});
    });
  }, [hash, pathname, search]);

  const listen: Listen = useCallback((callback) => {
    callbacks.current.add(callback);

    return () => {
      callbacks.current.delete(callback);
    }
  }, []);

  return listen;
}
