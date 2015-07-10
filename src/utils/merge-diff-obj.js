import mergeDiff from './merge-diff';

export default function mergeDiffObj(a, b, onRemove) {
  return mergeDiff(Object.keys(a), Object.keys(b), x => !onRemove(x), [])
    .reduce((ret, key) => ({
      ...ret,
      [key]: b.hasOwnProperty(key) ? b[key] : onRemove(key)
    }), {});
}
