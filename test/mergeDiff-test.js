import mergeDiff from '../src/mergeDiff';

const id = (_, s) => s;
const n = () => null;
describe('mergeDiff', () => {
  it('should merge latter key value into former', () => {
    expect(mergeDiff([{key: 1, style: {a: 1}}], [{key: 1, style: {a: 2}}], id))
      .toEqual([{key: 1, style: {a: 2}}]);
    expect(mergeDiff([{key: 1, style: {a: 1}}], [{key: 1, style: {a: 2}}], n))
      .toEqual([{key: 1, style: {a: 2}}]);
  });

  it('should reorder keys according to latter', () => {
    expect(mergeDiff(
      [{key: 1, style: {a: 1}}, {key: 2, style: {a: 2}}],
      [{key: 2, style: {a: 3}}, {key: 1, style: {a: 4}}],
      id,
    )).toEqual([{key: 2, style: {a: 3}}, {key: 1, style: {a: 4}}]);

    expect(mergeDiff(
      [{key: 1, style: {a: 1}}, {key: 2, style: {a: 2}}],
      [{key: 2, style: {a: 3}}, {key: 1, style: {a: 4}}],
      n,
    )).toEqual([{key: 2, style: {a: 3}}, {key: 1, style: {a: 4}}]);
  });

  it('should remove key if cb returns nullable, else updated value', () => {
    expect(mergeDiff(
      [{key: 1, style: {a: 1}}, {key: 2, style: {a: 2}}],
      [{key: 2, style: {a: 3}}],
      id,
    )).toEqual([{key: 1, style: {a: 1}}, {key: 2, style: {a: 3}}]);

    expect(mergeDiff(
      [{key: 2, style: {a: 1}}, {key: 1, style: {a: 2}}],
      [{key: 2, style: {a: 3}}, {key: 3, style: {a: 4}}],
      id,
    )).toEqual([
      {key: 2, style: {a: 3}},
      {key: 1, style: {a: 2}},
      {key: 3, style: {a: 4}},
    ]);

    expect(mergeDiff(
      [{key: 1, style: {a: 1}}, {key: 2, style: {a: 2}}],
      [{key: 2, style: {a: 3}}],
      n,
    )).toEqual([{key: 2, style: {a: 3}}]);
  });

  it('should not consider move as a delete', () => {
    // a few cases covered by "reorder keys..." above
    expect(mergeDiff(
      [{key: 1, style: {a: 1}}, {key: 2, style: {a: 2}}, {key: 3, style: {a: 3}}],
      [{key: 3, style: {a: 4}}, {key: 2, style: {a: 5}}],
      n,
    )).toEqual([{key: 3, style: {a: 4}}, {key: 2, style: {a: 5}}]);
  });

  it('should do all of these together', () => {
    expect(mergeDiff(
      [{key: 1, style: {a: 1}}, {key: 2, style: {a: 2}}, {key: 3, style: {a: 3}}],
      [{key: 1, style: {a: 4}}, {key: 9, style: {a: 9}}],
      (index, s) => index === 1 ? {...s, style: {a: 10}} : null,
    )).toEqual([
      {key: 1, style: {a: 4}},
      {key: 2, style: {a: 10}},
      {key: 9, style: {a: 9}},
    ]);

    expect(mergeDiff(
      [{key: 1, style: {a: 1}}, {key: 2, style: {a: 2}}, {key: 3, style: {a: 3}}, {key: 4, style: {a: 4}}],
      [{key: 5, style: {a: 5}}, {key: 4, style: {a: 6}}, {key: 2, style: {a: 7}}],
      (index, s) => index === 0 ? {...s, style: {a: 10}} : null,
    )).toEqual([
      {key: 1, style: {a: 10}},
      {key: 5, style: {a: 5}},
      {key: 4, style: {a: 6}},
      {key: 2, style: {a: 7}},
    ]);
  });

  it('should not call cb more than once per disappearing key', () => {
    let count = 0;
    mergeDiff([{key: 1, style: {a: 1}}], [], () => {
      count++;
      return {key: 1, style: {}};
    });
    expect(count).toBe(1);
  });
});
