import mapTree from '../src/mapTree';
import React from 'react';

describe('mapTree', () => {
  it('should map numbers leaves correctly', () => {
    const add1 = (_, a) => a + 1;
    expect(mapTree(add1, 1)).toEqual(2);
    expect(mapTree(add1, [])).toEqual([]);
    expect(mapTree(add1, {})).toEqual({});
    expect(mapTree(add1, {a: 1})).toEqual({a: 2});
    expect(mapTree(add1, {a: [1, {b: 2}]})).toEqual({a: [2, {b: 3}]});
  });

  it('should be not infinitely recurse into structures we provide', () => {
    expect(mapTree(() => [1, 2], {a: [1, {b: 2}]}))
      .toEqual({a: [[1, 2], {b: [1, 2]}]});
  });

  it('should not call f on non-ground types', () => {
    let add1 = {
      f: () => {
        throw new Error('asd');
      },
    };
    const now = new Date();
    const MyClass = class {};
    const inst = new MyClass();
    const comp = <div key="a" />;
    expect(mapTree(add1.f, now)).toEqual(now);
    expect(mapTree(add1.f, MyClass)).toEqual(MyClass);
    expect(mapTree(add1.f, inst)).toEqual(inst);
    expect(mapTree(add1.f, comp)).toEqual(comp);
    expect(mapTree(add1.f, 'hi')).toEqual('hi');
  });
});
