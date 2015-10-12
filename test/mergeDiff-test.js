import mergeDiff from '../src/mergeDiff';

const t = () => true;
const n = () => null;
describe('mergeDiff', () => {
  it('should merge latter key value into former', () => {
    expect(mergeDiff({a: 1}, {a: 2}, t)).toEqual({a: 2});
    expect(mergeDiff({a: 1}, {a: 2}, n)).toEqual({a: 2});
  });

  it('should reorder keys according to latter', () => {
    const t1 = mergeDiff({a: 1, b: 2}, {b: 3, a: 4}, t);
    expect(t1).toEqual({b: 3, a: 4});
    expect(Object.keys(t1)).toEqual(['b', 'a']); // key order important!

    const t2 = mergeDiff({a: 1, b: 2}, {b: 3, a: 4}, n);
    expect(t2).toEqual({b: 3, a: 4});
    expect(Object.keys(t2)).toEqual(['b', 'a']);
  });

  it('should remove key if cb returns nullable, else updated value', () => {
    const t1 = mergeDiff({a: 1, b: 2}, {b: 3}, t);
    expect(t1).toEqual({a: true, b: 3});
    expect(Object.keys(t1)).toEqual(['a', 'b']);

    const t2 = mergeDiff({b: 2, a: 1}, {b: 3, c: 4}, key => key + 'hi');
    expect(t2).toEqual({b: 3, a: 'ahi', c: 4});
    expect(Object.keys(t2)).toEqual(['b', 'a', 'c']);

    expect(mergeDiff({a: 1, b: 2}, {b: 3}, n)).toEqual({b: 3});
  });

  it('should not consider move as a delete', () => {
    const t1 = mergeDiff({a: 1, b: 2}, {b: 1, a: 2}, n);
    expect(t1).toEqual({b: 1, a: 2});
    expect(Object.keys(t1)).toEqual(['b', 'a']);

    const t2 = mergeDiff({a: 1, b: 2, c: 3}, {c: 4, b: 5}, n);
    expect(t2).toEqual({c: 4, b: 5});
    expect(Object.keys(t2)).toEqual(['c', 'b']);
  });

  it('should do all of these', () => {
    const t1 = mergeDiff(
      {a: 1, b: 2, c: 3},
      {a: 2, d: 4},
      key => key === 'b' ? 'keepB' : null
    );
    expect(t1).toEqual({a: 2, b: 'keepB', d: 4});
    expect(Object.keys(t1)).toEqual(['a', 'b', 'd']);

    const t2 = mergeDiff(
      {a: 1, b: 2, n: 9, c: 3},
      {d: 1, c: 4, b: 5},
      key => key === 'a' ? ['keepA'] : null
    );
    expect(t2).toEqual({a: ['keepA'], d: 1, c: 4, b: 5});
    expect(Object.keys(t2)).toEqual(['a', 'd', 'c', 'b']);
  });

  it('should not call cb more than once per disappearing key', () => {
    let count = 0;
    mergeDiff({a: 1}, {}, () => {
      count++;
      return true;
    });
    expect(count).toBe(1);
  });
});
