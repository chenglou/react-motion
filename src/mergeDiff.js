// TODO: stop allocating
function mergeDiffArr(collA, collB, onRemove, accum) {
  const [a, ...aa] = collA;
  const [b, ...bb] = collB;

  if (collA.length === 0 && collB.length === 0) {
    return accum;
  }
  if (collA.length === 0) {
    return accum.concat(collB);
  }
  if (collB.length === 0) {
    if (onRemove(a)) {
      return mergeDiffArr(aa, collB, onRemove, accum);
    }
    return mergeDiffArr(aa, collB, onRemove, accum.concat(a));
  }
  if (a === b) { // fails for ([undefined], [], () => true). but don't do that
    return mergeDiffArr(aa, bb, onRemove, accum.concat(a));
  }
  if (collB.indexOf(a) === -1) {
    if (onRemove(a)) {
      return mergeDiffArr(aa, collB, onRemove, accum);
    }
    return mergeDiffArr(aa, collB, onRemove, accum.concat(a));
  }
  return mergeDiffArr(aa, collB, onRemove, accum);
}

export default function mergeDiff(a, b, onRemove) {
  const keys = mergeDiffArr(Object.keys(a), Object.keys(b), _a => !onRemove(_a), []);
  const ret = {};
  keys.forEach(key => {
    if (b.hasOwnProperty(key)) {
      ret[key] = b[key];
    } else {
      ret[key] = onRemove(key);
    }
  });

  return ret;
}
