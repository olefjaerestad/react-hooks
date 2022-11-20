import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { StateNamespace, useStateDevTools } from './';

describe('useStateDevTools', () => {
  it('should return the provided `useState` result as is', async () => {
    const { result } = renderHook(() => useStateDevTools(useState(1)));
    const [state, setState] = result.current;
    expect(state).toBe(1);

    act(() => setState(2));
    // Must use `result.current[0]` instead of `state` to access updated value.
    expect(result.current[0]).toBe(2);
  });

  it('should store diffs in the global object', async () => {
    const name = 'uniqueName';
    const { result } = renderHook(() => useStateDevTools(useState('foo'), name));
    const [, setState] = result.current;

    act(() => setState('bar'));
    act(() => setState('baz'));

    expect(globalThis._STATE_DEV_TOOLS_.stateNamespaces[name]).toEqual<StateNamespace>({
      stateEntries: [
        {
          diff: {
            _diff: {
              a: 'foo',
              b: 'bar',
            },
          },
        },
        {
          diff: {
            _diff: {
              a: 'bar',
              b: 'baz',
            },
          },
        },
      ],
    });
  });
});
