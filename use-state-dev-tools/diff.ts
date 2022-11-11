export interface PrimitiveDiff {
  _diff: {
    prev: any;
    current: any;
  };
}

export type ObjectDiff = {
  [key: string | number | symbol]: PrimitiveDiff | ObjectDiff;
};

/**
 * Compares two values and returns the difference between them. Deeply compares
 * objects; both `prev` and `current` must be objects for object comparison to
 * take effect.
 * - Compared by value: primitive values, objects.
 * - Compared by reference: arrays, functions.
 *
 * A diff is represented by a `PrimitiveDiff`. The expeception is objects,
 * which have their diffs represented by an `ObjectDiff`, which is basically
 * just a recursive `PrimitiveDiff`.
 * 
 * @example
 * // {
 * //   _diff: {
 * //     prev: 'foo',
 * //     current: 'bar',
 * //   },
 * // };
 * diff('foo', 'bar');
 
 * // {
 * //   foo: {
 * //     _diff: {
 * //       prev: 'bar',
 * //       current: 'baz',
 * //     },
 * //   },
 * // }
 * diff({foo: 'bar'}, {foo: 'baz'});
 */
export const diff = (
  prev: any,
  current: any
): ObjectDiff | PrimitiveDiff | undefined => {
  if (isObject(prev) && isObject(current)) {
    const diffs: Record<any, any> = {};
    const keys = Array.from(
      new Set([...Object.keys(prev), ...Object.keys(current)])
    );

    keys.forEach((key) => {
      const difff = diff(prev[key], current[key]);
      if (difff) {
        diffs[key] = difff;
      }
    });

    if (!Object.keys(diffs).length) return;
    return diffs;
  }

  return prev !== current
    ? {
      _diff: {
        prev,
        current,
      },
    }
    : undefined;
};

const isObject = (value: any): value is Record<any, any> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};
