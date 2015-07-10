export default function range(start, afterStop) {
  if (afterStop === null || typeof afterStop === 'undefined') {
    afterStop = start;
    start = 0;
  }
  const ret = [];
  for (let i = start; i < afterStop; i++) {
    ret.push(i);
  }
  return ret;
}
