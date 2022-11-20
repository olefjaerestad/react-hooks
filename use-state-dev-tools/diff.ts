export interface PrimitiveDiff {
  _diff: {
    a: any;
    b: any;
  };
}

export type ObjectDiff = {
  [key: string | number | symbol]: PrimitiveDiff | ObjectDiff;
};

export type Diff = PrimitiveDiff | ObjectDiff;

// type Primitive = string | number | bigint | boolean | symbol | null | undefined;

/**
 * Compares two values and returns the difference between them. Deeply compares
 * objects; both `a` and `b` must be objects for object comparison to take 
 * effect.
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
 * //     a: 'foo',
 * //     b: 'bar',
 * //   },
 * // };
 * diff('foo', 'bar');
 
 * // {
 * //   foo: {
 * //     _diff: {
 * //       a: 'bar',
 * //       b: 'baz',
 * //     },
 * //   },
 * // }
 * diff({foo: 'bar'}, {foo: 'baz'});
 */
export const diff = (a: any, b: any): Diff | undefined => {
  if (isObject(a) && isObject(b)) {
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));

    const diffs: ObjectDiff = keys.reduce((diffs, key) => {
      const difff = diff(a[key], b[key]);
      if (difff) diffs[key] = difff;

      return diffs;
    }, {} as ObjectDiff);

    if (!Object.keys(diffs).length) return;
    return diffs;
  }

  return a !== b
    ? {
        _diff: {
          a: a,
          b: b,
        },
      }
    : undefined;
};

/**
 * Applies the provided `diff` to the provided `originalValue`, and returns a
 * shallow copy of `originalValue`.
 * The `to` parameter controls whether the 'a' or 'b' values of the
 * diff will be used (allows time traveling back and forth between states).
 */
export const applyDiff = <T>(originalValue: T, diff: Diff | undefined, to: 'a' | 'b' = 'b') => {
  baseCase: if (isPrimitiveDiff(diff)) {
    return diff._diff[to];
  }

  const result = isObject(originalValue)
    ? { ...originalValue }
    : isArray(originalValue)
    ? [...originalValue]
    : originalValue;

  if (!diff) {
    return result;
  }

  if (isObject(result) && isObjectDiff(diff)) {
    Object.keys(diff).forEach((key) => {
      result[key as any] = applyDiff(result[key as any], diff[key], to);
    });

    return result;
  }

  return undefined;
};

const isObject = (value: any): value is Record<any, any> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const isArray = (value: any): value is Array<any> => {
  return Array.isArray(value);
};

// const isPrimitive = (value: any): value is Primitive => {
//   return !isObject(value) && !isArray(value);
// };

const isPrimitiveDiff = (value: any): value is PrimitiveDiff => {
  return (
    isObject(value) &&
    value.hasOwnProperty('_diff') &&
    value._diff?.hasOwnProperty('a') &&
    value._diff?.hasOwnProperty('b') &&
    Object.keys(value._diff).length === 2
  );
};

const isObjectDiff = (value: any): value is ObjectDiff => {
  return isObject(value) && !value.hasOwnProperty('_diff');
};
