import hasReachedStyle from '../src/hasReachedStyle';
import spring from '../src/spring';

describe('hasReachedStyle', () => {
  it('should return false of the final value is not reached', () => {
    expect(hasReachedStyle({a: spring(10)}, {a: spring(5)})).toBe(false);
  });

  it('should ignore non-configs', () => {
    expect(hasReachedStyle({a: 10}, {a: 5})).toBe(true);
  });

  it('should return true of the final value is reached', () => {
    const currentStyle = {
      a: spring(2),
      b: 10,
    };
    const style = {
      a: spring(2),
      b: 5,
    };
    expect(hasReachedStyle(currentStyle, style)).toBe(true);
  });

  it('should work when going from a config to a non-config', () => {
    expect(hasReachedStyle({a: spring(3)}, {a: 2})).toBe(true);
  });

  it('should work when going from a non-config to a config', () => {
    expect(hasReachedStyle({a: 2}, {a: spring(2)})).toBe(true);
    expect(hasReachedStyle({a: 3}, {a: spring(2)})).toBe(false);
  });
});
