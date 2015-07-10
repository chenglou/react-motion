/* eslint-disable no-nested-ternary */
export default function clamp(n, min, max) {
  return n < min ? min
    : n > max ? max
    : n;
}
