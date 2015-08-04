// copied directly from https://github.com/facebook/rebound-js
// rewritten for babel/.eslintrc

const colorCache = {};
// Here are a couple of function to convert colors between hex codes and RGB
// component values. These are handy when performing color
// tweening animations.

export function hexToRGB(c) {
  let color = c;
  if (colorCache[color]) {
    return colorCache[color];
  }
  color = color.replace('#', '');
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  const parts = color.match(/.{2}/g);

  const ret = {
    r: parseInt(parts[0], 16),
    g: parseInt(parts[1], 16),
    b: parseInt(parts[2], 16),
  };

  colorCache[color] = ret;
  return ret;
}

export function rgbToHex(red, green, blue) {
  let r = red.toString(16);
  let g = green.toString(16);
  let b = blue.toString(16);
  r = r.length < 2 ? '0' + r : r;
  g = g.length < 2 ? '0' + g : g;
  b = b.length < 2 ? '0' + b : b;
  return '#' + r + g + b;
}
