import isPlainObject from 'lodash.isplainobject';

// currenly a helper used for producing a tree of the same shape as the
// input(s),  but with different values. It's technically not a real `map`
// equivalent for trees, since it skips calling f on non-numbers.

// TODO: probably doesn't need path, stop allocating uselessly
// TODO: don't need to map over many trees anymore
// TODO: skipping non-numbers is weird and non-generic. Use pre-order traversal
// assume trees are of the same shape
function _mapTree(path, f, trees) {
  const t1 = trees[0];
  if (typeof t1 === 'number') {
    return f(path, ...trees);
  }
  if (Array.isArray(t1)) {
    return t1.map((_, i) => _mapTree([...path, i], f, trees.map(val => val[i])));
  }
  if (isPlainObject(t1)) {
    return Object.keys(t1).reduce((newTree, key) => {
      newTree[key] = _mapTree([...path, key], f, trees.map(val => val[key]));
      return newTree;
    }, {});
  }
  // return last one just because
  return trees[trees.length - 1];
}

export default function mapTree(f, ...rest) {
  return _mapTree([], f, rest);
}
