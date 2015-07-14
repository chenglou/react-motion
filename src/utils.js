export function isPlainObject(obj) {
  return obj ? typeof obj === 'object' &&
    Object.getPrototypeOf(obj) === Object.prototype : false;
}

// damn it JS
export function clone(coll) {
  return JSON.parse(JSON.stringify(coll));
}

// export function eq(a, b) {
//   return JSON.stringify(a) === JSON.stringify(b);
// }

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
    const newTree = {};
    Object.keys(t1).forEach(key => {
      newTree[key] = _mapTree([...path, key], f, trees.map(val => val[key]));
    });
    return newTree;
  }
  // return last one just because
  return trees[trees.length - 1];
}

export function mapTree(f, ...rest) {
  return _mapTree([], f, rest);
}

// function _reshapeTree(path, a, b, f) {
//   if (a == null) {
//     throw new Error('wtf2');
//   }

//   if (b == null) {
//     return f(path, a);
//   }

//   if (Array.isArray(a)) {
//     return a.map((val, i) => _reshapeTree([...path, i], val, b[i], f));
//   }
//   if (Object.prototype.toString.call(a) === '[object Object]') {
//     const newTree = {};
//     Object.keys(a).forEach(key => {
//       newTree[key] = _reshapeTree([...path, key], a[key], b[key], f);
//     });
//     return newTree;
//   }

//   return b;
// }

// export function reshapeTree(a, b, f) {
//   return _reshapeTree([], a, b, f);
// }

// export function toOj(vals, keys) {
//   const ret = {};
//   vals.forEach((val, i) => ret[keys[i]] = val);
//   return ret;
// }

// export function toArr(obj) {
//   const keys = Object.keys(obj);
//   const vals = keys.map(k => obj[k]);
//   return [keys, vals];
// }

// TODO: these are for a demos, not for the library. Move
export function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

export function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

export function range(start, afterStop) {
  let _afterStop = afterStop;
  let _start = start;
  if (afterStop == null) {
    _afterStop = start;
    _start = 0;
  }
  const ret = [];
  for (let i = _start; i < _afterStop; i++) {
    ret.push(i);
  }
  return ret;
}
