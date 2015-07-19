export default function reorderKeys(obj, f) {
  return f(Object.keys(obj)).reduce((ret, key) => {
    ret[key] = obj[key];
    return ret;
  }, {});
}
