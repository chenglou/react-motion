export default function() {
  let allCallbacks = [];
  let prevTime = 0;

  const now = () => {
    return prevTime;
  };

  const raf = cb => {
    allCallbacks.push(cb);
  };

  const step = (ms = 16) => {
    const allCallbacksBefore = allCallbacks;
    allCallbacks = [];

    allCallbacksBefore.forEach(cb => cb());

    prevTime += ms;
  };

  const manySteps = (num = 1) => {
    for (let i = 0; i < num; i++) {
      step();
    }
  };

  return {now, raf, step, manySteps};
};
