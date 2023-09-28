import { useCallback, useRef, useState } from 'react';

type IReversibleDispatch<T extends unknown> = (value: IReversibleSetStateAction<T>) => IUndoFunction;
type IReversibleSetStateAction<T extends unknown> = T | ((current: T, previous: T) => T);
type IUndoFunction = () => void;

/**
 * A hook to achieve reversible state changes. Useful for example with
 * optimistic updates and rollback on error.
 *
 * Works like `useState`, with the exception that the callback function in
 * `setState` now takes a second parameter `previousState`. This enables
 * easy rollback of the previous state update. If you don't want to manage the
 * rollback yourself, `setState` also returns a parameterless `undo` function
 * that undoes the state change.
 *
 * Note: if you're using something like React Query, this already has it's own
 * way of doing optimistic updates and rollbacks. 
 * See https://tanstack.com/query/v4/docs/react/guides/optimistic-updates.
 *
 * @example
 * const [name, setName] = useState('John');
 *
 * async function updateName(newName: string) {
 *   const undo = setName(newName);
 *   try {
 *     await saveName(newName);
 *   } catch {
 *     setName((current, previous) => previous);
 *     // OR
 *     undo();
 *   }
 * }
 *
 * <p>{name}</p>
 */
export function useReversible(initialValue?: undefined): [undefined, IReversibleDispatch<undefined>];
export function useReversible<T extends unknown>(initialValue: T): [T, IReversibleDispatch<T>];
export function useReversible<T extends unknown>(initialValue?: T): [T | undefined, IReversibleDispatch<T | undefined>];
export function useReversible<T extends unknown>(initialValue: T): [T, IReversibleDispatch<T>] {
  const prevValue = useRef<T>(initialValue);
  const [value, setValue] = useState(initialValue);

  const setValueReversible: IReversibleDispatch<T> = useCallback((val) => {
    let c: T;
    let p: T = prevValue.current;

    setValue((current) => {
      // @ts-ignore: Type 'T & Function' has no call signatures.
      const newValue = typeof val === 'function' ? val(current, prevValue.current) : val;
      c = newValue;
      if (newValue !== current) {
        prevValue.current = current;
        p = current;
      }
      return newValue;
    });

    return function undo() {
      setValue(() => {
        prevValue.current = p;
        return p;
      });
    };
  }, []);

  return [value, setValueReversible];
}
