import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { diff } from './diff';
import { storeDiff } from './time-travel';

type UseStateReturnValue<S> = [S, Dispatch<SetStateAction<S>>];

let UNNAMED_CALL_COUNT = 0;

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
 * // Just wrap your `useState` with this hook. Optionally provide a unique name
 * // as the second argument for easier discoverability in the Chrome plugin.
 * const [name, setName] = useStateDevTools(useState(''));
 */
export function useStateDevTools<S>(
  useStateValue: UseStateReturnValue<S>,
  uniqueName?: string
): UseStateReturnValue<S> {
  const [val, setVal] = useStateValue;
  const prevVal = useRef(val);
  const id = useMemo(() => uniqueName || `untitled_${UNNAMED_CALL_COUNT++}`, []);

  // const setter: Dispatch<SetStateAction<S>> = useCallback(
  //   (value: SetStateAction<S>) => {
  //     setVal(value);
  //   },
  //   []
  // );

  useEffect(() => {
    const difff = diff(prevVal.current, val);

    // console
    //   .log
    // prevVal.current,
    // val,
    // difff,
    // id.current,
    // '------------------------'
    // diff(JSON.stringify(val), JSON.stringify(prevVal.current))
    // ();

    if (difff) storeDiff(id.toString(), difff);

    prevVal.current = val;
  }, [val]);

  return [val, setVal];
}
