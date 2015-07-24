import filter from '../src/filter';

describe('filter', () => {
  it('should keep items the callback returns truthy for', () => {
    const array = [1, 2, 3, 4];
    const callback = (_, item) => item % 2;
    const result = filter(array, callback);

    expect(result).toContain(1);
    expect(result).toContain(3);
    expect(result).not.toContain(2);
    expect(result).not.toContain(4);
  });

  it('should pass argument to callback', () => {
    const array = [1];
    const callback = (argument) => {
      expect(argument).toEqual('foo');
    };

    filter(array, callback, 'foo');
  });

  it('should iterate over items added while filtering', () => {
    const array = [1];
    let pushed = false;
    const callback = () => {
      if (!pushed) {
        array.push(2);
        pushed = true;
      }
      return true;
    };

    const result = filter(array, callback);

    expect(result).toEqual([1, 2]);
  });
});
