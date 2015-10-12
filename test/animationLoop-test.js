import createMockRaf from './createMockRaf';

const injectorAnimationLoop = require('inject!../src/animationLoop');

describe('animationLoop', () => {
  let startAnimation;
  let mockRaf;

  beforeEach(() => {
    mockRaf = createMockRaf();
    const configAnimation = injectorAnimationLoop({
      raf: mockRaf.raf,
      'performance-now': mockRaf.now,
    });
    startAnimation = configAnimation();
  });

  it('should step normally', () => {
    let state = {};
    let arr = [];
    let steps = 0;
    startAnimation(
      state,
      () => steps++,
      alpha => arr.push(alpha),
    );

    mockRaf.step(3);

    expect(steps).toBe(3);
    expect(arr).toEqual([1, 1, 1]);
  });

  it('should catch up when the time lapse is big', () => {
    let state = {};
    let arr = [];
    let steps = 0;
    startAnimation(
      state,
      () => steps++,
      alpha => arr.push(alpha),
    );

    mockRaf.step(1, 1000 / 7);
    mockRaf.step(3);

    expect(steps).toBe(12);
    expect(arr).toEqual([1, 0.5714285714285717, 0.5714285714285711, 0.5714285714285704]);
  });

  it('should bail when the time lapse is too big', () => {
    let state = {};
    let arr = [];
    let steps = 0;
    startAnimation(
      state,
      () => steps++,
      alpha => arr.push(alpha),
    );

    mockRaf.step(1, 1000 / 2);
    mockRaf.step(3);

    expect(steps).toBe(4);
    expect(arr).toEqual([1, 1, 0.9999999999999977, 0.9999999999999953]);
  });

  it('should still step when the time lapse is tiny', () => {
    let state = {};
    let arr = [];
    let steps = 0;
    startAnimation(
      state,
      () => steps++,
      alpha => arr.push(alpha),
    );

    mockRaf.step(1, 1000 / 1000);
    mockRaf.step(2);

    expect(steps).toBe(3);
    expect(arr).toEqual([1, 0.05999999999999994, 0.05999999999999994]);
  });
});
