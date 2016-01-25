/* @flow */
import type {TransitionStyle} from './Types';

// babel transforms the tail calls into loops
function mergeDiffArr(arrA, arrB, indexA, indexB, onRemove, accum): Array<TransitionStyle> {
  const endA = indexA === arrA.length;
  const endB = indexB === arrB.length;
  // const keyA = arrA[indexA].key;
  // const keyB = arrB[indexB].key;
  if (endA && endB) {
    return accum;
  }

  if (endA) {
    accum.push(arrB[indexB]);
    return mergeDiffArr(arrA, arrB, indexA, indexB + 1, onRemove, accum);
  }

  if (endB) {
    const fill = onRemove(indexA, arrA[indexA]);
    if (fill != null) {
      accum.push(fill);
    }
    return mergeDiffArr(arrA, arrB, indexA + 1, indexB, onRemove, accum);
  }

  if (arrA[indexA].key === arrB[indexB].key) {
    accum.push(arrB[indexB]);
    return mergeDiffArr(arrA, arrB, indexA + 1, indexB + 1, onRemove, accum);
  }

  // TODO: key search code
  let found = false;
  for (let i = indexB; i < arrB.length; i++) {
    if (arrB[i].key === arrA[indexA].key) {
      found = true;
      break;
    }
  }
  if (!found) {
    const fill = onRemove(indexA, arrA[indexA]);
    if (fill != null) {
      accum.push(fill);
    }
    return mergeDiffArr(arrA, arrB, indexA + 1, indexB, onRemove, accum);
  }

  // key a != key b, key a (old) not found in new arr (arr b)
  return mergeDiffArr(arrA, arrB, indexA + 1, indexB, onRemove, accum);
}

export default function mergeDiff(
  prev: Array<TransitionStyle>,
  next: Array<TransitionStyle>,
  onRemove: (prevIndex: number, prevStyleCell: TransitionStyle) => ?TransitionStyle
): Array<TransitionStyle> {
  return mergeDiffArr(prev, next, 0, 0, onRemove, []);
}
