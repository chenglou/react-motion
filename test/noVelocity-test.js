import noVelocity from '../src/noVelocity';
import React from 'react';

describe('noVelocity', () => {
  it('should return true on 0s', () => {
    expect(noVelocity({a: [0, 0, {b: 0}]})).toBe(true);
  });

  it('should return true on collections of 0s with non-numerical vals', () => {
    const comp = <div />;
    expect(noVelocity({a: null, b: 0})).toBe(true);
    expect(noVelocity({a: [0, 0, 'hi']})).toBe(true);
    expect(noVelocity({a: [comp, 0, 'hi']})).toBe(true);
  });

  it('should return false otherwise', () => {
    expect(noVelocity({a: null, b: 1})).toBe(false);
    expect(noVelocity({a: [0, 2, 'hi']})).toBe(false);
    expect(noVelocity({a: [3, 0, 0]})).toBe(false);
  });

  it('should ignore the configs', () => {
    expect(noVelocity({a: {val: 0}, config: [10, 10]})).toBe(true);
  });
});
