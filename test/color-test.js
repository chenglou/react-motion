import * as color from '../src/color';

describe('color Utilities', () => {
  it('should convert from hex to rgb', () => {
    expect(color.hexToRGB('#ffffff')).toEqual({r: 255, g: 255, b: 255});
  });
  it('should convert from rgb to hex', () => {
    expect(color.rgbToHex(255, 255, 255)).toEqual('#ffffff');
  });

  it('should interpolate numbers in ranges', () => {
    let val = color.mapValueInRange(150, 100, 200, 0, -300);
    expect(val).toBe(-150);
  });

  it('should interpolate hex colors', () => {
    let middleColor = color.interpolateColor(0.5, '#ff0000', '#0000ff');
    expect(middleColor).toBe('#7f007f');
  });

  it('should interpolate hex colors with an optional input range', () => {
    let middleColor = color.interpolateColor(100, '#ff0000', '#0000ff', 0, 200);
    expect(middleColor).toBe('#7f007f');
  });

  it('should interpolate hex colors with an optional rgb return value', ()=> {
    let middleColor = color.interpolateColor(0.5, '#ff0000', '#0000ff', 0, 1, true);
    expect(middleColor).toBe('rgb(127,0,127)');
  });
});
