import stripStyle from '../src/stripStyle';
import spring from '../src/spring';

describe('stripStyle', () => {
  it('should return spring object into value', () => {
    expect(stripStyle({a: spring(1, [1, 2])})).toEqual({a: 1});
  });

  it('should ignore non-configured values', () => {
    expect(stripStyle({a: 10, b: 0})).toEqual({a: 10, b: 0});
  });
});
