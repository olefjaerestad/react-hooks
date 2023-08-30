import { useState, useEffect } from 'react';

/**
 * Note: You probably want to use `useReversible` instead of `useOptimistic`: https://github.com/olefjaerestad/react-hooks/blob/main/use-reversible.ts
 * 
 * A hook to achieve optimistic updates.
 *
 * Works like `useState`, with the exception that `state` changes to match
 * `source` whenever `source` changes.
 *
 * A custom implementation of React's experimental `useOptimistic`.
 *
 * Note: this has not been tested out in the wild.
 *
 * @example
 * const [name, setName] = useState('John');
 * const [optimisticName, setOptimisticName] = useOptimistic(name);
 *
 * async function updateName(newName: string) {
 *   setOptimisticName(newName);
 *   try {
 *      await saveName(newName);
 *      setName(newName);
 *   } catch {
 *     setOptimisticName(name);
 *   }
 * }
 *
 * <p>{optimisticName}</p>
 *
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#experimental-useoptimistic
 */
export function useOptimistic<T extends any>(source: T) {
  const [value, setValue] = useState(source);

  useEffect(() => {
    setValue(source);
  }, [source]);

  return [value, setValue];
}
