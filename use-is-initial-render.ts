import { useEffect, useState } from 'react';

/**
 * Check if current render is the first one.
 *
 * @example
 * const isInitialRender = useIsInitialRender();
 */
export function useIsInitialRender() {
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  return isInitialRender;
}
