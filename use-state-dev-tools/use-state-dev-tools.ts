import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { diff } from './diff';

type UseStateReturnValue<S> = [S, Dispatch<SetStateAction<S>>];

/**
 * This hook, accompanied by the corresponding Chrome extension, aims to
 * reproduce parts of the Redux DevTools functionality, only for `useState`
 * instead of Redux.
 *
 * TODO:
 * - Store diffs in globalThis and allow state time travel.
 * - Remove console.logs.
 * - Document all the things.
 *
 * @example
 * // Just wrap your `useState` with this hook.
 * const [name, setName] = useStateDevTools(useState(''));
 */
export function useStateDevTools<S>(
  useStateValue: UseStateReturnValue<S>
): UseStateReturnValue<S> {
  const [val, setVal] = useStateValue;
  const prevVal = useRef(val);

  // const setter: Dispatch<SetStateAction<S>> = useCallback(
  //   (value: SetStateAction<S>) => {
  //     setVal(value);
  //   },
  //   []
  // );

  useEffect(() => {
    console.log(
      prevVal.current,
      val,
      diff(prevVal.current, val),
      '------------------------'
      // diff(JSON.stringify(val), JSON.stringify(prevVal.current))
    );

    prevVal.current = val;
  }, [val]);

  return [val, setVal];
}
