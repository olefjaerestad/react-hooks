import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * Works like `useState`, with the exception that `value` changes to match
 * `initialValue` whenever `initialValue` changes.
 *
 * Note: be aware that this goes against React best practises; component state
 * normally should not be derived from props. In most cases, you'll want to use
 * `useMemo` instead. `useInitial` is for those rare cases where you need
 * derived state that you also need to update from within the component.
 * Be aware that this could cause `initialValue` and `value` to be out of sync.
 *
 * @example
 * const [name, setName] = useInitial(props.name);
 *
 * function updateName(newName: string) {
 *   setName(newName);
 * }
 */
function useDerived<T>(initialValue: T): [value: T, setValue: Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return [value, setValue];
}

export { useDerived };
