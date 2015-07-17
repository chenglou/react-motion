export default function reorderKeys(obj, f) {
  const ret = {};
  f(Object.keys(obj)).forEach(key => {
    ret[key] = obj[key];
  });
  return ret;
}
