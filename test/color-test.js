import * as color from '../src/color';

describe('color utilities', () => {
  it('should convert from hex to rgb', () => {
    expect(color.hexToRGB('#fff')).toEqual({r: 255, g: 255, b: 255});
  });
  it('should convert from rgb to hex', () => {
    expect(color.rgbToHex({r: 255, g: 255, b: 255})).toEqual('#fff');
  });
});
