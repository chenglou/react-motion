import stripStyle from '../src/stripStyle';

describe('stripStyle', () => {
  it('should ignore `undefined`', () => {
    expect(stripStyle({a: undefined})).toEqual({a: undefined});
  });
});
