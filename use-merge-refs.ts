import { ForwardedRef, useCallback } from 'react';

/**
 * Merges multiple refs into a single ref. Returns a function that can be used
 * in a component's `ref` prop.
 *
 * @example
 * return <input ref={mergeRefs(ref1, ref2, ref3)} />
 */
function mergeRefs<T>(...refs: Array<ForwardedRef<T> | undefined>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (typeof ref === 'object' && ref) {
        ref.current = value;
      }
    });
  };
}

/**
 * Merges multiple refs into a single ref. Returns a memoized function that can
 * be used in a component's `ref` prop.
 *
 * @example
 * const ref = useMergeRefs(ref1, ref2, ref3);
 * ...
 * return <input ref={ref} />
 */
function useMergeRefs<T>(...refs: Array<ForwardedRef<T> | undefined>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(mergeRefs(...refs), refs);
}

export { mergeRefs, useMergeRefs };
