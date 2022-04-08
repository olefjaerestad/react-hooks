import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

let hasNavigated: boolean = false;
let isListening: boolean = false;

/**
 * Returns true or false depending on whether a navigation (i.e. route change)
 * has happened or not during the lifetime of the application.
 * Requires react-router-dom.
 */
export function useHasNavigated() {
  const history = useHistory();

  useEffect(() => {
    let unlisten: ReturnType<typeof history.listen> | undefined;

    if (!isListening) {
      // We only need to start listening once.
      unlisten = history.listen(() => {
        hasNavigated = true;
      });

      isListening = true;
    }

    return () => {
      unlisten?.();

      if (unlisten) {
        isListening = false;
      }
    };
  }, []);

  return hasNavigated;
}
