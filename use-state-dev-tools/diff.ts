export interface PrimitiveDiff {
  _diff: {
    prev: any;
    current: any;
  };
}

export type ObjectDiff = {
  [key: string | number | symbol]: PrimitiveDiff | ObjectDiff;
};

export type Diff = PrimitiveDiff | ObjectDiff;

type Primitive = string | number | bigint | boolean | symbol | null | undefined;

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
export const diff = (prev: any, current: any): Diff | undefined => {
  if (isObject(prev) && isObject(current)) {
    const keys = Array.from(
      new Set([...Object.keys(prev), ...Object.keys(current)])
    );

    const diffs: ObjectDiff = keys.reduce((diffs, key) => {
      const difff = diff(prev[key], current[key]);
      if (difff) diffs[key] = difff;

      return diffs;
    }, {} as ObjectDiff);

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

/**
 * Apply the provided `diff` to the provided `originalValue`.
 * The `to` parameter controls whether the 'current' or 'prev' values of the
 * diff will be used (allows time traveling back and forth between states).
 */
export const applyDiff = <T>(
  originalValue: T,
  diff: Diff,
  to: 'current' | 'prev' = 'current'
) => {
  if (isPrimitiveDiff(diff) && isPrimitive(diff._diff[to])) {
    return diff._diff[to];
  }

  const result = isObject(originalValue)
    ? { ...originalValue }
    : isArray(originalValue)
    ? [...originalValue]
    : originalValue;

  // TODO: Handle object diffs.
  if (isObject(result) && isObjectDiff(diff)) {
    Object.keys(diff).forEach((key) => {
      result[key as any] = diff[key];
    });
  }
};

const isObject = (value: any): value is Record<any, any> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const isArray = (value: any): value is Array<any> => {
  return Array.isArray(value);
};

const isPrimitive = (value: any): value is Primitive => {
  return !isObject(value) && !isArray(value);
};

const isPrimitiveDiff = (value: any): value is PrimitiveDiff => {
  return (
    isObject(value) &&
    value.hasOwnProperty('_diff') &&
    value._diff?.hasOwnProperty('prev') &&
    value._diff?.hasOwnProperty('current') &&
    Object.keys(value._diff).length === 2
  );
};

const isObjectDiff = (value: any): value is ObjectDiff => {
  return isObject(value) && !value.hasOwnProperty('_diff');
};
