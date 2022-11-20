import { applyDiff, diff, ObjectDiff, PrimitiveDiff } from './diff';

describe('diff', () => {
  describe('should return a diff object for', () => {
    it('non-equal primitive values', () => {
      expect(diff('foo', 'bar')).toEqual<PrimitiveDiff>({
        _diff: {
          a: 'foo',
          b: 'bar',
        },
      });
      expect(diff(1, true)).toEqual<PrimitiveDiff>({
        _diff: {
          a: 1,
          b: true,
        },
      });
    });

    it('non-equal (by reference) arrays', () => {
      expect(diff([1, 2, 3], [1, 2, 3])).toEqual<PrimitiveDiff>({
        _diff: {
          a: [1, 2, 3],
          b: [1, 2, 3],
        },
      });
    });

    it('non-equal (by reference) functions', () => {
      const fn1 = () => 1;
      const fn2 = () => 1;

      expect(diff(fn1, fn2)).toEqual<PrimitiveDiff>({
        _diff: {
          a: fn1,
          b: fn2,
        },
      });
    });

    it('non-equal (by value) objects', () => {
      const a = {
        foo: 'bar',
        person: {
          age: 30,
          names: {
            first: 'Jack',
            last: 'Jackson',
          },
        },
      };
      const b = {
        foo: 'baz',
        person: {
          age: 30,
          names: {
            first: 'Jack',
            last: 'Johnson',
          },
        },
      };

      expect(diff(a, b)).toEqual<ObjectDiff>({
        foo: {
          _diff: {
            a: 'bar',
            b: 'baz',
          },
        },
        person: {
          names: {
            last: {
              _diff: {
                a: 'Jackson',
                b: 'Johnson',
              },
            },
          },
        },
      });
    });

    it('non-equal (by value) objects with different keys', () => {
      const a = {
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
      const b = {
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

      expect(diff(a, b)).toEqual<ObjectDiff>({
        foo: {
          _diff: {
            a: 'bar',
            b: undefined,
          },
        },
        bar: {
          _diff: {
            a: undefined,
            b: 'bar',
          },
        },
        location: {
          _diff: {
            a: {
              coordinates: {
                lat: 12.456,
                long: 7.89,
              },
            },
            b: undefined,
          },
        },
        person: {
          hobbies: {
            _diff: {
              a: undefined,
              b: ['Soccer', 'Video games'],
            },
          },
          names: {
            first: {
              _diff: {
                a: undefined,
                b: 'Jack',
              },
            },
            firstName: {
              _diff: {
                a: 'Jack',
                b: undefined,
              },
            },
            last: {
              _diff: {
                a: undefined,
                b: 'Johnson',
              },
            },
            lastName: {
              _diff: {
                a: 'Jackson',
                b: undefined,
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
          a: 'foo',
          b: { bar: 'baz' },
        },
      });
      expect(diff({ bar: 'baz' }, 'foo')).toEqual<PrimitiveDiff>({
        _diff: {
          a: { bar: 'baz' },
          b: 'foo',
        },
      });
    });
  });
});

describe('applyDiff', () => {
  describe('should return a value where the diff has been applied for', () => {
    it('primitive diffs', () => {
      const a = 1;
      const b = 2;
      const difff = diff(a, b);
      const result = difff ? applyDiff(a, difff) : undefined;
      expect(result).toEqual(2);
    });

    it('object diffs', () => {
      const a = { foo: 'bar' };
      const b = { foo: 'baz' };
      const difff = diff(a, b);
      const result = difff ? applyDiff(a, difff) : undefined;
      expect(result).toEqual({
        foo: 'baz',
      });
    });
  });

  describe('should support undoing diff for', () => {
    it('primitive diffs', () => {
      const a = 1;
      const b = 2;
      const difff = diff(a, b);
      const result = difff ? applyDiff(b, difff, 'a') : undefined;
      expect(result).toEqual(1);
    });

    // it('object diffs', () => {
    //   const a = { foo: 'bar' };
    //   const b = { foo: 'baz' };
    //   const difff = diff(a, b);
    //   const result = difff ? applyDiff(a, difff) : undefined;
    //   expect(result).toEqual({
    //     foo: 'baz',
    //   });
    // });
  });

  describe('should support step-by-step time-travel for', () => {
    it('primitive diffs', () => {
      // Travel forwards:
      let a = 0;
      const difff1 = diff(a, 1);
      a = difff1 ? applyDiff(a, difff1) : undefined;
      expect(a).toEqual(1);

      const difff2 = diff(a, 2);
      a = difff2 ? applyDiff(a, difff2) : undefined;
      expect(a).toEqual(2);

      const difff3 = diff(a, 3);
      a = difff3 ? applyDiff(a, difff3) : undefined;
      expect(a).toEqual(3);

      // Travel backwards:
      a = difff2 ? applyDiff(a, difff2) : undefined;
      expect(a).toEqual(2);

      a = difff1 ? applyDiff(a, difff1) : undefined;
      expect(a).toEqual(1);

      // And forwards again:
      a = difff2 ? applyDiff(a, difff2) : undefined;
      expect(a).toEqual(2);
    });

    // it('object diffs', () => {
    //   const a = { foo: 'bar' };
    //   const b = { foo: 'baz' };
    //   const difff = diff(a, b);
    //   const result = difff ? applyDiff(a, difff) : undefined;
    //   expect(result).toEqual({
    //     foo: 'baz',
    //   });
    // });
  });
});
