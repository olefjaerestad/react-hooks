import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { useStateDevTools } from './use-state-dev-tools';

describe('useStateDevTools', () => {
  it('should return the provided `useState` result as is', async () => {
    const { result } = renderHook(() => useStateDevTools(useState(1)));
    const [state, setState] = result.current;
    expect(state).toBe(1);

    act(() => setState(2));
    // Must use `result.current[0]` instead of `state` to access updated value.
    expect(result.current[0]).toBe(2);
  });
});
