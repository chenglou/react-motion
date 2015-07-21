import filter from './filter';
import now from 'performance-now';
import raf from 'raf';

function renderSubscriber(alpha, subscriber) {
  // subscriber.render: this.animationRender
  subscriber.render(alpha, subscriber.value, subscriber.prevValue);
  return subscriber.active;
}

const prototype = {
  running: false,
  shouldStop: false,
  lastTime: 0,
  accumulatedTime: 0,

  // step: this.animationStep
  // render: this.animationRender
  // value: state
  subscribe(step, render, value) {
    let subscriber = {
      value: value,
      prevValue: value,
      step: step,
      render: render,
      active: true,
    };

    this.subscribers.push(subscriber);

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
    // delta
    const frameTime = currentTime - this.lastTime;

    this.lastTime = currentTime;
    this.accumulatedTime += frameTime * this.timeScale;

    if (this.accumulatedTime > timeStep * this.maxSteps) {
      this.accumulatedTime = 0;
    }

    while (this.accumulatedTime > 0) {
      this.subscribers.forEach(this.step); // animationLoop.step
      this.accumulatedTime -= timeStep;
    }

    // Render and filter in one iteration.
    this.subscribers = filter(
      this.subscribers,
      renderSubscriber,
      1 + this.accumulatedTime / timeStep
    );

    if (this.subscribers.length === 0) {
      this.shouldStop = true;
    }

    raf(this.loop);
  },

  start() {
    if (this.subscribers.length) {
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
  let animationLoop = Object.create(prototype);

  animationLoop.loop = animationLoop.loop.bind(animationLoop);
  animationLoop.subscribers = [];

  // timeStep is in milliseconds
  animationLoop.timeStep = timeStep * 1000; // seconds
  animationLoop.timeScale = timeScale;
  animationLoop.maxSteps = maxSteps;

  animationLoop.step = subscriber => {
    if (subscriber.active) {
      const value = subscriber.value; // value = this.state

      subscriber.prevValue = value;
      subscriber.value = subscriber.step(timeStep, value); // animationStep
    }
  };

  return animationLoop;
}
