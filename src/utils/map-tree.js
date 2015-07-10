// assume trees same are same
function _mapTree(path, f, trees) {
  const t1 = trees[0];
  if (Array.isArray(t1)) {
    return t1.map((_, i) => _mapTree([...path, i], f, trees.map(val => val[i])));
  }
  if (Object.prototype.toString.call(t1) === '[object Object]') {
    const newTree = {};
    Object.keys(t1).forEach(key => {
      newTree[key] = _mapTree([...path, key], f, trees.map(val => val[key]));
    });
    return newTree;
  }
  return f(path, ...trees);
}

export default function mapTree(f, ...rest) {
  return _mapTree([], f, rest);
}
