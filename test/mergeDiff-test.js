import mergeDiff from '../src/mergeDiff';

const id = (_, s) => s;
const n = () => null;

// helper to make the tests more concise
function test(prevRaw, nextRaw, expectedRaw, customOnRemove) {
  // we elaborately construct prev/nextKeyStyleValMap + randomized style value to
  // check that the style object of the latter correctly merged into the final
  // output
  let prev = [];
  let prevKeyStyleValMap = {};
  prevRaw.forEach(num => {
    const styleVal = Math.random();
    // key needs to be a string; cast it
    prev.push({key: String(num), style: {a: styleVal}});
    prevKeyStyleValMap[num] = styleVal;
  });
  let next = [];
  let nextKeyStyleValMap = {};
  nextRaw.forEach(num => {
    const styleVal = Math.random();
    next.push({key: String(num), style: {a: styleVal}});
    nextKeyStyleValMap[num] = styleVal;
  });

  const expected = expectedRaw.map(num => {
    return {
      key: String(num),
      style: {a: Object.prototype.hasOwnProperty.call(nextKeyStyleValMap, num) ? nextKeyStyleValMap[num] : prevKeyStyleValMap[num]},
    };
  });

  expect(mergeDiff(prev, next, n)).toEqual(next);
  // some tests pass in a `customOnRemove` to check edge cases; interpret
  // `expected`/`expectedRaw` as the output of mergeDiff using `customOnRemove`
  // instead of the default `id` function
  expect(mergeDiff(prev, next, customOnRemove || id)).toEqual(expected);
}

describe('mergeDiff', () => {
  it('should work with various merge orders', () => {
    // most of these tests are significant. Don't casually remove some. Those
    // marked as "meh" are the ones whose order can differ. We've chosen a
    // deterministic default in our mergeDiff implementation
    test([4], [], [4]);
    test([], [3], [3]);
    test([3], [3], [3]);
    test([], [], []);
    test([2, 4, 5, 6], [2, 3, 4, 5], [2, 3, 4, 5, 6]);
    test([2, 4, 5, 6, 7], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6, 7]);
    test([1, 2, 3], [2, 3, 4], [1, 2, 3, 4]);
    test([2, 3, 4], [1, 2, 3], [1, 2, 3, 4]);
    test([4], [1, 2, 3], [4, 1, 2, 3]); // meh
    test([1, 2, 3], [4], [1, 2, 3, 4]); // meh
    test([4, 2], [1, 2, 3], [4, 1, 2, 3]); // meh
    test([2, 4], [1, 2, 3], [1, 2, 4, 3]); // meh
    test([1, 5, 10], [3, 5, 7, 10], [1, 3, 5, 7, 10]); // meh
    test([4, 5, 10], [3, 5, 7, 10], [4, 3, 5, 7, 10]); // meh
    test([4], [3], [4, 3]); // meh
    test([1, 5], [5, 3], [1, 5, 3]);
    test([5, 6], [3, 5], [3, 5, 6]);
    test([1, 2, 3], [3, 2, 1], [3, 2, 1]);
    test([3, 2, 1], [1, 2, 3], [1, 2, 3]);
    test([1, 2, 3], [2, 1, 3], [2, 1, 3]);
    test([1, 2, 3], [1, 3, 2], [1, 3, 2]);
    test([1, 2, 3], [1, 2, 3], [1, 2, 3]);
  });

  it('should work with some more typical onRemove callbacks', () => {
    test([1, 2, 3], [1, 9], [1, 2, 9], (index, s) => index === 1 ? s : null);
    test([1, 2, 3, 4], [5, 4, 2], [1, 5, 4, 2], (index, s) => index === 0 ? s : null);
  });

  it('should not call cb more than once per disappearing key', () => {
    let count = 0;
    test([1], [], [], () => {
      count++;
      return null;
    });
    expect(count).toBe(1);
  });
});
