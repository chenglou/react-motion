/* @flow */

type Callback = (now: number) => void;

export default function(): Object {
  let allCallbacks = [];
  let prevTime = 0;
  let id = 0;

  const now = () => prevTime;

  const raf = (cb: Callback) => {
    allCallbacks.push(cb);
    return id++;
  };

  const defaultTimeInterval = 1000 / 60;
  const _step = ms => {
    const allCallbacksBefore = allCallbacks;
    allCallbacks = [];

    prevTime += ms;
    allCallbacksBefore.forEach(cb => cb(prevTime));
  };

  const step = (howMany = 1, ms = defaultTimeInterval) => {
    for (let i = 0; i < howMany; i++) {
      _step(ms);
    }
  };

  return {now, raf, step};
}
