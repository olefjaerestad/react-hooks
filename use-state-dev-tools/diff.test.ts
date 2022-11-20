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
      const result = applyDiff(a, difff);
      expect(result).toEqual(2);
    });

    it('array diffs', () => {
      const a = [1, 2, 3];
      const b = [2, 4, 6];
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual([2, 4, 6]);
    });

    it('object diffs', () => {
      const a = { foo: 'bar' };
      const b = { foo: 'baz' };
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual({
        foo: 'baz',
      });
    });

    it('nested object diffs', () => {
      const a = { person: { names: { first: 'Jack', last: 'Jackson' }, skills: { programming: 4 } } };
      const b = { person: { names: { first: 'Jack', last: 'Johnson' }, skills: { programming: 5 } } };
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual({
        person: { names: { first: 'Jack', last: 'Johnson' }, skills: { programming: 5 } },
      });
    });

    it('object diffs where original `a` and `b` objects have different keys', () => {
      const a = { foo: 'bar' };
      const b = { baz: 'lorem' };
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual({
        baz: 'lorem',
        foo: undefined,
      });
    });

    it('nested object diffs where original `a` and `b` objects have different keys', () => {
      const a = { person: { name: 'Jack Jackson', skills: { programming: 4 } } };
      const b = { person: { names: { first: 'Jack', last: 'Jackson' }, skills: { programming: 5 } } };
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual({
        person: { name: undefined, names: { first: 'Jack', last: 'Jackson' }, skills: { programming: 5 } },
      });
    });

    it('diffs where original `a` and `b` values are of different types', () => {
      const a = 1;
      const b = 'foo';
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual('foo');

      const c = 'lorem';
      const d = { foo: { bar: 'baz' } };
      const difff2 = diff(c, d);
      const result2 = applyDiff(c, difff2);
      expect(result2).toEqual({ foo: { bar: 'baz' } });

      const e = undefined;
      const f = { foo: { bar: 'baz' } };
      const difff3 = diff(e, f);
      const result3 = applyDiff(e, difff3);
      expect(result3).toEqual({ foo: { bar: 'baz' } });

      const g = { foo: { bar: 'baz' } };
      const h = undefined;
      const difff4 = diff(g, h);
      const result4 = applyDiff(g, difff4);
      expect(result4).toEqual(undefined);
    });
  });

  describe('should return original value if the diff is empty for', () => {
    it('primitive values', () => {
      const a = 1;
      const b = 1;
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toBe(1);
    });

    it('array values', () => {
      const a = [1, 2, 3];
      const b = [1, 2, 3];
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual([1, 2, 3]);

      const arr = [2, 4, 6];
      const c = arr;
      const d = arr;
      const difff2 = diff(c, d);
      const result2 = applyDiff(c, difff2);
      expect(result2).toBe(arr);
    });

    it('object values', () => {
      const a = { person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } };
      const b = { person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } };
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual({ person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } });

      const obj = { person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } };
      const c = obj;
      const d = obj;
      const difff2 = diff(c, d);
      const result2 = applyDiff(c, difff2);
      expect(result2).toBe(obj);
    });
  });

  describe('should return the diff if original value is empty for', () => {
    it('primitive diffs', () => {
      const a = undefined;
      const b = 1;
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toBe(1);
    });

    it('array diffs', () => {
      const a = undefined;
      const b = [1, 2, 3];
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual([1, 2, 3]);
    });

    it('object diffs', () => {
      const a = undefined;
      const b = { person: { names: { first: 'Jack', last: 'Jackson' } } };
      const difff = diff(a, b);
      const result = applyDiff(a, difff);
      expect(result).toEqual({ person: { names: { first: 'Jack', last: 'Jackson' } } });
    });
  });

  it('should return undefined if original value and diff is empty', () => {
    const a = undefined;
    const b = undefined;
    const difff = diff(a, b);
    const result = applyDiff(a, difff);
    expect(result).toBe(undefined);
  });

  describe('should support undoing diff for', () => {
    it('primitive diffs', () => {
      const a = 1;
      const b = 2;
      const difff = diff(a, b);
      const result = applyDiff(b, difff, 'a');
      expect(result).toEqual(1);
    });

    it('array diffs', () => {
      const a = [1, 2, 3];
      const b = [2, 4, 6];
      const difff = diff(a, b);
      const result = applyDiff(b, difff, 'a');
      expect(result).toEqual([1, 2, 3]);
    });

    it('object diffs', () => {
      const a = { foo: 'bar' };
      const b = { foo: 'baz' };
      const difff = diff(a, b);
      const result = applyDiff(b, difff, 'a');
      expect(result).toEqual({
        foo: 'bar',
      });
    });

    it('nested object diffs', () => {
      const a = { person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } };
      const b = { person: { age: 45, names: { first: 'Jack', last: 'Johnson' } } };
      const difff = diff(a, b);
      const result = applyDiff(b, difff, 'a');
      expect(result).toEqual({ person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } });
    });
  });

  describe('should support step-by-step time-travel for', () => {
    it('primitive diffs', () => {
      // Travel forwards:
      let a = 0;
      const difff1 = diff(a, 1);
      a = applyDiff(a, difff1);
      expect(a).toEqual(1);

      const difff2 = diff(a, 2);
      a = applyDiff(a, difff2);
      expect(a).toEqual(2);

      const difff3 = diff(a, 3);
      a = applyDiff(a, difff3);
      expect(a).toEqual(3);

      // Travel backwards:
      a = applyDiff(a, difff2);
      expect(a).toEqual(2);

      a = applyDiff(a, difff1);
      expect(a).toEqual(1);

      // And forwards again:
      a = applyDiff(a, difff2);
      expect(a).toEqual(2);
    });

    it('array diffs', () => {
      // Travel forwards:
      let a = [1, 2, 3];
      const difff1 = diff(a, [4, 5, 6]);
      a = applyDiff(a, difff1);
      expect(a).toEqual([4, 5, 6]);

      const difff2 = diff(a, [7, 8, 9]);
      a = applyDiff(a, difff2);
      expect(a).toEqual([7, 8, 9]);

      const difff3 = diff(a, [10, 11, 12]);
      a = applyDiff(a, difff3);
      expect(a).toEqual([10, 11, 12]);

      // Travel backwards:
      a = applyDiff(a, difff2);
      expect(a).toEqual([7, 8, 9]);

      a = applyDiff(a, difff1);
      expect(a).toEqual([4, 5, 6]);

      // And forwards again:
      a = applyDiff(a, difff2);
      expect(a).toEqual([7, 8, 9]);
    });

    it('object diffs', () => {
      // Travel forwards
      let a = { foo: 'bar' };
      const difff1 = diff(a, { foo: 'baz' });
      a = applyDiff(a, difff1);
      expect(a).toEqual({ foo: 'baz' });

      const difff2 = diff(a, { foo: 'lorem' });
      a = applyDiff(a, difff2);
      expect(a).toEqual({ foo: 'lorem' });

      const difff3 = diff(a, { foo: 'ipsum' });
      a = applyDiff(a, difff3);
      expect(a).toEqual({ foo: 'ipsum' });

      // Travel backwards:
      a = applyDiff(a, difff2);
      expect(a).toEqual({
        foo: 'lorem',
      });

      a = applyDiff(a, difff1);
      expect(a).toEqual({
        foo: 'baz',
      });

      // And forwards again:
      a = applyDiff(a, difff2);
      expect(a).toEqual({
        foo: 'lorem',
      });
    });

    it('nested object diffs', () => {
      /**
       * Note: this test does not use the `to` parameter of `applyDiff`, which
       * will lead to unexpected behaviour. See the assertions below for details.
       * It's recommended to always use the `to` parameter when traveling back
       * and forth between states.
       */

      // Travel forwards
      let a = { person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } };
      const difff1 = diff(a, {
        person: { age: 45, favouriteFood: 'pizza', names: { first: 'Jack', last: 'Johnson' } },
      });
      a = applyDiff(a, difff1);
      expect(a).toEqual({ person: { age: 45, favouriteFood: 'pizza', names: { first: 'Jack', last: 'Johnson' } } });

      const difff2 = diff(a, { person: { age: 45, names: { first: 'James', last: 'Johnson' } } });
      a = applyDiff(a, difff2);
      expect(a).toEqual({ person: { age: 45, names: { first: 'James', last: 'Johnson' } } });

      const difff3 = diff(a, { person: { age: 46, names: { first: 'James', last: 'Hanson' } } });
      a = applyDiff(a, difff3);
      expect(a).toEqual({ person: { age: 46, names: { first: 'James', last: 'Hanson' } } });

      // Travel backwards:
      a = applyDiff(a, difff2);
      /**
       * Notice how only the actual `difff2` is applied, resulting in `age` still
       * being 46, despite `age` being 45 in the objects being used to create `difff2`.
       */
      expect(a).toEqual({ person: { age: 46, names: { first: 'James', last: 'Hanson' } } });

      a = applyDiff(a, difff1);
      /**
       * Notice how only the actual `difff1` is applied, resulting in `names.first`
       * still being 'James', despite `names.first` being 'Jack' in the objects
       * being used to create `difff1`.
       */
      expect(a).toEqual({
        person: { age: 46, favouriteFood: 'pizza', names: { first: 'James', last: 'Johnson' } },
      });

      // And forwards again:
      a = applyDiff(a, difff2);
      expect(a).toEqual({
        person: { age: 46, names: { first: 'James', last: 'Johnson' } },
      });
    });

    it('primitive diffs with the `to` argument (recommended)', () => {
      // Travel forwards:
      let a = 0;
      const difff1 = diff(a, 1);
      a = applyDiff(a, difff1);
      expect(a).toEqual(1);

      const difff2 = diff(a, 2);
      a = applyDiff(a, difff2);
      expect(a).toEqual(2);

      const difff3 = diff(a, 3);
      a = applyDiff(a, difff3);
      expect(a).toEqual(3);

      // Travel backwards:
      a = applyDiff(a, difff3, 'a');
      expect(a).toEqual(2);

      a = applyDiff(a, difff2, 'a');
      expect(a).toEqual(1);

      // And forwards again:
      a = applyDiff(a, difff2);
      expect(a).toEqual(2);

      a = applyDiff(a, difff3);
      expect(a).toEqual(3);
    });

    it('array diffs with the `to` argument (recommended)', () => {
      // Travel forwards:
      let a = [1, 2, 3];
      const difff1 = diff(a, [4, 5, 6]);
      a = applyDiff(a, difff1);
      expect(a).toEqual([4, 5, 6]);

      const difff2 = diff(a, [7, 8, 9]);
      a = applyDiff(a, difff2);
      expect(a).toEqual([7, 8, 9]);

      const difff3 = diff(a, [10, 11, 12]);
      a = applyDiff(a, difff3);
      expect(a).toEqual([10, 11, 12]);

      // Travel backwards:
      a = applyDiff(a, difff3, 'a');
      expect(a).toEqual([7, 8, 9]);

      a = applyDiff(a, difff2, 'a');
      expect(a).toEqual([4, 5, 6]);

      // And forwards again:
      a = applyDiff(a, difff2);
      expect(a).toEqual([7, 8, 9]);

      a = applyDiff(a, difff3);
      expect(a).toEqual([10, 11, 12]);
    });

    it('object diffs with the `to` argument (recommended)', () => {
      // Travel forwards
      let a = { foo: 'bar' };
      const difff1 = diff(a, { foo: 'baz' });
      a = applyDiff(a, difff1);
      expect(a).toEqual({ foo: 'baz' });

      const difff2 = diff(a, { foo: 'lorem' });
      a = applyDiff(a, difff2);
      expect(a).toEqual({ foo: 'lorem' });

      const difff3 = diff(a, { foo: 'ipsum' });
      a = applyDiff(a, difff3);
      expect(a).toEqual({ foo: 'ipsum' });

      // Travel backwards:
      a = applyDiff(a, difff3, 'a');
      expect(a).toEqual({
        foo: 'lorem',
      });

      a = applyDiff(a, difff2, 'a');
      expect(a).toEqual({
        foo: 'baz',
      });

      // And forwards again:
      a = applyDiff(a, difff3);
      expect(a).toEqual({
        foo: 'ipsum',
      });
    });

    it('nested object diffs with the `to` argument (recommended)', () => {
      // Travel forwards
      let a = { person: { age: 45, names: { first: 'Jack', last: 'Jackson' } } };
      const difff1 = diff(a, {
        person: { age: 45, favouriteFood: 'pizza', names: { first: 'Jack', last: 'Johnson' } },
      });
      a = applyDiff(a, difff1);
      expect(a).toEqual({ person: { age: 45, favouriteFood: 'pizza', names: { first: 'Jack', last: 'Johnson' } } });

      const difff2 = diff(a, { person: { age: 45, names: { first: 'James', last: 'Johnson' } } });
      a = applyDiff(a, difff2);
      expect(a).toEqual({ person: { age: 45, names: { first: 'James', last: 'Johnson' } } });

      const difff3 = diff(a, { person: { age: 46, names: { first: 'James', last: 'Hanson' } } });
      a = applyDiff(a, difff3);
      expect(a).toEqual({ person: { age: 46, names: { first: 'James', last: 'Hanson' } } });

      // Travel backwards:
      a = applyDiff(a, difff3, 'a');
      expect(a).toEqual({ person: { age: 45, names: { first: 'James', last: 'Johnson' } } });

      a = applyDiff(a, difff2, 'a');
      expect(a).toEqual({ person: { age: 45, favouriteFood: 'pizza', names: { first: 'Jack', last: 'Johnson' } } });

      // And forwards again:
      a = applyDiff(a, difff2);
      expect(a).toEqual({
        person: { age: 45, names: { first: 'James', last: 'Johnson' } },
      });

      a = applyDiff(a, difff3);
      expect(a).toEqual({
        person: { age: 46, names: { first: 'James', last: 'Hanson' } },
      });
    });
  });
});
