import isPlainObject from 'lodash.isplainobject';

export default function compareTrees(a, b) {
  if (Array.isArray(a)) {
    return a.every((v, i) => compareTrees(v, b[i]));
  }

  if (isPlainObject(a)) {
    return Object.keys(a).every(
      key => key === 'config' ? true : compareTrees(a[key], b[key])
    );
  }

  return a === b;
}
