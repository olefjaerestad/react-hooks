import { diff, ObjectDiff, PrimitiveDiff } from './diff';

describe('diff', () => {
  describe('should return a diff object for', () => {
    it('non-equal primitive values', () => {
      expect(diff('foo', 'bar')).toEqual<PrimitiveDiff>({
        _diff: {
          prev: 'foo',
          current: 'bar',
        },
      });
      expect(diff(1, true)).toEqual<PrimitiveDiff>({
        _diff: {
          prev: 1,
          current: true,
        },
      });
    });

    it('non-equal (by reference) arrays', () => {
      expect(diff([1, 2, 3], [1, 2, 3])).toEqual<PrimitiveDiff>({
        _diff: {
          prev: [1, 2, 3],
          current: [1, 2, 3],
        },
      });
    });

    it('non-equal (by reference) functions', () => {
      const fn1 = () => 1;
      const fn2 = () => 1;

      expect(diff(fn1, fn2)).toEqual<PrimitiveDiff>({
        _diff: {
          prev: fn1,
          current: fn2,
        },
      });
    });

    it('non-equal (by value) objects', () => {
      const prev = {
        foo: 'bar',
        person: {
          age: 30,
          names: {
            first: 'Jack',
            last: 'Jackson',
          },
        },
      };
      const current = {
        foo: 'baz',
        person: {
          age: 30,
          names: {
            first: 'Jack',
            last: 'Johnson',
          },
        },
      };

      expect(diff(prev, current)).toEqual<ObjectDiff>({
        foo: {
          _diff: {
            prev: 'bar',
            current: 'baz',
          },
        },
        person: {
          names: {
            last: {
              _diff: {
                prev: 'Jackson',
                current: 'Johnson',
              },
            },
          },
        },
      });
    });

    it('non-equal (by value) objects with different keys', () => {
      const prev = {
        foo: 'bar',
        location: {
          coordinates: {
            lat: 12.456,
            long: 7.89,
          },
        },
        person: {
          age: 30,
          names: {
            firstName: 'Jack',
            lastName: 'Jackson',
          },
        },
      };
      const current = {
        bar: 'bar',
        person: {
          age: 30,
          hobbies: ['Soccer', 'Video games'],
          names: {
            first: 'Jack',
            last: 'Johnson',
          },
        },
      };

      expect(diff(prev, current)).toEqual<ObjectDiff>({
        foo: {
          _diff: {
            prev: 'bar',
            current: undefined,
          },
        },
        bar: {
          _diff: {
            prev: undefined,
            current: 'bar',
          },
        },
        location: {
          _diff: {
            prev: {
              coordinates: {
                lat: 12.456,
                long: 7.89,
              },
            },
            current: undefined,
          },
        },
        person: {
          hobbies: {
            _diff: {
              prev: undefined,
              current: ['Soccer', 'Video games'],
            },
          },
          names: {
            first: {
              _diff: {
                prev: undefined,
                current: 'Jack',
              },
            },
            firstName: {
              _diff: {
                prev: 'Jack',
                current: undefined,
              },
            },
            last: {
              _diff: {
                prev: undefined,
                current: 'Johnson',
              },
            },
            lastName: {
              _diff: {
                prev: 'Jackson',
                current: undefined,
              },
            },
          },
        },
      });
    });
  });

  describe('should return undefined for', () => {
    it('equal primitive values', () => {
      expect(diff('foo', 'foo')).toEqual(undefined);
      expect(diff(1, 1)).toEqual(undefined);
    });

    it('equal (by reference) arrays', () => {
      const arr = [1, 2, 3];
      expect(diff(arr, arr)).toEqual(undefined);
    });

    it('equal (by reference) functions', () => {
      const fn = () => 1;
      expect(diff(fn, fn)).toEqual(undefined);
    });

    it('equal (by value) objects', () => {
      expect(diff({ foo: 'bar' }, { foo: 'bar' })).toEqual(undefined);
    });

    it('empty objects', () => {
      expect(diff({}, {})).toEqual(undefined);
    });
  });

  describe('should handle edge cases', () => {
    it("don't treat null as object", () => {
      expect(diff(null, null)).toEqual(undefined);
    });

    it('compare primitive values to objects', () => {
      expect(diff('foo', { bar: 'baz' })).toEqual<PrimitiveDiff>({
        _diff: {
          prev: 'foo',
          current: { bar: 'baz' },
        },
      });
      expect(diff({ bar: 'baz' }, 'foo')).toEqual<PrimitiveDiff>({
        _diff: {
          prev: { bar: 'baz' },
          current: 'foo',
        },
      });
    });
  });
});
