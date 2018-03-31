function keysEqual(a, b): boolean {
  let hasOwnProperty = Object.prototype.hasOwnProperty;
  for (let k in a) {
    if (hasOwnProperty.call(a, k)) {
      if (!hasOwnProperty.call(b, k) || a[k] !== b[k]) {
        return false;
      }
    }
  }

  return true;
}

export default function arePropsEqual(a: Object, b: Object): boolean {
  return keysEqual(a, b) || keysEqual(b, a);
}
