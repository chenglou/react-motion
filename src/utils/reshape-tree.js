function _reshapeTree(path, a, b, f) {
  if (a === null) {
    throw Error('wtf2');
  }

  if (b === null) {
    return f(path, a);
  }

  if (Array.isArray(a)) {
    return a.map((val, i) => _reshapeTree([...path, i], val, b[i], f));
  }
  if (Object.prototype.toString.call(a) === '[object Object]') {
    const newTree = {};
    Object.keys(a).forEach(key => {
      newTree[key] = _reshapeTree([...path, key], a[key], b[key], f);
    });
    return newTree;
  }

  return b;
}

export default function reshapeTree(a, b, f) {
  return _reshapeTree([], a, b, f);
}
