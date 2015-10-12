import {default as defaultNow} from 'performance-now';
import {default as defaultRaf} from 'raf';

export default function configAnimation(config = {}) {
  let {
    timeStep = 1 / 60 * 1000,
    timeScale = 1,
    maxSteps = 10,
    raf = defaultRaf,
    now = defaultNow,
  } = config;

  let animRunning = [];
  let running = false;
  let prevTime = 0;
  let accumulatedTime = 0;

  function loop() {
    const currentTime = now();
    const frameTime = currentTime - prevTime; // delta

    prevTime = currentTime;
    accumulatedTime += frameTime * timeScale;

    if (accumulatedTime > timeStep * maxSteps) {
      accumulatedTime = 0;
    }

    let frameNumber = Math.ceil(accumulatedTime / timeStep);
    for (let i = 0; i < animRunning.length; i++) {
      const {active, animationStep, prevState: prevPrevState} = animRunning[i];
      let {nextState: prevNextState} = animRunning[i];

      if (!active) {
        continue;
      }

      // Seems like because the TS sets destVals as enterVals for the first
      // tick, we might render that value twice. We render it once, currValue is
      // enterVal and destVal is enterVal. The next tick is faster than 16ms,
      // so accumulatedTime (which would be about -16ms from the previous tick)
      // is negative (-16ms + any number less than 16ms < 0). So we just render
      // part ways towards the nextState, but that's enterVal still. We render
      // say 75% between currValue (=== enterVal) and destValue (=== enterVal).
      // So we render the same value a second time.
      // The solution below is to recalculate the destination state even when
      // you're moving partially towards it.
      if (accumulatedTime <= 0) {
        animRunning[i].nextState = animationStep(timeStep / 1000, prevPrevState);
      } else {
        for (let j = 0; j < frameNumber; j++) {
          animRunning[i].nextState = animationStep(timeStep / 1000, prevNextState);
          [animRunning[i].prevState, prevNextState] = [prevNextState, animRunning[i].nextState];
        }
      }
    }

    accumulatedTime = accumulatedTime - frameNumber * timeStep;

    // Render and filter in one iteration.
    const alpha = 1 + accumulatedTime / timeStep;
    for (let i = 0; i < animRunning.length; i++) {
      const {animationRender, nextState, prevState} = animRunning[i];

      // Might mutate animRunning........
      animationRender(alpha, nextState, prevState);
    }

    animRunning = animRunning.filter(({active}) => active);

    if (animRunning.length === 0) {
      running = false;
    } else {
      raf(loop);
    }
  }

  function start() {
    if (!running) {
      running = true;
      prevTime = now();
      accumulatedTime = 0;
      raf(loop);
    }
  }

  return function startAnimation(state, animationStep, animationRender) {
    for (let i = 0; i < animRunning.length; i++) {
      let val = animRunning[i];
      if (val.animationStep === animationStep) {
        val.active = true;
        val.prevState = state;
        start();
        return val.stop;
      }
    }

    let newAnim = {
      animationStep,
      animationRender,
      prevState: state,
      nextState: state,
      active: true,
    };

    newAnim.stop = () => newAnim.active = false;
    animRunning.push(newAnim);

    start();

    return newAnim.stop;
  };
}
