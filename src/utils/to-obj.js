export default function toObj(vals, keys) {
  const ret = {};
  vals.forEach((val, i) => ret[keys[i]] = val);
  return ret;
}
