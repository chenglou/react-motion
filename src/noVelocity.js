import isPlainObject from 'lodash.isplainobject';

export default function noVelocity(coll) {
  if (Array.isArray(coll)) {
    return coll.every(noVelocity);
  }
  if (isPlainObject(coll)) {
    return Object.keys(coll).every(
      key => key === 'config' ? true : noVelocity(coll[key])
    );
  }
  return typeof coll === 'number' ? coll === 0 : true;
}
