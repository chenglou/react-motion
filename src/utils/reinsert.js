import clone from './clone';

export default function reinsert(arr, from, to) {
  arr = clone(arr);
  const val = arr[from];
  arr.splice(from, 1);
  arr.splice(to, 0, val);
  return arr;
}
