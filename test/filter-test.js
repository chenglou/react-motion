import expect from 'expect';
import filter from '../src/filter';

describe('filterRight', () => {
  it('should keep items the callback returns truthy for', () => {
    const array = [1, 2, 3, 4];
    const callback = (_, item) => item % 2;
    const result = filter(array, callback);

    expect(result).toContain(1);
    expect(result).toContain(3);
    expect(result).toNotContain(2);
    expect(result).toNotContain(4);
  });

  it('should pass argument to callback', () => {
    const array = [1];
    const callback = (argument) => {
      expect(argument).toEqual('foo');
    };

    filter(array, callback, 'foo');
  });
});
