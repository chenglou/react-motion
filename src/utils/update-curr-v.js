/* eslint-disable no-eq-null */
import mapTree from './map-tree';
import stepper from './stepper';
import zero from './zero';

// TODO: comply with no-eq-null :)
export default function updateCurrV(frameRate, currVals, currV, endValue, k = 170, b = 26) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    return stepper(frameRate, currVals, currV, endValue, k, b)[1];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return mapTree(zero, currV);
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    return {
      config: endValue.config,
      val: updateCurrV(frameRate, currVals.val, currV.val, endValue.val, _k, _b)
    };
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrV(frameRate, currVals[i], currV[i], endValue[i], k, b));
  }
  if (Object.prototype.toString.call(endValue) === '[object Object]') {
    const ret = {};
    Object.keys(endValue).forEach(key => {
      ret[key] = updateCurrV(frameRate, currVals[key], currV[key], endValue[key], k, b);
    });
    return ret;
  }
  return mapTree(zero, currV);
}
