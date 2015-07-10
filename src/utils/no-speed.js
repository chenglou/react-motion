export default function noSpeed(coll) {
  if (Array.isArray(coll)) {
    return coll.every(noSpeed);
  }
  if (Object.prototype.toString.call(coll) === '[object Object]') {
    return Object.keys(coll).every(key => key === 'config' ? true : noSpeed(coll[key]));
  }
  return coll === 0;
}
