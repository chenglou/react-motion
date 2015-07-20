import filter from './filter';
import now from 'performance-now';
import raf from 'raf';

function renderSubscriber(alpha, subscriber) {
  subscriber.render(alpha, subscriber.value, subscriber.prevValue);
  return subscriber.active;
}

const prototype = {
  running: false,
  shouldStop: false,
  lastTime: 0,
  accumulatedTime: 0,

  subscribe(step, render, value) {
    const subscriber = {
      value: value,
      prevValue: value,
      step: step,
      render: render,
      active: true,
    };

    this.state.push(subscriber);

    return function unsubscribe() {
      subscriber.active = false;
    };
  },

  loop() {
    const currentTime = now();

    if (this.shouldStop) {
      this.running = this.shouldStop = false;
      return;
    }

    const timeStep = this.timeStep;
    const frameTime = currentTime - this.lastTime;

    this.lastTime = currentTime;
    this.accumulatedTime += frameTime * this.timeScale;

    if (this.accumulatedTime > timeStep * this.maxSteps) {
      this.accumulatedTime = 0;
    }

    while (this.accumulatedTime > 0) {
      this.state.forEach(this.step);
      this.accumulatedTime -= timeStep;
    }

    // Render and filter in one iteration.
    this.state = filter(
      this.state,
      renderSubscriber,
      1 + this.accumulatedTime / timeStep
    );

    if (this.state.length === 0) {
      this.shouldStop = true;
    }

    raf(this.loop);
  },

  start() {
    if (this.state.length) {
      if (this.shouldStop) {
        this.shouldStop = false;
      } else if (!this.running) {
        this.running = true;
        this.lastTime = now();
        this.accumulatedTime = 0;
        raf(this.loop);
      }
    }
  },

  // stop() {
  //   this.shouldStop = true;

  //   return this;
  // },
};

export default function createAnimationLoop({timeStep, timeScale, maxSteps}) {
  const animationLoop = Object.create(prototype);

  animationLoop.loop = animationLoop.loop.bind(animationLoop);
  animationLoop.state = [];

  // timeStep is in milliseconds
  animationLoop.timeStep = timeStep * 1000; // seconds
  animationLoop.timeScale = timeScale;
  animationLoop.maxSteps = maxSteps;

  animationLoop.step = subscriber => {
    if (subscriber.active) {
      const value = subscriber.value;

      subscriber.prevValue = value;
      subscriber.value = subscriber.step(timeStep, value);
    }
  };

  return animationLoop;
}
