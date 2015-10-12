import noVelocity from '../src/noVelocity';
import {spring} from '../src/react-motion';

describe('noVelocity', () => {
  it('should return true on 0s', () => {
    expect(noVelocity({a: 0, b: 0}, {a: spring(1), b: spring(1)})).toBe(true);
  });

  it('should ignore non-configured values', () => {
    expect(noVelocity({a: 10, b: 0}, {a: 1, b: spring(1)})).toBe(true);
  });

  it('should ignore `undefined`', () => {
    expect(noVelocity({a: undefined}, {a: undefined})).toBe(true);
  });

  it('should return false if there is at least 1 configured val not 0', () => {
    expect(noVelocity({a: 1, b: 0}, {a: spring(1), b: spring(1)})).toBe(false);
    expect(noVelocity({a: 1, b: 1}, {a: 1, b: spring(1)})).toBe(false);
  });
});
