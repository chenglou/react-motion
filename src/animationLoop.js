const prototype = {
  running: false,
  shouldStop: false,
  lastTime: 0,
  accumulatedTime: 0,

  setOptions: function setOptions(options) {
    const animationLoop = this;

    // Seconds
    const timeStep = options.timeStep;

    // Milliseconds
    animationLoop.timeStep = timeStep * 1000;

    animationLoop.timeScale = options.timeScale;
    animationLoop.maxSteps = options.maxSteps;
    animationLoop.getTime = options.getTime;
    animationLoop.ticker = options.ticker;

    animationLoop.step = function step(subscriber) {
      if (subscriber.active) {
        const value = subscriber.value;

        subscriber.prevValue = value;
        subscriber.value = subscriber.step(timeStep, value);
      }
    };

    return animationLoop;
  },

  subscribe: function subscribe(step, render, value) {
    const animationLoop = this;
    const subscriber = {
      value: value,
      prevValue: value,
      step: step,
      render: render,
      active: true,
    };

    animationLoop.state.push(subscriber);

    return function unsubscribe() {
      subscriber.active = false;
    };
  },

  loop: function loop() {
    const animationLoop = this;
    const currentTime = animationLoop.getTime();

    if (animationLoop.shouldStop) {
      animationLoop.running = animationLoop.shouldStop = false;
      return;
    }

    const state = animationLoop.state;
    const timeStep = animationLoop.timeStep;
    const frameTime = currentTime - animationLoop.lastTime;

    animationLoop.lastTime = currentTime;
    animationLoop.accumulatedTime += frameTime * animationLoop.timeScale;

    if (animationLoop.accumulatedTime > timeStep * animationLoop.maxSteps) {
      animationLoop.accumulatedTime = 0;
    }

    while (animationLoop.accumulatedTime > 0) {
      state.forEach(animationLoop.step);
      animationLoop.accumulatedTime -= timeStep;
    }

    const alpha = 1 + animationLoop.accumulatedTime / timeStep;
    let index = 0;
    let nextState;

    while (index < state.length) {
      let subscriber = state[index];
      subscriber.render(alpha, subscriber.value, subscriber.prevValue);

      if (!nextState && !subscriber.active) {
        nextState = [];
      } else if (nextState && subscriber.active) {
        nextState.push(subscriber);
      }

      index++;
    }

    if (nextState) {
      animationLoop.state = nextState;
    }

    if (!animationLoop.state.length) {
      animationLoop.shouldStop = true;
    }

    animationLoop.ticker(animationLoop.loop);
  },

  start: function start() {
    const animationLoop = this;

    if (animationLoop.state.length) {
      if (animationLoop.shouldStop) {
        animationLoop.shouldStop = false;
      } else if (!animationLoop.running) {
        animationLoop.running = true;
        animationLoop.lastTime = animationLoop.getTime();
        animationLoop.accumulatedTime = 0;
        animationLoop.ticker(animationLoop.loop);
      }
    }

    return animationLoop;
  },

  stop: function stop() {
    this.shouldStop = true;

    return this;
  },
};

export default function createAnimationLoop(options) {
  const animationLoop = Object.create(prototype);

  animationLoop.loop = animationLoop.loop.bind(animationLoop);
  animationLoop.state = [];

  if (options) {
    animationLoop.setOptions(options);
  }

  return animationLoop;
}
