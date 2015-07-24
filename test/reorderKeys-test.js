import reorderKeys from '../src/reorderKeys';

describe('reorderKeys', () => {
  it('should return the object in the new order specified by cb', () => {
    expect(Object.keys(reorderKeys({a: 1, b: 2}, () => ['b', 'a'])))
      .toEqual(['b', 'a']);
    expect(Object.keys(reorderKeys({b: 1, a: 2}, a => a))).toEqual(['b', 'a']);
  });

  it('should be ok with missing keys from cb', () => {
    const t1 = reorderKeys({a: 1, b: 2, c: 3}, () => ['c', 'a']);
    expect(t1).toEqual({c: 3, a: 1});
    expect(Object.keys(t1)).toEqual(['c', 'a']);
  });
});
