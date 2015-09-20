export default function() {
  let allCallbacks = [];
  let prevTime = 0;

  const now = () => {
    return prevTime;
  };

  const raf = cb => {
    allCallbacks.push(cb);
  };

  const defaultTimeInterval = 1000 / 60;
  const _step = ms => {
    const allCallbacksBefore = allCallbacks;
    allCallbacks = [];

    allCallbacksBefore.forEach(cb => cb());

    prevTime += ms;
  };

  const step = (howMany = 1, ms = defaultTimeInterval) => {
    for (let i = 0; i < howMany; i++) {
      _step(ms);
    }
  };

  return {now, raf, step};
}
