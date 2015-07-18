import expect from 'expect';
import filterRight from '../src/filterRight';

describe('filterRight', () => {
  it('should keep items the callback returns truthy for', () => {
    let array = [1, 2, 3, 4];
    const callback = item => item % 2;
    filterRight(array, callback);

    expect(array).toContain(1);
    expect(array).toContain(3);
    expect(array).toNotContain(2);
    expect(array).toNotContain(4);
  });

  it('should pass argument to callback', () => {
    let array = [1];
    const callback = (item, argument) => {
      expect(argument).toEqual('foo');
    };

    filterRight(array, callback, 'foo');
  });
});
