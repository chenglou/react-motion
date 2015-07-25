import defaultNow from 'performance-now';
import defaultRaf from 'raf';

export default function configAnimation(config = {}) {
  let {
    timeStep = 1 / 60 * 1000,
    timeScale = 1,
    maxSteps = 10,
    raf = defaultRaf,
    now = defaultNow,
  } = config;

  let animRunning = [];
  let shouldStop = false;
  let running = false;
  let prevTime = 0;
  let accumulatedTime = 0;

  function loop() {
    if (shouldStop) {
      running = shouldStop = false;
      return;
    }

    const currentTime = now();
    const frameTime = currentTime - prevTime; // delta

    prevTime = currentTime;
    accumulatedTime += frameTime * timeScale;

    if (accumulatedTime > timeStep * maxSteps) {
      accumulatedTime = 0;
    }

    while (accumulatedTime > 0) {
      for (let i = 0; i < animRunning.length; i++) {
        const {active, step} = animRunning[i];
        if (active) {
          const prevNewState = animRunning[i].newState;
          animRunning[i].newState = step(timeStep / 1000, prevNewState);
          animRunning[i].prevState = prevNewState;
        }
      }
      accumulatedTime -= timeStep;
    }

    // Render and filter in one iteration.
    // Really imperative section for the sake of not allocating
    const newAnimRunning = [];
    const alpha = 1 + accumulatedTime / timeStep;
    let index = 0;
    while (index < animRunning.length) {
      const {render, active, newState, prevState} = animRunning[index];

      // Might mutate animRunning........
      render(alpha, newState, prevState);
      if (active) {
        newAnimRunning.push(animRunning[index]);
      }
      index++;
    }

    animRunning = newAnimRunning;

    if (animRunning.length === 0) {
      shouldStop = true;
    }

    raf(loop);
  }

  function start() {
    if (shouldStop) {
      shouldStop = false;
    } else if (!running) {
      running = true;
      prevTime = now();
      accumulatedTime = 0;
      raf(loop);
    }
  }

  return function startAnimation(state, step, render) {
    for (let i = 0; i < animRunning.length; i++) {
      let val = animRunning[i];
      if (val.step === step) {
        val.active = true;
        if (!running) {
          start();
        }

        return val.stop;
      }
    }

    let newAnim = {
      step,
      render,
      prevState: state,
      newState: state, // push initial state
      active: true,
    };

    newAnim.stop = () => newAnim.active = false;
    animRunning.push(newAnim);

    if (!running) {
      start();
    }

    return newAnim.stop;
  };
}
