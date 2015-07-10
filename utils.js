'use strict';

// damn it JS
export function clone(coll) {
  return JSON.parse(JSON.stringify(coll));
}

export function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function range(start, afterStop) {
  if (afterStop == null) {
    afterStop = start;
    start = 0;
  }
  const ret = [];
  for (let i = start; i < afterStop; i++) {
    ret.push(i);
  }
  return ret;
}

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

export function mapTree(f, ...rest) {
  return _mapTree([], f, rest);
}

function _reshapeTree(path, a, b, f) {
  if (a == null) {
    throw 'wtf2';
  }

  if (b == null) {
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

export function reshapeTree(a, b, f) {
  return _reshapeTree([], a, b, f);
}

export function toOj(vals, keys) {
  const ret = {};
  vals.forEach((val, i) => ret[keys[i]] = val);
  return ret;
}

export function toArr(obj) {
  const keys = Object.keys(obj);
  const vals = keys.map(k => obj[k]);
  return [keys, vals];
}

export function reinsert(arr, from, to) {
  arr = clone(arr);
  const val = arr[from];
  arr.splice(from, 1);
  arr.splice(to, 0, val);
  return arr;
}

export function clamp(n, min, max) {
  return n < min ? min
    : n > max ? max
    : n;
}
