import expect from 'expect';
import * as animationLoop from '../src/animationLoop';

describe('reverseFilter', () => {
  it('should keep items the callback returns truthy for', () => {
    const array = [1, 2, 3, 4];
    const callback = item => item % 2;
    const result = animationLoop.reverseFilter(array, callback);

    expect(result).toContain(1);
    expect(result).toContain(3);
    expect(result).toNotContain(2);
    expect(result).toNotContain(4);
  });

  it('should pass argument to callback', () => {
    const array = [1];
    const callback = (item, argument) => {
      expect(argument).toEqual('foo');
    };

    animationLoop.reverseFilter(array, callback, 'foo');
  });

  it('should mutate the array', () => {
    const array = [1, 2, 3];
    const callback = () => false;

    expect(animationLoop.reverseFilter(array, callback)).toEqual(array);
  });
});
